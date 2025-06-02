import { useEffect, useState } from "react";
import HourlyWeatherSlider from "./HourlyWeatherSlider";

export default function TodayHourlyWeather({ city, startIdx, setStartIdx }) {
  const [todayHourly, setTodayHourly] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    setError("");

    const now = new Date();
    const currentHour = now.getHours();

    fetch(`https://air-force-git-backend-airforce-c861ebc0.vercel.app/api/forecast/hourly/${encodeURIComponent(city)}/limited?cnt=${29 -currentHour}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => setTodayHourly(data.list))
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