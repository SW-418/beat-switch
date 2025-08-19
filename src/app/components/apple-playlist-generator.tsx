"use client";

import { useEffect, useState } from "react";
import { SelectableDropdown } from "./selectable-dropdown";
import { DropdownOption } from "./selectable-dropdown";
import { Track } from "@/app/types/api/responses/track";

export default function ApplePlaylistGenerator({ musicKit }: { musicKit: typeof window.MusicKit }) {
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
        if (!musicKit || !musicKit.getInstance()) return;
        await musicKit.getInstance().authorize();
        const queryParams = {
            limit: count,
            offset: 0
        };
        // Apple Music APIs are even worse than Spotify 😭
        const result = await musicKit.getInstance().api.music('/v1/me/history/heavy-rotation', queryParams);
        console.log(result.data);
        // setSongs(data);
      }

    const retrieveAllSongs = async (count: number) => {
      if (!musicKit || !musicKit.getInstance()) return;
      await musicKit.getInstance().authorize();
      const queryParams = {
          limit: count,
          offset: 0
      };
      // Apple Music APIs are even worse than Spotify 😭
      const result = await musicKit.getInstance().api.music('/v1/me/library/songs', queryParams);
      console.log(result.data);

      // Extrac this into mapper class
      const tracks = result.data.data.map((track: any) => ({
        id: track.id,
        name: track.attributes.name,
        artists: track.attributes.artistName
      }));
      setSongs(tracks);
    }

    const createPlaylist = async () => {
      throw new Error("Not implemented");
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
                    <td className="p-2 text-gray-700">{song.artists}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
}
