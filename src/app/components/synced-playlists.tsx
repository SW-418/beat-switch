"use client";

import { useEffect, useState } from "react";
import { SyncPlaylist } from "../types/responses/sync-playlist";
import TransferClient from "../transfer/client";

// TODO: Refactor this w/ DI and react context/hooks
const transferClient = new TransferClient();

export default function SyncedPlaylists() {
    const [playlists, setPlaylists] = useState<SyncPlaylist[]>([]);

    useEffect(() => {
        retrievePlaylists();
    }, []);

    const retrievePlaylists = async () => {
        const url = '/api/v1/playlists';
        const response = await fetch(url);
        const playlists = await response.json();
        setPlaylists(playlists);
    }

    const mapPlaylistSongs = async (playlist: SyncPlaylist) => {
        transferClient.mapPlaylistSongs(playlist);
    }

    return (
        <div className="w-full transition-all duration-300 ease-in-out mx-auto bg-gray-50 text-gray-800 p-4 rounded-xl shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full table-auto min-w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left text-gray-600">ID</th>
                  <th className="p-2 text-left text-gray-600">Playlist Name</th>
                  <th className="p-2 text-left text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {playlists.map((playlist: SyncPlaylist) => (
                  <tr key={playlist.id} className="hover:bg-gray-100 transition-colors text-left" onClick={() => mapPlaylistSongs(playlist)}>
                    <td className="p-2 font-medium text-gray-900">{playlist.id}</td>
                    <td className="p-2 font-medium text-gray-900">{playlist.name}</td>
                    <td className="p-2 font-medium text-gray-900">{playlist.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
}
