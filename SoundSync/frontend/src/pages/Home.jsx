import { useState } from "react";
import SearchBar from "../components/SearchBar";
import Player from "../components/Player";

export default function Home() {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);

  return (
    <div className="p-6 text-white bg-neutral-950 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Découvre de nouveaux sons 🔥</h1>
      <SearchBar onResults={setTracks} />

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {tracks.map((track) => (
          <div
            key={track._id}
            onClick={() => setCurrentTrack(track)}
            className="bg-neutral-800 hover:bg-neutral-700 p-3 rounded cursor-pointer"
          >
            <p className="font-semibold">{track.title}</p>
            <p className="text-sm text-gray-400">{track.artist}</p>
          </div>
        ))}
      </div>

      <Player currentTrack={currentTrack} />
    </div>
  );
}
