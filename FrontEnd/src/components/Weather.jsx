import { useState } from 'react';

export default function Weather() {
  const [city, setCity] = useState('Vilnius');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState(() => localStorage.getItem('recentCity') || 'Vilnius');
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favCities') || '[]'));

  const fetchWeather = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setWeather(null);
    try {
      const res = await fetch(`/api/forecast/${city}`);
      if (!res.ok) throw new Error('Nepavyko gauti duomenų');
      const data = await res.json();
      setWeather(data);
      setRecent(city);
      localStorage.setItem('recentCity', city);
    } catch (err) {
      setError('Klaida: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => setCity('');
  const handleAddFavorite = () => {
    if (!favorites.includes(city)) {
      const updated = [...favorites, city];
      setFavorites(updated);
      localStorage.setItem('favCities', JSON.stringify(updated));
    }
  };
  const handleSelectFavorite = fav => setCity(fav);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Orų prognozė</h2>
      <form onSubmit={fetchWeather} className="mb-4 flex gap-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Įveskite miestą"
        />
        <button className="bg-blue-500 text-white px-4 py-1 rounded" type="submit" disabled={loading}>
          {loading ? 'Kraunasi...' : 'Ieškoti'}
        </button>
        <button type="button" className="bg-gray-200 px-2 py-1 rounded" onClick={handleClear}>Išvalyti</button>
        <button type="button" className="bg-yellow-400 px-2 py-1 rounded" onClick={handleAddFavorite} title="Pridėti prie mėgstamų">★</button>
      </form>
      {favorites.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {favorites.map(fav => (
            <button key={fav} className="text-blue-600 underline text-xs" onClick={() => handleSelectFavorite(fav)}>{fav}</button>
          ))}
        </div>
      )}
      <div className="text-xs text-gray-500 mb-2">Paskutinė paieška: {recent}</div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {weather && (
        <div className="bg-blue-100 p-4 rounded">
          <div className="text-lg font-semibold">{weather.name}</div>
          <div className="text-4xl">{Math.round(weather.main.temp)}°C</div>
          <div className="flex items-center gap-2">
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className="w-12 h-12"
            />
            <span>{weather.weather[0].description}</span>
          </div>
          <div>Vėjas: {weather.wind.speed} m/s</div>
        </div>
      )}
    </div>
  );
}
