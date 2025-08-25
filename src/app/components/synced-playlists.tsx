"use client";

import { useEffect, useState } from "react";
import { SyncPlaylist } from "@/app/types/api/responses/sync-playlist";
import TransferClient from "../transfer/client";
import PlaylistClient from "@/app/playlist/client";

// TODO: Refactor this w/ DI and react context/hooks
const transferClient = new TransferClient();
const playListClient = new PlaylistClient();

export default function SyncedPlaylists() {
    const [playlists, setPlaylists] = useState<SyncPlaylist[]>([]);

    useEffect(() => { (async () => { await retrievePlaylists(); })() }, []);

    const retrievePlaylists = async () => {
        setPlaylists(await playListClient.getSyncPlaylists());
    }

    const mapPlaylistSongs = (playlist: SyncPlaylist) => {
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
                  <th className="p-2 text-left text-gray-600">Unmapped</th>
                  <th className="p-2 text-left text-gray-600">Mapped</th>
                  <th className="p-2 text-left text-gray-600">Manual Required</th>
                  <th className="p-2 text-left text-gray-600">Skipped</th>
                  <th className="p-2 text-left text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {playlists.map((playlist: SyncPlaylist) => {
                  const total = playlist.mappingCounts.readyToMap + playlist.mappingCounts.mapped + playlist.mappingCounts.manualMappingRequired + playlist.mappingCounts.skipped;
                  return (
                    <tr key={playlist.id} className="hover:bg-gray-100 transition-colors text-left">
                      <td className="p-2 font-medium text-gray-900">{playlist.id}</td>
                      <td className="p-2 font-medium text-gray-900">{playlist.name}</td>
                      <td className="p-2 font-medium text-gray-900">{playlist.status}</td>
                      <td className="p-2 font-medium text-gray-900">{playlist.mappingCounts.readyToMap}/{total}</td>
                      <td className="p-2 font-medium text-gray-900">{playlist.mappingCounts.mapped}/{total}</td>
                      <td className="p-2 font-medium text-gray-900">{playlist.mappingCounts.manualMappingRequired}/{total}</td>
                      <td className="p-2 font-medium text-gray-900">{playlist.mappingCounts.skipped}/{total}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => mapPlaylistSongs(playlist)}
                            className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 w-24"
                          >
                            Auto Map
                          </button>
                          {playlist.mappingCounts.manualMappingRequired > 0 && (
                            <button
                              onClick={() => window.location.href = `/manual-mapping?playlistId=${playlist.id}`}
                              className="bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600 w-24"
                            >
                              Manual Map
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
}
