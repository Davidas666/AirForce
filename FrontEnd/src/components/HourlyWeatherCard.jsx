export default function HourlyWeatherCard({ item }) {
  const dateObj = new Date(item.dt_txt || item.dt * 1000);
  const date = dateObj.toLocaleDateString();
  const dayShort = dateObj
    .toLocaleDateString("en-US", { weekday: "short" })
    .slice(0, 2);
  const hour = item.dt_txt
    ? item.dt_txt.slice(11, 16)
    : dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const temp = Math.round(item.main?.temp ?? item.temp);

  return (
    <div className="bg-blue-100 p-4 rounded shadow flex flex-col items-center box-border w-[130px] min-w-[130px] max-w-[130px]">
      <div className="text-xs text-gray-500 mb-1 w-full text-center">
        {date}
        <br />
        <span className="font-semibold">{dayShort}</span>
      </div>
      <div className="text-base text-gray-700 mb-1 w-full text-center">
        {hour}
      </div>
      <img
        src={`https://openweathermap.org/img/wn/${item.weather?.[0]?.icon || item.icon}@2x.png`}
        alt={item.weather?.[0]?.description || ""}
        className="w-12 h-12 mb-1"
      />
      <div className="text-xl font-bold w-full text-center">{temp}°C</div>
      <div className="text-xs text-gray-700 text-center mb-1 w-full break-words min-h-[32px]">
        {item.weather?.[0]?.description}
      </div>
      <div className="text-xs text-blue-500 mb-1 w-full text-center truncate">
        Wind: {item.wind?.speed ?? item.speed} m/s
      </div>
      <div className="text-xs text-gray-400 w-full text-center truncate">
        Humidity: {item.main?.humidity ?? item.humidity}%
      </div>
    </div>
  );
}