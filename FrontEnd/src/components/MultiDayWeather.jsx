import { useState } from 'react';

const CITIES = [
  'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena',
  'London', 'Paris', 'Berlin', 'Warsaw', 'Riga', 'Tallinn', 'Moscow', 'Stockholm', 'Helsinki', 'Copenhagen',
  'New York', 'Tokyo', 'Sydney', 'Madrid', 'Rome', 'Prague', 'Vienna', 'Budapest', 'Dublin', 'Oslo'
];

export default function MultiDayWeather() {
  const [city, setCity] = useState('Vilnius');
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);

  const fetchForecast = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setForecast(null);
    try {
      const res = await fetch(`/api/forecast/multi/${city}`);
      if (!res.ok) throw new Error('Nepavyko gauti duomenų');
      const data = await res.json();
      setForecast(data);
    } catch (err) {
      setError('Klaida: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCity(e.target.value);
    if (e.target.value.length > 1) {
      const filtered = CITIES.filter(c => c.toLowerCase().includes(e.target.value.toLowerCase()));
      setFilteredCities(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (cityName) => {
    setCity(cityName);
    setShowSuggestions(false);
  };

  const groupByDay = (list) => {
    const days = {};
    list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!days[date]) days[date] = [];
      days[date].push(item);
    });
    return days;
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">5 dienų orų prognozė</h2>
      <form onSubmit={fetchForecast} className="mb-4 flex gap-2 relative">
        <input
          className="border rounded px-2 py-1 flex-1"
          value={city}
          onChange={handleInputChange}
          onFocus={() => city.length > 1 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          placeholder="Įveskite miestą"
          autoComplete="off"
        />
        <button className="bg-blue-500 text-white px-4 py-1 rounded" type="submit" disabled={loading}>
          {loading ? 'Kraunasi...' : 'Ieškoti'}
        </button>
        <button type="button" className="bg-gray-200 px-2 py-1 rounded" onClick={() => setCity('')}>Išvalyti</button>
        {showSuggestions && filteredCities.length > 0 && (
          <ul className="absolute left-0 top-10 bg-white border rounded w-full z-10 max-h-40 overflow-y-auto shadow">
            {filteredCities.map(c => (
              <li
                key={c}
                className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
                onMouseDown={() => handleSelectSuggestion(c)}
              >
                {c}
              </li>
            ))}
          </ul>
        )}
      </form>
      <div className="text-xs text-gray-500 mb-2">Autocomplete: pradėkite vesti miesto pavadinimą ir pasirinkite iš sąrašo.</div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {forecast && (
        <div>
          <div className="text-lg font-semibold mb-4 text-center text-blue-700 tracking-wide">
            {forecast.city.name}, {forecast.city.country}
          </div>
          <div className="mb-4 text-xs text-gray-600 text-center">Rodoma prognozė kas 3 valandas. Paspauskite ant kortelės, kad matytumėte daugiau informacijos.</div>
          {Object.entries(groupByDay(forecast.list)).map(([date, items]) => (
            <div key={date} className="mb-6 p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg shadow-lg">
              <div className="font-bold mb-3 text-blue-900 text-center text-lg border-b pb-1 flex items-center justify-center gap-2">
                <span>{date}</span>
                <span className="text-xs text-gray-500">{new Date(date).toLocaleDateString('lt-LT', { weekday: 'long' })}</span>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                {items.map(item => (
                  <div
                    key={item.dt}
                    className="p-3 bg-white rounded-xl shadow flex flex-col items-center w-32 border border-blue-200 hover:scale-105 transition-transform duration-200 cursor-pointer"
                    title={`Slėgis: ${item.main.pressure} hPa\nDebesuotumas: ${item.clouds.all}%`}
                  >
                    <div className="text-sm text-gray-500 mb-1">{item.dt_txt.split(' ')[1].slice(0,5)}</div>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                      alt={item.weather[0].description}
                      className="w-14 h-14 mb-1 drop-shadow"
                    />
                    <div className="text-xl font-bold text-blue-700 mb-1">{Math.round(item.main.temp)}°C</div>
                    <div className="text-xs text-gray-700 text-center mb-1">{item.weather[0].description}</div>
                    <div className="text-xs text-blue-500 mb-1">Vėjas: {item.wind.speed} m/s</div>
                    <div className="text-xs text-gray-400">Jaučiasi kaip: {Math.round(item.main.feels_like)}°C</div>
                    <div className="text-xs text-gray-400">Drėgmė: {item.main.humidity}%</div>
                    <div className="text-xs text-gray-400">Slėgis: {item.main.pressure} hPa</div>
                    <div className="text-xs text-gray-400">Debesuotumas: {item.clouds.all}%</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
