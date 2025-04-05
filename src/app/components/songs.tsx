import { Track } from "@/services/Track";
import { useEffect, useState } from "react";

export default function Songs() {
  const [tracks, setTracks] = useState([]);

  const retrieveTracks = async (offset: number = 0) => {
    const url = new URL('/api/v1/spotify/tracks', window.location.origin);
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json();
    setTracks(data);
  }

  useEffect(() => {
    retrieveTracks();
  }, []);

  return (
    <div className="w-full overflow-auto max-h-[400px] md:w-[80%] lg:w-[70%] xl:w-[60%] 2xl:w-[50%] 3xl:w-[40%] transition-all duration-300 ease-in-out mx-auto bg-gray-100 text-gray-700 rounded-xl text-center">
      <div className="p-0">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b sticky top-0">
              <th>Song</th>
              <th>Artist</th>
              <th>Album</th>
              <th>Date Saved</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {tracks.map((track: Track) => (
              <tr className="border-b" key={track.id}>
                <td>{track.name}</td>
                <td>{track.artists.join(', ')}</td>
                <td>{track.album}</td>
                <td>{track.added_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
