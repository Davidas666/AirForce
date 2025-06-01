import HourlyWeatherCard from "./HourlyWeatherCard";

export default function HourlyWeatherSlider({ hourly, startIdx, setStartIdx }) {
  const visibleCount = 6;

  const handlePrev = () => setStartIdx(idx => Math.max(0, idx - 1));
  const handleNext = () => setStartIdx(idx => Math.min(hourly.length - visibleCount, idx + 1));

  const visibleHours = hourly.slice(startIdx, startIdx + visibleCount);

  return (
    <div className="flex justify-center w-full">
      <div className="relative flex items-center" style={{ width: "820px" }}>
        {startIdx > 0 && (
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 text-6xl font-bold text-gray-700 hover:text-blue-500 transition-all duration-150 p-0 m-0 drop-shadow-lg hover:scale-110 active:scale-90"
            onClick={handlePrev}
            aria-label="Previous hours"
            style={{
              background: "none",
              border: "none",
            }}
          >
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full">
              &#8592;
            </span>
          </button>
        )}
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-16 z-20"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.85), rgba(255,255,255,0.2), rgba(255,255,255,0))",
          }}
        />
        <div className="flex gap-2 w-full overflow-hidden justify-center">
          {visibleHours.map((item) => (
            <HourlyWeatherCard key={item.dt} item={item} />
          ))}
        </div>
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-16 z-20"
          style={{
            background:
              "linear-gradient(to left, rgba(255,255,255,0.85), rgba(255,255,255,0.2), rgba(255,255,255,0))",
          }}
        />
        {startIdx + visibleCount < hourly.length && (
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 text-6xl font-bold text-gray-700 hover:text-blue-500 transition-all duration-150 p-0 m-0 drop-shadow-lg hover:scale-110 active:scale-90"
            onClick={handleNext}
            aria-label="Next hours"
            style={{
              background: "none",
              border: "none",
            }}
          >
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full">
              &#8594;
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

//tesing .gitignore