// src/components/SearchBar.jsx
import { useState, useEffect } from "react";
import { getAll, getFieldFromAll } from "../services/api";
import "../static/css/SearchBar.css";

/**
 * UNIVERSAL SEARCHBAR
 *
 * @param {string} collection - MongoDB collection name ("tracks", "artists", ...)
 * @param {function} onResults - callback called with results array
 * @param {object} options - optional config: { searchFields, filterFields, limit }
 */
export default function SearchBar({
  collection = "tracks",
  onResults,
  options = {},
}) {
  const {
    searchFields = ["title", "artist"],
    filterFields = [], // e.g. [{ name: "genre", label: "Genre" }]
    limit = 20,
  } = options;

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [loading, setLoading] = useState(false);

  // ===== Load filter options dynamically (for dropdowns) =====
  useEffect(() => {
    (async () => {
      const opts = {};
      for (const field of filterFields) {
        try {
          const values = await getFieldFromAll(collection, field.name);
          opts[field.name] = values || [];
        } catch (e) {
          console.warn(`Failed to load filter values for ${field.name}:`, e);
        }
      }
      setFilterOptions(opts);
    })();
  }, [collection, JSON.stringify(filterFields)]);

  // ===== Build MongoDB filter =====
  const buildFilter = () => {
    const parts = [];

    // 🔍 Text search
    if (query && searchFields.length > 0) {
      const orConditions = searchFields.map((f) => ({
        [f]: { $regex: query, $options: "i" },
      }));
      parts.push({ $or: orConditions });
    }

    // 🎚 Dropdown filters
    for (const [key, value] of Object.entries(filters)) {
      if (value) parts.push({ [key]: value });
    }

    if (parts.length === 0) return null;
    if (parts.length === 1) return parts[0];
    return { $and: parts };
  };

  // ===== Fetch documents (debounced) =====
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const filter = buildFilter();
        const result = await getAll(collection, { filter, limit });
        onResults(result.items || []);
      } catch (error) {
        console.error("SearchBar fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchData, 300);
    return () => clearTimeout(delay);
  }, [query, JSON.stringify(filters), collection, limit]);

  return (
    <div className="searchbar-container mt-4 flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="Rechercher..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 p-2 rounded bg-neutral-800 text-white"
      />

      {/* Dynamic filter dropdowns */}
      {filterFields.map((f) => (
        <select
          key={f.name}
          value={filters[f.name] || ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, [f.name]: e.target.value }))
          }
          className="p-2 rounded bg-neutral-800 text-white"
          title={`Filtrer par ${f.label}`}
        >
          <option value="">{`Tous ${f.label.toLowerCase()}s`}</option>
          {(filterOptions[f.name] || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ))}

      {loading && <p className="text-gray-400 text-sm">Chargement...</p>}
    </div>
  );
}
