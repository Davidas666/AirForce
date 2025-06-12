import { useEffect, useState } from "react";
import { getUserFromCookie } from "../utils/auth";
import { useNavigate, useParams } from "react-router-dom";

export default function FavoriteWindow({ cityNotFound }) {
  const [favoriteCities, setFavoriteCities] = useState([]);
  const [user, setUser] = useState(getUserFromCookie());
  const navigate = useNavigate();
  const { city } = useParams();
  const selectedCity = city ? city.trim() : "";

  useEffect(() => {
    const interval = setInterval(() => {
      setUser(getUserFromCookie());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
  }, [user?.id, selectedCity]);

  // Helper: case-insensitive check
  const isFavorite = favoriteCities.some(
    (fav) => fav.toLowerCase() === selectedCity.toLowerCase()
  );

  // Add favorite city and refresh
  const handleAddFavorite = (city) => {
    if (!user?.id || !city || isFavorite) return;
    fetch("/api/favorite-cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, city }),
    }).then(fetchFavorites);
  };

  // Remove favorite city and refresh
  const handleRemoveFavorite = (city) => {
    if (!user?.id || !city || !isFavorite) return;
    fetch("/api/favorite-cities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, city }),
    }).then(fetchFavorites);
  };

  // Render favorite cities row
  const renderFavoriteCitiesRow = () => (
    <div className="w-full flex gap-2 px-6 py-2 bg-gray-50 border-b border-gray-200 justify-center">
      {favoriteCities.map((favCity) => (
        <button
          key={favCity}
          className={`px-4 py-2 rounded-full font-semibold border transition ${
            favCity.toLowerCase() === selectedCity.toLowerCase()
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
          }`}
          onClick={() => navigate(`/${encodeURIComponent(favCity)}`)}
        >
          {favCity}
        </button>
      ))}
      {favoriteCities.length === 0 && (
        <span className="text-gray-400">No favorite cities yet</span>
      )}
    </div>
  );

  // Render add/remove buttons for the selected city
  const renderButtons = () => {
    const disableAdd = isFavorite || cityNotFound || !selectedCity;
    const disableRemove = !isFavorite || cityNotFound || !selectedCity;
    return (
      user?.id && (
        <div className="flex justify-center mt-2">
          <button
            className={`bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-3 py-1 rounded-2xl mr-2 transition-opacity ${
              disableAdd ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => handleAddFavorite(selectedCity)}
            disabled={disableAdd}
            title={
              cityNotFound
                ? "City not found"
                : isFavorite
                ? "City is already in favorites"
                : "Add to favorites"
            }
            aria-disabled={disableAdd}
          >
            Add to Favorites
          </button>
          <button
            className={`bg-gradient-to-r from-red-500 to-pink-400 text-white px-3 py-1 rounded-2xl transition-opacity ${
              disableRemove ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => handleRemoveFavorite(selectedCity)}
            disabled={disableRemove}
            title={
              cityNotFound
                ? "City not found"
                : !isFavorite
                ? "City is not in favorites"
                : "Remove from favorites"
            }
            aria-disabled={disableRemove}
          >
            Remove from Favorites
          </button>
        </div>
      )
    );
  };

  if (!user?.id) {
    return (
      <div className="flex justify-center items-center w-full py-8">
        <span className="text-sm text-gray-400 text-center">
          Please login to access Favourite cities functionality
        </span>
      </div>
    );
  }

  return (
    <div>
      {renderFavoriteCitiesRow()}
      {renderButtons()}
    </div>
  );
}