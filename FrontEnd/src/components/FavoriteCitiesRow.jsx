import { useEffect, useState } from "react";

export default function FavoriteCitiesRow({ favoriteCities, onSelect, currentCity }) {
  return (
    <div className="w-full flex gap-2 px-6 py-2 bg-gray-50 border-b border-gray-200 justify-center">
      {favoriteCities.map(city => (
        <button
          key={city}
          className={`px-4 py-2 rounded-full font-semibold border transition ${
            city === currentCity
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
}