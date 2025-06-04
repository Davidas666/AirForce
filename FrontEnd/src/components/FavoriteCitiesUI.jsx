import { useState } from 'react';

export default function FavoriteCitiesUI({ favoriteCities, setFavoriteCities }) {
  const [cityInput, setCityInput] = useState("");
  const addFavoriteCity = (city) => {
    if (city && !favoriteCities.includes(city)) {
      setFavoriteCities([...favoriteCities, city]);
      setCityInput("");
    }
  };
  const removeFavoriteCity = (city) => {
    setFavoriteCities(favoriteCities.filter(c => c !== city));
  };
  return (
    <div>
      <div className="flex mb-2">
        <input
          className="border rounded px-2 py-1 mr-2 flex-1"
          type="text"
          value={cityInput}
          onChange={e => setCityInput(e.target.value)}
          placeholder="Įveskite miestą"
        />
        <button className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded" onClick={() => addFavoriteCity(cityInput)}>
          Pridėti
        </button>
      </div>
      <ul>
        {favoriteCities.map(city => (
          <li key={city} className="flex items-center justify-between mb-1">
            <span>{city}</span>
            <button className="text-red-500 hover:underline ml-2" onClick={() => removeFavoriteCity(city)}>
              Pašalinti
            </button>
          </li>
        ))}
        {favoriteCities.length === 0 && <li className="text-gray-400">Nėra mėgstamų miestų</li>}
      </ul>
    </div>
  );
}
