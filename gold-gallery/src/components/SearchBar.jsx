import { useState, useMemo } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { Link } from "react-router-dom";
import { searchProducts } from "../services/ProductService";

function SearchBar() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const results = useMemo(() => {
    return searchProducts(debouncedQuery).slice(0, 5);
  }, [debouncedQuery]);

  const highlightText = (text, keyword) => {
    if (!keyword) return text;

    const parts = text.split(new RegExp(`(${keyword})`, "gi"));

    return parts.map((part, index) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={index} className="text-pink-500 font-bold">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="جستجو در طلا و جواهر..."
        className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 outline-none transition focus:border-pink-400 focus:bg-white"
      />

      {/* dropdown */}
      {results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg bg-white shadow-lg">
          {results.map((item) => (
            <Link
              key={item.id}
              to={`/product/${item.id}/${item.slug}`}
              className="block border-b px-4 py-2 hover:bg-gray-100"
              onClick={() => setQuery("")}
            >
              {highlightText(item.title, query)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
