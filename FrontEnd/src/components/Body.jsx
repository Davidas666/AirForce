import { useEffect, useState } from "react";
import { useUserCity } from "../hooks/useUserCity";
import HourlyWeatherSlider from "./HourlyWeatherSlider";
import DailyWeatherCard from "./DailyWeatherCard";
import TodayHourlyWeather from "./TodayHourlyWeather";
import FavoriteCitiesSidebar from "./FavoriteCitiesSidebar";

export default function Body({ selectedCity, recent, setRecent }) {
  const userCity = useUserCity();
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startIdx, setStartIdx] = useState(0);
  const [todayStartIdx, setTodayStartIdx] = useState(0);
  const [view, setView] = useState("hourly");
  const cityToShow = selectedCity || userCity;

  useEffect(() => {
    if (view === "today") setTodayStartIdx(0);
  }, [view]);

  useEffect(() => {
    if (!cityToShow || (view !== "hourly" && view !== "today")) return;
    setLoading(true);
    setError("");
    setHourly([]);
    setCityName("");
    setCountry("");

    fetch(`/api/forecast/hourly/${encodeURIComponent(cityToShow)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        const now = new Date();
        let firstIdx = 0;
        for (let i = data.list.length - 1; i >= 0; i--) {
          const itemDate = new Date(data.list[i].dt_txt.replace(" ", "T"));
          if (itemDate <= now) {
            firstIdx = i;
            break;
          }
        }
        setStartIdx(firstIdx);
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
  }, [cityToShow, view, setRecent]);

  useEffect(() => {
    if (view !== "7days" || !cityToShow) return;
    setLoading(true);
    setError("");
    setDaily([]);

    fetch(`/api/forecast/daily/${encodeURIComponent(cityToShow)}?cnt=7`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
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
  }, [view, cityToShow, setRecent]);

  return (
    <div
      className="mx-auto mt-10 p-6 bg-white rounded shadow flex gap-8"
      style={{ maxWidth: "1020px" }}
    >
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold mb-4">Nearest city weather forecast</h2>
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded font-semibold border ${
              view === "today"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setView("today")}
          >
            Today
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold border ${
              view === "hourly"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setView("hourly")}
          >
            Hourly
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold border ${
              view === "7days"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setView("7days")}
          >
            7 days
          </button>
        </div>

        {!cityToShow && <div>Loading nearest city...</div>}

        {cityToShow && (
          <>
            {error && error.includes("Failed to fetch data") ? (
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="flex items-center gap-2 text-red-600 text-lg font-semibold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                    />
                  </svg>
                  <span>City not found</span>
                </div>
                <div className="text-gray-500 text-sm mt-1">
                  Please check the city name and try again.
                </div>
              </div>
            ) : (
              <>
                <div className="mb-2 text-gray-600">
                  City:{" "}
                  <span className="font-semibold">
                    {cityName || cityToShow || "..."}
                    {country ? `, ${country}` : ""}
                  </span>
                </div>
                {loading && <div>Loading...</div>}
                {error && <div className="text-red-500">{error}</div>}

                {!loading && !error && view === "hourly" && hourly.length > 0 && (
                  <HourlyWeatherSlider
                    hourly={hourly}
                    startIdx={startIdx}
                    setStartIdx={setStartIdx}
                  />
                )}

                {!loading && !error && view === "today" && cityToShow && (
                  <TodayHourlyWeather
                    city={cityToShow}
                    startIdx={todayStartIdx}
                    setStartIdx={setTodayStartIdx}
                  />
                )}

                {!loading && !error && view === "7days" && daily.length > 0 && (
                  <div className="flex justify-center w-full">
                    <div className="flex gap-2 w-full overflow-x-auto justify-center">
                      {daily.map((item) => (
                        <DailyWeatherCard key={item.dt} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      <FavoriteCitiesSidebar />
    </div>
  );
}