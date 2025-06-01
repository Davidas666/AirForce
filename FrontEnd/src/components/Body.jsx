import { useEffect, useState } from "react";
import { useUserCity } from "../hooks/useUserCity";
import HourlyWeatherCard from "./HourlyWeatherCard";

export default function Body({ selectedCity }) {
  const userCity = useUserCity();
  const [hourly, setHourly] = useState([]);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startIdx, setStartIdx] = useState(0);

  // Use selectedCity if provided, else fallback to userCity
  const cityToShow = selectedCity || userCity;

  useEffect(() => {
    if (!cityToShow) return;
    setLoading(true);
    setError("");
    setHourly([]);
    setCityName("");
    setCountry("");
    fetch(`/api/forecast/hourly/${encodeURIComponent(cityToShow)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Nepavyko gauti duomenų");
        return res.json();
      })
      .then((data) => {
        const now = new Date();
        // Find the latest forecast hour <= now
        let firstIdx = 0;
        for (let i = data.list.length - 1; i >= 0; i--) {
          const itemDate = new Date(data.list[i].dt_txt.replace(' ', 'T'));
          if (itemDate <= now) {
            firstIdx = i;
            break;
          }
        }
        setStartIdx(firstIdx);
        setHourly(data.list);
        setCityName(data.city.name);
        setCountry(data.city.country);
      })
      .catch((err) => setError("Klaida: " + err.message))
      .finally(() => setLoading(false));
  }, [cityToShow]);

  const handlePrev = () => setStartIdx((idx) => Math.max(0, idx - 1));
  const handleNext = () =>
    setStartIdx((idx) => Math.min(hourly.length - 8, idx + 1));

  const visibleHours = hourly.slice(startIdx, startIdx + 8);

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">
        Artimiausio miesto valandinė orų prognozė
      </h2>
      <div className="mb-2 text-gray-600">
        Miestas:{" "}
        <span className="font-semibold">
          {cityName || cityToShow || "..."}
          {country ? `, ${country}` : ""}
        </span>
      </div>
      {loading && <div>Kraunasi...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && visibleHours.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={handlePrev}
            disabled={startIdx === 0}
            aria-label="Ankstesnės valandos"
          >
            &#8592;
          </button>
          <div className="flex gap-4">
            {visibleHours.map((item) => (
              <HourlyWeatherCard key={item.dt} item={item} />
            ))}
          </div>
          <button
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={handleNext}
            disabled={startIdx + 8 >= hourly.length}
            aria-label="Kitos valandos"
          >
            &#8594;
          </button>
        </div>
      )}
    </div>
  );
}