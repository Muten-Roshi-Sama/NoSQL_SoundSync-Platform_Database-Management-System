import { useState } from "react";
import SearchBar from "../../components/SearchBar";
import "../../static/css/Artists.css";

export default function Artists() {
  const [artists, setArtists] = useState([]);

  return (
    <div className="artists-page">
      <h1 className="artists-title">Découvre de nouveaux artistes 🎶</h1>

      <SearchBar
        collection="artists"
        onResults={setArtists}
        options={{
          searchFields: ["name", "genre"],
          filterFields: [{ name: "country", label: "Pays" }],
          limit: 20,
        }}
      />

      <div className="artists-grid">
        {artists.map((artist) => (
          <div key={artist._id} className="artist-card">
            <div className="artist-photo bg-neutral-800 rounded-lg mb-3">
              👤
            </div>
            <p className="font-semibold truncate">{artist.name}</p>
            <p className="text-sm text-gray-400 truncate">{artist.genre}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
