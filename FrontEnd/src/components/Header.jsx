import { useState, useRef } from "react";
import { useUserCity } from "../hooks/useUserCity";
import UserCityDisplay from "./UserCityDisplay";

export default function Header({ onCitySelect, recent, handleSearch }) {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const userCity = useUserCity();
  const inputRef = useRef();

  const fetchSuggestions = async (value) => {
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }
    const res = await fetch(`air-force-owgn-git-backend-airforce-c861ebc0.vercel.app/api/cities?query=${encodeURIComponent(value)}`);
    const data = await res.json();
    setSuggestions(data);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);
    if (value.length >= 2) {
      fetchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleFocus = () => {
    if (city.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleSuggestionClick = (c) => {
    setCity(c.name);
    setShowSuggestions(false);
    handleSearch(c.name);
  };

  const handleSearchCity = (searchCity) => {
    const cityToSearch = searchCity || city.trim();
    if (!cityToSearch) return;
    setCity(cityToSearch);
    setShowSuggestions(false);
    if (onCitySelect) onCitySelect(cityToSearch);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchCity();
    }
  };

  return (
    <header className="w-full px-6 py-3 bg-white shadow z-50">
      <div className="flex flex-wrap items-center justify-between gap-4 w-full max-w-6xl mx-auto">
        <div className="flex items-center flex-shrink-0">
          <img src="/img/logo.jpg" alt="Logo" className="h-10 w-10 rounded" />
        </div>
        <div className="flex items-center flex-shrink-0">
          <span className="text-xl font-bold text-blue-700 whitespace-nowrap">
            AirForce Weather
          </span>
        </div>
        <div className="flex items-center flex-shrink-0 min-w-0 max-w-[220px]">
          <span className="whitespace-nowrap truncate text-gray-700">
            <UserCityDisplay city={userCity} onClick={() => onCitySelect(userCity)} />
          </span>
          {!userCity && (
            <span className="ml-2 text-gray-400 text-sm truncate max-w-[120px] overflow-hidden">
              Searching for nearest city...
            </span>
          )}
        </div>
        <div className="relative flex items-center flex-grow max-w-lg min-w-[220px]">
          <input
            ref={inputRef}
            type="text"
            className="border rounded-l px-3 py-2 min-w-0 w-full focus:outline-blue-400"
            placeholder="Search city..."
            value={city}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 flex-shrink-0"
            onClick={() => handleSearchCity()}
          >
            Search
          </button>
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 top-12 bg-white border rounded w-full max-w-lg z-50 shadow max-h-40 overflow-y-auto">
              {suggestions.map((c, idx) => (
                <li
                  key={c.name + c.country + idx}
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                  onMouseDown={() => handleSuggestionClick(c)}
                >
                  {c.name}, {c.country}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex gap-2 items-center flex-shrink-0 flex-nowrap max-w-[320px] overflow-x-auto">
          {recent.map((c, idx) => (
            <button
              key={c + idx}
              type="button"
              className="bg-gray-200 hover:bg-blue-200 text-gray-700 px-3 py-1 rounded-full text-sm transition flex-shrink-0"
              onClick={() => handleSearch(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}