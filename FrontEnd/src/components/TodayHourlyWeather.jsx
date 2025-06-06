import { useEffect, useState } from "react";
import { getWeatherCache, setWeatherCache } from "../utils/weatherCache";
import HourlyWeatherSlider from "./HourlyWeatherSlider";

export default function TodayHourlyWeather({ city, startIdx, setStartIdx }) {
  const [todayHourly, setTodayHourly] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!city) return;

    // Try cache first
    const cached = getWeatherCache(city, "today");
    if (cached && cached.list && cached.list.length > 0) {
      setTodayHourly(cached.list);
      setLoading(false);
      setError("");
      return;
    }

    // If not cached, fetch and cache
    setLoading(true);
    setError("");
    setTodayHourly([]);
    const now = new Date();
    const currentHour = now.getHours();
    const cnt = 29 - currentHour;

    fetch(`/api/forecast/hourly/${encodeURIComponent(city)}/limited?cnt=${cnt}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        setWeatherCache(city, "today", data);
        setTodayHourly(data.list);
      })
      .catch((err) => setError("Error: " + err.message))
      .finally(() => setLoading(false));
  }, [city]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!todayHourly.length) return null;

  return (
    <HourlyWeatherSlider
      hourly={todayHourly}
      startIdx={startIdx}
      setStartIdx={setStartIdx}
    />
  );
}