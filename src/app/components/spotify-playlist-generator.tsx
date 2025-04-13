"use client";

import { useEffect, useState } from "react";
import { SelectableDropdown } from "./selectable-dropdown";
import { DropdownOption } from "./selectable-dropdown";
import { Profile } from "../types/responses/profile";
import { Track } from "../types/responses/track";

export default function SpotifyPlaylistGenerator({ profile }: { profile: Profile }) {
    const songTypes: DropdownOption<string>[] = [
        { name: "Top Songs", value: "top" },
        { name: "All Songs", value: "all" },
    ];
    const songCount: DropdownOption<number>[] = [
        { name: "10", value: 10 },
        { name: "20", value: 20 },
        { name: "30", value: 30 },
        { name: "40", value: 40 },
        { name: "50", value: 50 },
    ]
    const [selected, setSelected] = useState<DropdownOption<string>>(songTypes[0]);
    const [count, setCount] = useState<DropdownOption<number>>(songCount[0]);
    const [songs, setSongs] = useState<Track[]>([]);

    const retrieveTopSongs = async (count: number) => {
        const url = new URL("/api/v1/spotify/top-tracks", window.location.origin);
        url.searchParams.set("limit", count.toString());
        url.searchParams.set("offset", "0");
        const response = await fetch(url.toString(), {
          method: "GET" ,
          headers: {
            "Content-Type": "application/json",
          },
        })
        const data = await response.json();
        setSongs(data);
      }

    const retrieveAllSongs = async (count: number) => {
        const url = new URL("/api/v1/spotify/tracks", window.location.origin);
        url.searchParams.set("limit", count.toString());
        url.searchParams.set("offset", "0");
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            },
        })
        const data = await response.json();
        setSongs(data);
    }

    const createPlaylist = async () => {
      // Create new playlist
        const playlistCreationUrl = new URL("/api/v1/spotify/playlists", window.location.origin);
        const response = await fetch(playlistCreationUrl.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Test Playlist",
            userId: profile.id,
            description: "Created by Beat Switch"
          })
        })
        const data = await response.json();
        const playlistId = data.id;

        // Add current songs to new playlist
        const playlistAddUrl = new URL(`/api/v1/spotify/playlists/${playlistId}/tracks`, window.location.origin);
        const addResponse = await fetch(playlistAddUrl.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: songs.map(song => `spotify:track:${song.id}`)
          })
        })
        const playlistAddResponse = await addResponse.json();
    }

    useEffect(() => {
        switch (selected.value) {
            case "top":
                retrieveTopSongs(count.value);
                break;
            case "all":
                retrieveAllSongs(count.value);
                break;
        }
    }, [selected, count]);

    return (
        <div className="w-full md:w-[80%] lg:w-[70%] xl:w-[60%] 2xl:w-[50%] 3xl:w-[40%] transition-all duration-300 ease-in-out mx-auto bg-gray-50 text-gray-800 p-4 rounded-xl shadow-lg">
          <div className="flex gap-2">
            <SelectableDropdown options={songTypes} selected={selected} setSelected={setSelected} />
            <SelectableDropdown options={songCount} selected={count} setSelected={setCount} />
            <div className="flex-1 pb-2">
              <button onClick={createPlaylist} className="w-full bg-green-500 text-white p-1.5 text-sm/6 rounded-lg hover:bg-green-600 transition-colors">Generate</button>
            </div>
          </div>
          <div className="h-[500px] overflow-x-auto">
            <table className="w-full table-auto min-w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left text-gray-600">#</th>
                  <th className="p-2 text-left text-gray-600">Song</th>
                  <th className="p-2 text-left text-gray-600">Artist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {songs.map((song: Track, index: number) => (
                  <tr key={song.id} className="hover:bg-gray-100 transition-colors text-left">
                    <td className="p-2 text-gray-400">{index + 1}</td>
                    <td className="p-2 font-medium text-gray-900">{song.name}</td>
                    <td className="p-2 text-gray-700">{song.artists.map((artist: any) => artist.name).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
}
