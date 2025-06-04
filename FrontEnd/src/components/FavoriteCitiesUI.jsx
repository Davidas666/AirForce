import { useState } from 'react';

export default function FavoriteCitiesUI({ favoriteCities, setFavoriteCities, currentCity }) {
  return (
    <div>
      <div className="flex mb-2">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-700 text-white text-xl font-bold shadow disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          style={{ minWidth: 40, minHeight: 40 }}
          onClick={() => setFavoriteCities.add(currentCity)}
          disabled={!currentCity || favoriteCities.includes(currentCity)}
          title="Pridėti dabartinį miestą"
        >
          +
        </button>
      </div>
      <ul>
        {favoriteCities.map(city => (
          <li key={city} className="flex items-center justify-between mb-1">
            <span>{city}</span>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-700 text-white text-base font-bold ml-2 shadow transition-colors"
              style={{ minWidth: 32, minHeight: 32 }}
              onClick={() => setFavoriteCities.remove(city)}
              title={`Pašalinti ${city}`}
            >
              ×
            </button>
          </li>
        ))}
        {favoriteCities.length === 0 && <li className="text-gray-400">Nėra mėgstamų miestų</li>}
      </ul>
    </div>
  );
}
