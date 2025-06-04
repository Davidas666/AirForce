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

  // Fetch favorite cities on user change
  useEffect(() => {
    if (!user?.id) {
      setFavoriteCities([]);
      return;
    }
    fetch(`/api/favorite-cities?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setFavoriteCities(Array.isArray(data) ? data : []))
      .catch(() => setFavoriteCities([]));
  }, [user]);

  // Inline FavoriteCitiesRow
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

  return (
    <div>
      {renderFavoriteCitiesRow()}
    </div>
  );
}