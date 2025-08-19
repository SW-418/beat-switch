"use client";

import { useEffect, useState } from "react";
import { SelectableDropdown } from "./selectable-dropdown";
import { DropdownOption } from "./selectable-dropdown";
import { Profile } from "@/app/types/api/responses/profile";
import { Track } from "@/app/types/api/responses/track";
import spotifyClient from "../spotify/client";

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const retrieveTopSongs = async (count: number) => {
        try {
            setLoading(true);
            setError(null);
            const data = await spotifyClient.getTopTracks(count);
            setSongs(data);
        } catch (error) {
            console.error('Error fetching top songs:', error);
            setError('Failed to fetch top songs');
            setSongs([]);
        } finally {
            setLoading(false);
        }
    }

    const retrieveAllSongs = async (count: number) => {
        try {
            setLoading(true);
            setError(null);
            const data = await spotifyClient.getAllTracks(count);
            setSongs(data);
        } catch (error) {
            console.error('Error fetching all songs:', error);
            setError('Failed to fetch songs');
            setSongs([]);
        } finally {
            setLoading(false);
        }
    }

    const createPlaylist = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Create new playlist
            const playlist = await spotifyClient.createPlaylist(
                "Test Playlist",
                profile.id,
                "Created by Beat Switch"
            );

            // Add current songs to new playlist
            const trackUris = songs.map(song => `spotify:track:${song.id}`);
            await spotifyClient.addTracksToPlaylist(playlist.id, trackUris);
            
            // TODO: Show success message or redirect to playlist
        } catch (error) {
            console.error('Error creating playlist:', error);
            setError('Failed to create playlist');
        } finally {
            setLoading(false);
        }
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
              <button 
                onClick={createPlaylist} 
                disabled={loading || songs.length === 0}
                className="w-full bg-green-500 text-white p-1.5 text-sm/6 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Generate'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="h-[500px] overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading tracks...</div>
              </div>
            ) : (
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
                      <td className="p-2 text-gray-700">{song.artists.map((artist: string) => artist).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      );
}
