"use client";

import { useEffect, useState } from "react";
import { Playlist } from "../types/responses/playlist";
import { createPlaylist, getSongsByISRC, addSongsToPlaylist } from "../apple/client";
import { Track } from "../types/responses/track";

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

    const transferPlaylist = async (playlist: Playlist) => {
      // Retrieve all tracks from the playlist
      const songs = await getSongsForPlaylist(playlist.id);
      
      // Create playlist in Apple Music
      // TODO: We need to better abstract this - This component is doing too much
      const appleMusicPlaylistId = await createPlaylist(playlist);

      // Lookup Apple Music track IDs using ISRC
      const songMappings = await getSongsByISRC(songs.map(song => song.isrc));

      // Add tracks to the playlist in Apple Music
      await addSongsToPlaylist(songs, songMappings, appleMusicPlaylistId);
    };

    async function getSongsForPlaylist(playlistId: string): Promise<Track[]> {
      const url = new URL(`/api/v1/spotify/playlists/${playlistId}/tracks`, window.location.origin);
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json();
      return data;
    }

    return (
        <div className="w-full transition-all duration-300 ease-in-out mx-auto bg-gray-50 text-gray-800 p-4 rounded-xl shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full table-auto min-w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left text-gray-600"></th>
                  <th className="p-2 text-left text-gray-600">Playlist</th>
                  <th className="p-2 text-left text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {playlists.map((playlist: Playlist, index: number) => (
                  <tr key={playlist.id} className="hover:bg-gray-100 transition-colors text-left" onClick={() => transferPlaylist(playlist)}>
                    {/* <td className="p-2 text-gray-400">{index + 1}</td> */}
                    <td>
                      <img src={playlist?.imageUrls[0]} alt="" className="w-16 h-16 p-2 rounded-xl" />
                    </td>
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
