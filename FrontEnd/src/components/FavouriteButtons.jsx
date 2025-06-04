export default function FavouriteButtons({ user, cityName, favoriteCities, onAddFavorite, onRemoveFavorite }) {
  if (!user) {
    return (
      <span className="ml-3 text-sm text-gray-400">
        Please login to access Favourite cities functionality
      </span>
    );
  }
  return (
    <>
      <button
        className={`ml-3 px-3 py-1 rounded-full bg-blue-500 text-white font-bold text-lg shadow hover:bg-blue-700 transition ${
          favoriteCities && favoriteCities.includes(cityName)
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
        onClick={() => onAddFavorite(cityName)}
        disabled={favoriteCities && favoriteCities.includes(cityName)}
        title={
          favoriteCities && favoriteCities.includes(cityName)
            ? "Jau yra mėgstamuose"
            : "Pridėti į mėgstamus"
        }
      >
        +
      </button>
      <button
        className={`ml-2 px-3 py-1 rounded-full bg-red-500 text-white font-bold text-lg shadow hover:bg-red-700 transition ${
          !favoriteCities || !favoriteCities.includes(cityName)
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
        onClick={() => onRemoveFavorite(cityName)}
        disabled={!favoriteCities || !favoriteCities.includes(cityName)}
        title={
          !favoriteCities || !favoriteCities.includes(cityName)
            ? "Nėra mėgstamuose"
            : "Pašalinti iš mėgstamų"
        }
      >
        –
      </button>
    </>
  );
}