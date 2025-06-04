import { useEffect, useState } from "react";
import { getUserFromCookie } from "../utils/auth";

export default function FavoriteWindow({ selectedCity, onSelect }) {
  const [favoriteCities, setFavoriteCities] = useState([]);
  const [user, setUser] = useState(getUserFromCookie());

  // Keep user in sync with cookie (in case of login/logout)
  useEffect(() => {
    const interval = setInterval(() => {
      setUser(getUserFromCookie());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch favorite cities from backend
  const fetchFavorites = () => {
    if (!user?.id) {
      setFavoriteCities([]);
      return;
    }
    fetch(`/api/favorite-cities?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setFavoriteCities(Array.isArray(data) ? data : []))
      .catch(() => setFavoriteCities([]));
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line
  }, [user]);

  // Add favorite city and refresh
  const handleAddFavorite = (city) => {
    if (!user?.id || !city || favoriteCities.includes(city)) return;
    fetch('/api/favorite-cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, city })
    })
      .then(fetchFavorites);
  };

  // Remove favorite city and refresh
  const handleRemoveFavorite = (city) => {
    if (!user?.id || !city) return;
    fetch('/api/favorite-cities', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, city })
    })
      .then(fetchFavorites);
  };

  // Render favorite cities row
  const renderFavoriteCitiesRow = () => (
    <div className="w-full flex gap-2 px-6 py-2 bg-gray-50 border-b border-gray-200 justify-center">
      {favoriteCities.map(city => (
        <button
          key={city}
          className={`px-4 py-2 rounded-full font-semibold border transition ${
            city === selectedCity
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
          }`}
          onClick={() => onSelect(city)}
        >
          {city}
        </button>
      ))}
      {favoriteCities.length === 0 && (
        <span className="text-gray-400">No favorite cities yet</span>
      )}
    </div>
  );

  // Render add/remove buttons for the selected city
  const renderButtons = () => (
    user?.id && selectedCity && (
      <div className="flex justify-center mt-2">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
          onClick={() => handleAddFavorite(selectedCity)}
          disabled={favoriteCities.includes(selectedCity)}
        >
          +
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded"
          onClick={() => handleRemoveFavorite(selectedCity)}
          disabled={!favoriteCities.includes(selectedCity)}
        >
          –
        </button>
      </div>
    )
  );

  if (!user?.id) {
    return (
      <span className="ml-3 text-sm text-gray-400">
        Please login to access Favourite cities functionality
      </span>
    );
  }

  return (
    <div>
      {renderFavoriteCitiesRow()}
      {renderButtons()}
    </div>
  );
}