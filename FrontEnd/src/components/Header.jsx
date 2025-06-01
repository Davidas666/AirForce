import { useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { useUserCity } from '../hooks/useUserCity';
import UserCityDisplay from './UserCityDisplay';

export default function Header({ onCitySelect }) {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef();
  const userCity = useUserCity();

  const fetchSuggestions = async (value) => {
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }
    const res = await fetch(`/api/cities?query=${encodeURIComponent(value)}`);
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
    if (onCitySelect) onCitySelect(c.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!city.trim()) return;
    setShowSuggestions(false);
    if (onCitySelect) onCitySelect(city.trim());
  };

   return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow relative">
      <div className="flex items-center gap-3 z-10">
        <img src="/img/logo.jpg" alt="Logo" className="h-10 w-10 rounded" />
        <span className="text-xl font-bold text-blue-700">AirForce Weather</span>
        <UserCityDisplay city={userCity} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex w-72 z-20 absolute left-1/2 -translate-x-1/2"
        autoComplete="off"
      >
        <input
          ref={inputRef}
          type="text"
          className="border rounded-l px-3 py-2 w-full focus:outline-blue-400"
          placeholder="Search city..."
          value={city}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
        >
          Search
        </button>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute left-0 top-12 bg-white border rounded w-full z-10 shadow max-h-40 overflow-y-auto">
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
        {error && (
          <div className="absolute left-0 top-12 bg-white border rounded w-full z-10 shadow px-3 py-2 text-red-500">
            {error}
          </div>
        )}
      </form>
    </header>
  );
}