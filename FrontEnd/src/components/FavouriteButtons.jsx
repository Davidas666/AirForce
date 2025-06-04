export default function FavouriteButtons({ user, cityName, favoriteCities, onAddFavorite, onRemoveFavorite }) {
  if (!user) {
    return (
      <span className="ml-3 text-sm text-gray-400">
        Please login to access Favourite cities functionality
      </span>
    );
  }
  return (
        <div>
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