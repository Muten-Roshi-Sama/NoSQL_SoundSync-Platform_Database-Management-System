import { useState, useEffect } from "react";
// import { searchTracks } from "../services/api";
import { getAll } from "../services/api";

// ----------------------------------------------------------------------
// Core Features to Implement

// 1. Text Search (title/artist)
// Input field with debounced search
// Builds MongoDB $regex filter

// 2. Genre Filter
// Dropdown to select genre (Rock, Jazz, Pop, etc.)
// Adds to filter: { genre: "Jazz" }

// 3. Sorting
// Dropdown to choose sort field (title, artist, popularity, release_date)
// Toggle between ascending/descending
// Builds sort array: [["title", 1]] or [["popularity", -1]]

// 4. Limit Control
// Dropdown to choose results per page (10, 20, 50)
// Updates the limit parameter

// 5. Pagination
// Previous/Next buttons
// Page number display
// Manages skip parameter (skip = page * limit)

// 6. Results Display
// Show total count
// Show current range (e.g., "Showing 1-20 of 150")











export default function SearchBar({ onResults }) {
  const [query, setQuery] = useState("");
  // const [genre, setGenre] = useState("");

  useEffect(() => {
    const fetchTracks = async () => {
      // Build filter only if there's a query
      let filter = null;
      if (query) {
        filter = {
          "$or": [
            { "title": { "$regex": query, "$options": "i" } },
            { "artist": { "$regex": query, "$options": "i" } }
          ]
        };
      }
      
      // CRUD
      const result = await getAll('tracks', { filter, limit: 20 });
      
      // Extract items array and pass to parent
      onResults(result.items || []);
    };

    const delayDebounce = setTimeout(fetchTracks, 300);
    return () => clearTimeout(delayDebounce);
  }, [query, onResults]);

  return (
    <div className="mt-4">
      <input
        type="text"
        placeholder="Rechercher un titre..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 rounded bg-neutral-800 text-white"
      />
    </div>
  );
}






















// export default function SearchBar({ onResults }) {
//   const [query, setQuery] = useState("");

//   useEffect(() => {
//     const fetchTracks = async () => {
//       const results = await searchTracks(query);
//       onResults(results);
//     };

//     const delayDebounce = setTimeout(fetchTracks, 300); // debounce 300ms
//     return () => clearTimeout(delayDebounce);
//   }, [query, onResults]);

//   return (
//     <div className="mt-4">
//       <input
//         type="text"
//         placeholder="Rechercher un titre..."
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         className="w-full p-2 rounded bg-neutral-800 text-white"
//       />
//     </div>
//   );
// }





// export default function search_bar({ onResults }) {
//   const [query, setQuery] = useState("");           // text search
//   const [genre, setGenre] = useState("");           // genre filter
//   const [sortField, setSortField] = useState("");   // field to sort by
//   const [sortOrder, setSortOrder] = useState(1);    // 1 = asc, -1 = desc
//   const [limit, setLimit] = useState(20);           // results per page
//   const [page, setPage] = useState(0);              // current page (0-indexed)
//   const [total, setTotal] = useState(0);            // total results
//   const [tracks, setTracks] = useState([]);         // current results
//   const [loading, setLoading] = useState(false); 

//   const buildFilter = () => {
//     const filters = [];
    
//     // Text search (title OR artist)
//     if (query) {
//       filters.push({
//         "$or": [
//           { "title": { "$regex": query, "$options": "i" } },
//           { "artist": { "$regex": query, "$options": "i" } }
//         ]
//       });
//     }
    
//     // Genre filter
//     if (genre) {
//       filters.push({ "genre": genre });
//     }
    
//     // Combine with $and if multiple filters
//     if (filters.length === 0) return null;
//     if (filters.length === 1) return filters[0];
//     return { "$and": filters };
//   };

//   const buildSort = () => {
//     if (!sortField) return null;
//     return [[sortField, sortOrder]];
//   };


//     useEffect(() => {
//       const fetchTracks = async () => {
//         setLoading(true);
//         try {
//           const filter = buildFilter();
//           const sort = buildSort();
//           const skip = page * limit;
          
//           const result = await getAll('tracks', { filter, sort, skip, limit });
          
//           setTracks(result.items || []);
//           setTotal(result.total || 0);
//         } catch (error) {
//           console.error("Error fetching tracks:", error);
//         } finally {
//           setLoading(false);
//         }
//     };
    
//     // Debounce text search
//     const timer = setTimeout(fetchTracks, 300);
//     return () => clearTimeout(timer);
    
//   }, [query, genre, sortField, sortOrder, page, limit]);



//   // Debounce text search
//   const timer = setTimeout(fetchTracks, 300);
//   return () => clearTimeout(timer);




// }


