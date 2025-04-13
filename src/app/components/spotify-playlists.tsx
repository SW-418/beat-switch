"use client";

import { useEffect, useState } from "react";
import { Playlist } from "../types/responses/playlist";

export default function SpotifyPlaylists() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        retrievePlaylists();
    }, []);

    const retrievePlaylists = async () => {
        const url = new URL("/api/v1/spotify/playlists", window.location.origin);
        // TODO: Add limit and offset
        const response = await fetch(url.toString(), {
          method: "GET" ,
          headers: {
            "Content-Type": "application/json",
          },
        })
        const data = await response.json();
        setPlaylists(data);
    }

    const transferPlaylist = async (playlistId: string) => {
      alert(`Finna transfer ${playlistId}`);
      // Retrieve all tracks from the playlist
      const url = new URL(`/api/v1/spotify/playlists/${playlistId}/tracks`, window.location.origin);
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json();
      console.log(data);
      
      // Create playlist in Apple Music
      const appleMusicUrl = new URL("/v1/me/library/playlists", window.location.origin);
      const appleMusicResponse = await fetch(appleMusicUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description
        })
      })
      const appleMusicData = await appleMusicResponse.json();
      console.log(appleMusicData);

      // Lookup Apple Music track IDs using ISRC

      // Add tracks to the playlist in Apple Music
    };

    return (
        <div className="w-full md:w-[80%] lg:w-[70%] xl:w-[60%] 2xl:w-[50%] 3xl:w-[40%] transition-all duration-300 ease-in-out mx-auto bg-gray-50 text-gray-800 p-4 rounded-xl shadow-lg">
          <div className="h-[500px] overflow-x-auto">
            <table className="w-full table-auto min-w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left text-gray-600">#</th>
                  <th className="p-2 text-left text-gray-600">Playlist</th>
                  <th className="p-2 text-left text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {playlists.map((playlist: Playlist, index: number) => (
                  <tr key={playlist.id} className="hover:bg-gray-100 transition-colors text-left" onClick={() => transferPlaylist(playlist.id)}>
                    <td className="p-2 text-gray-400">{index + 1}</td>
                    <td className="p-2 font-medium text-gray-900">{playlist.name}</td>
                    <td className="p-2 text-gray-700">{playlist.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
}
