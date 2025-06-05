import { useState } from "react";
import { getUserFromCookie } from "../utils/auth";
import { useUserCity } from "../hooks/useUserCity";
import { useHourlyWeather, useDailyWeather } from "../hooks/useWeatherData";
import HourlyWeatherSlider from "./HourlyWeatherSlider";
import DailyWeatherCard from "./DailyWeatherCard";
import TodayHourlyWeather from "./TodayHourlyWeather";
import ViewButtons from "./ViewButtons";

export default function Body({
  selectedCity,
  recent,
  setRecent,
  favoriteCities,
  onAddFavorite,
  onRemoveFavorite,
}) {
  const userCity = useUserCity();
  const [view, setView] = useState("hourly");
  const [startIdx, setStartIdx] = useState(0);
  const [todayStartIdx, setTodayStartIdx] = useState(0);
  const cityToShow = selectedCity || userCity;
  const user = getUserFromCookie();
  const [bodyError, setBodyError] = useState("");

  // Use hooks for data fetching
  const {
    hourly,
    cityName: hourlyCityName,
    country: hourlyCountry,
    loading: loadingHourly,
    error: errorHourly,
  } = useHourlyWeather(view === "hourly" ? cityToShow : null, setRecent, view);

  const {
    daily,
    cityName: dailyCityName,
    country: dailyCountry,
    loading: loadingDaily,
    error: errorDaily,
  } = useDailyWeather(view === "7days" ? cityToShow : null, setRecent, view);

  // Choose which data to show
  const cityName = view === "hourly" ? hourlyCityName : dailyCityName;
  const country = view === "hourly" ? hourlyCountry : dailyCountry;
  const loading = view === "hourly" ? loadingHourly : loadingDaily;
  const error = view === "hourly" ? errorHourly : errorDaily;

  return (
    <div
      className="mx-auto mt-10 p-6 bg-white rounded shadow flex gap-8 items-start"
      style={{ maxWidth: "1020px", minHeight: "500px" }}
    >
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold mb-4">
          Nearest city weather forecast
        </h2>
        <ViewButtons view={view} setView={setView} />

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
                <div className="mb-2 text-gray-600 flex items-center">
                  City:{" "}
                  <span className="font-semibold ml-1">
                    {view === "hourly" &&
                      (hourlyCityName || cityToShow || "...")}
                    {view === "today" && (cityToShow || "...")}
                    {view === "7days" && (dailyCityName || cityToShow || "...")}
                    {view === "hourly" && hourlyCountry && `, ${hourlyCountry}`}
                    {view === "7days" && dailyCountry && `, ${dailyCountry}`}
                  </span>
                </div>
                {loading && <div>Loading...</div>}
                {error && <div className="text-red-500">{error}</div>}

                {!loading &&
                  !error &&
                  view === "hourly" &&
                  hourly.length > 0 && (
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
    </div>
  );
}
