import { useEffect, useState } from "react";
import FavoriteCitiesRow from "./FavoriteCitiesRow";
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

  // Add favorite city
  const handleAddFavorite = (city) => {
    if (!user?.id || !city || favoriteCities.includes(city)) return;
    fetch('/api/favorite-cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, city })
    })
      .then(() => setFavoriteCities([...favoriteCities, city]));
  };

  // Remove favorite city
  const handleRemoveFavorite = (city) => {
    if (!user?.id || !city) return;
    fetch('/api/favorite-cities', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, city })
    })
      .then(() => setFavoriteCities(favoriteCities.filter((c) => c !== city)));
  };

  return (
    <div>
      <FavoriteCitiesRow
        favoriteCities={favoriteCities}
        onSelect={onSelect}
        currentCity={selectedCity}
      />
      {/* Example: Add/Remove buttons for the selected city */}
      {user?.id && selectedCity && (
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
      )}
    </div>
  );
}