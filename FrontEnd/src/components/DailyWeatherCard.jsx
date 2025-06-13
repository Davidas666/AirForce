export default function DailyWeatherCard({ item }) {
  const dateObj = new Date(item.dt * 1000);

  // Format the day as a short string (e.g., "Mo", "Tu")
  const dayShort = dateObj
    .toLocaleDateString("en-US", { weekday: "short" })
    .slice(0, 2);

  // Format the date as a string (e.g., "10/01/2023")
  const date = dateObj.toLocaleDateString();

  // Return the card with weather information
  return (
    <div className="bg-blue-50 p-4 rounded shadow flex flex-col items-center w-[130px] min-w-[130px] max-w-[130px]">
      <div className="text-xs text-gray-500 mb-1 w-full text-center">
        {date}
        <br />
        <span className="font-semibold">{dayShort}</span>
      </div>
      <img
        src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
        alt={item.weather[0].description}
        className="w-12 h-12 mb-1"
      />
      <div className="text-lg font-bold w-full text-center">
        {Math.round(item.temp.day)}°C
      </div>
      <div className="text-xs text-gray-700 text-center mb-1 w-full break-words min-h-[32px]">
        {item.weather[0].description}
      </div>
      <div className="text-xs text-blue-500 mb-1 w-full text-center">
        Wind: {item.speed} m/s
      </div>
      <div className="text-xs text-gray-400 w-full text-center">
        Humidity: {item.humidity}%
      </div>
    </div>
  );
}
