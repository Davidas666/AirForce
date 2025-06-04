import { useState } from 'react';

export default function FavoriteCitiesUI({ favoriteCities, setFavoriteCities, currentCity }) {
  return (
    <div>
      <div className="flex mb-2">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold w-full disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={() => setFavoriteCities.add(currentCity)}
          disabled={!currentCity || favoriteCities.includes(currentCity)}
        >
          Pridėti dabartinį miestą
        </button>
      </div>
      <ul>
        {favoriteCities.map(city => (
          <li key={city} className="flex items-center justify-between mb-1">
            <span>{city}</span>
            <button className="text-red-500 hover:underline ml-2" onClick={() => setFavoriteCities.remove(city)}>
              Pašalinti
            </button>
          </li>
        ))}
        {favoriteCities.length === 0 && <li className="text-gray-400">Nėra mėgstamų miestų</li>}
      </ul>
    </div>
  );
}
