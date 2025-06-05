import { useState, useEffect, useRef } from "react";
import { getWeatherCache, setWeatherCache, clearWeatherCache } from "../utils/weatherCache";
export function useHourlyWeather(city, setRecent) {
  const [hourly, setHourly] = useState([]);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const prevCityRef = useRef();

  useEffect(() => {
    if (!city) return;

    if (prevCityRef.current && prevCityRef.current !== city) {
      clearWeatherCache(prevCityRef.current);
    }
    prevCityRef.current = city;

    setLoading(true);
    setError("");
    setHourly([]);
    setCityName("");
    setCountry("");

    // Try cache first
    const cached = getWeatherCache(city, "hourly");
    if (cached) {
      setHourly(cached.list);
      setCityName(cached.city.name);
      setCountry(cached.city.country);
      setLoading(false);
      return;
    }

    fetch(`/api/forecast/hourly/${encodeURIComponent(city)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        setWeatherCache(city, "hourly", data);
        setHourly(data.list);
        setCityName(data.city.name);
        setCountry(data.city.country);
        setRecent((prev) => {
          const filtered = prev.filter(
            (c) => c.toLowerCase() !== data.city.name.toLowerCase()
          );
          return [data.city.name, ...filtered].slice(0, 3);
        });
      })
      .catch((err) => setError("Error: " + err.message))
      .finally(() => setLoading(false));
  }, [city, setRecent]);

  return { hourly, cityName, country, loading, error };
}
export function useDailyWeather(city, setRecent, view) {
  const [daily, setDaily] = useState([]);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const prevCityRef = useRef();
  const prevViewRef = useRef();

  useEffect(() => {
    if (!city) return;

    // Only clear cache if city or view actually changed
    if (
      (prevCityRef.current && prevCityRef.current !== city) ||
      (prevViewRef.current && prevViewRef.current !== view)
    ) {
      clearWeatherCache(prevCityRef.current);
    }
    prevCityRef.current = city;
    prevViewRef.current = view;

    setLoading(true);
    setError("");
    setDaily([]);
    setCityName("");
    setCountry("");

    // Try cache first
    const cached = getWeatherCache(city, "7days");
    if (cached) {
      setDaily(cached.list);
      setCityName(cached.city.name);
      setCountry(cached.city.country);
      setLoading(false);
      return;
    }

    fetch(`/api/forecast/daily/${encodeURIComponent(city)}?cnt=7`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        setWeatherCache(city, "7days", data);
        setDaily(data.list);
        setCityName(data.city.name);
        setCountry(data.city.country);
        setRecent((prev) => {
          const filtered = prev.filter(
            (c) => c.toLowerCase() !== data.city.name.toLowerCase()
          );
          return [data.city.name, ...filtered].slice(0, 3);
        });
      })
      .catch((err) => setError("Error: " + err.message))
      .finally(() => setLoading(false));
  }, [city, setRecent, view]);

  return { daily, cityName, country, loading, error };
}