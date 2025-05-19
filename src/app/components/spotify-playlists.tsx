"use client";

import { useEffect, useState } from "react";
import { Playlist } from "../types/responses/playlist";
import SpotifyClient from "../spotify/client";

export default function SpotifyPlaylists() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        retrievePlaylists();
    }, []);

    const retrievePlaylists = async () => {
        const playlists = await SpotifyClient.getPlayLists();
        setPlaylists(playlists);
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
                <tr key={"create"} className="hover:bg-gray-100 transition-colors text-left" onClick={() => SpotifyClient.transferLikedSongs()}>
                    <td>
                      <img alt="" className="w-16 h-16 p-2 rounded-xl" />
                    </td>
                    <td className="p-2 font-medium text-gray-900">Liked Songs</td>
                    <td className="p-2 text-gray-700">Transfer all of your liked songs to Apple Music</td>
                  </tr>
                {playlists.map((playlist: Playlist) => (
                  <tr key={playlist.id} className="hover:bg-gray-100 transition-colors text-left" onClick={() => SpotifyClient.transferPlaylist(playlist)}>
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
