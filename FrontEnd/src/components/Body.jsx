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
      })
      .catch((err) => setError("Klaida: " + err.message))
      .finally(() => setLoading(false));
  }, [cityToShow]);

  const handlePrev = () => setStartIdx((idx) => Math.max(0, idx - 1));
  const handleNext = () =>
    setStartIdx((idx) => Math.min(hourly.length - 6, idx + 1));

  const visibleHours = hourly.slice(startIdx, startIdx + 6);

  return (
    <div
      className="mx-auto mt-10 p-6 bg-white rounded shadow"
      style={{ maxWidth: "1020px" }}
    >
      <h2 className="text-2xl font-bold mb-4">
        Artimiausio miesto valandinė orų prognozė
      </h2>
      {!cityToShow && <div>Loading nearest city...</div>}
      {cityToShow && (
        <>
          {error && error.includes("Nepavyko gauti duomenų") ? (
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
                <span>Tokio miesto nerasta</span>
              </div>
              <div className="text-gray-500 text-sm mt-1">
                Patikrinkite miesto pavadinimą ir bandykite dar kartą.
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2 text-gray-600">
                Miestas:{" "}
                <span className="font-semibold">
                  {cityName || cityToShow || "..."}{" "}
                  {country ? `, ${country}` : ""}
                </span>
              </div>
              {loading && <div>Kraunasi...</div>}
              {error && <div className="text-red-500">{error}</div>}
              {!loading && !error && visibleHours.length > 0 && (
                <div className="flex justify-center w-full">
                  <div
                    className="relative flex items-center"
                    style={{ width: "820px" }}
                  >
                    {/* left arrow */}
                    <button
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-30 text-6xl font-bold text-gray-700 hover:text-blue-500 transition-all duration-150 p-0 m-0 drop-shadow-lg hover:scale-110 active:scale-90"
                      onClick={handlePrev}
                      disabled={startIdx === 0}
                      aria-label="Ankstesnės valandos"
                      style={{
                        pointerEvents: startIdx === 0 ? "none" : "auto",
                        background: "none",
                        border: "none",
                      }}
                    >
                      <span className="inline-flex items-center justify-center w-14 h-14 rounded-full">
                        &#8592;
                      </span>
                    </button>
                    {/* blur left edge */}
                    <div
                      className="pointer-events-none absolute left-0 top-0 h-full w-16 z-20"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(255,255,255,0.85), rgba(255,255,255,0.2), rgba(255,255,255,0))",
                      }}
                    />
                    {/* cards */}
                    <div className="flex gap-2 w-full overflow-hidden justify-center">
                      {visibleHours.map((item) => (
                        <HourlyWeatherCard key={item.dt} item={item} />
                      ))}
                    </div>
                    {/* blur right edge */}
                    <div
                      className="pointer-events-none absolute right-0 top-0 h-full w-16 z-20"
                      style={{
                        background:
                          "linear-gradient(to left, rgba(255,255,255,0.85), rgba(255,255,255,0.2), rgba(255,255,255,0))",
                      }}
                    />
                    {/* right arrow */}
                    <button
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-30 text-6xl font-bold text-gray-700 hover:text-blue-500 transition-all duration-150 p-0 m-0 drop-shadow-lg hover:scale-110 active:scale-90"
                      onClick={handleNext}
                      disabled={startIdx + 6 >= hourly.length}
                      aria-label="Kitos valandos"
                      style={{
                        pointerEvents:
                          startIdx + 6 >= hourly.length ? "none" : "auto",
                        background: "none",
                        border: "none",
                      }}
                    >
                      <span className="inline-flex items-center justify-center w-14 h-14 rounded-full">
                        &#8594;
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}