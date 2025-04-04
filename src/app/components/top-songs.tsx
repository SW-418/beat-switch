import { useEffect, useState } from "react";

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
    <div className="w-full md:w-[80%] lg:w-[70%] xl:w-[60%] 2xl:w-[50%] 3xl:w-[40%] transition-all duration-300 ease-in-out mx-auto bg-gray-100 text-gray-700 p-4 rounded-xl text-center">
      <h2>Here's your top {topSongs.length} songs</h2>
      <div className="p-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b">
              <th>Song</th>
              <th>Artist</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {topSongs.map((song: any) => (
              <tr className="border-b" key={song.id}>
                <td>{song.name}</td>
                <td>{song.artists[0].name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}  
