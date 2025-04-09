import { useEffect, useState } from "react";
import { Track } from "../types/responses/track";

export default function TopSongs() {
  const [topSongs, setTopSongs] = useState([]);
  const retrieveTopSongs = async () => {
    const url = new URL('/api/v1/spotify/top-tracks', window.location.origin);
    const response = await fetch(url.toString(), {
      method: 'GET' ,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json();
    setTopSongs(data.items);
  }

  useEffect(() => {
    retrieveTopSongs();
  }, []);

return (
  <div className="w-full md:w-[80%] lg:w-[70%] xl:w-[60%] 2xl:w-[50%] 3xl:w-[40%] transition-all duration-300 ease-in-out mx-auto bg-gray-50 text-gray-800 p-4 rounded-xl shadow-lg">
    <h2 className="text-2xl font-bold mb-4 text-gray-900">Your Top Songs</h2>
    <div className="overflow-x-auto">
      <table className="w-full table-auto min-w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left text-gray-600">#</th>
            <th className="px-4 py-2 text-left text-gray-600">Song</th>
            <th className="px-4 py-2 text-left text-gray-600">Artist</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
          {topSongs.map((song: Track, index: number) => (
            <tr key={song.id} className="hover:bg-gray-100 transition-colors text-left">
              <td className="px-4 py-2 text-gray-400">{index + 1}</td>
              <td className="px-4 py-2 font-medium text-gray-900">{song.name}</td>
              <td className="px-4 py-2 text-gray-700">{song.artists.map((artist: any) => artist.name).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}  
