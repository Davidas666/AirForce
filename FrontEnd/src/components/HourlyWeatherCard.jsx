export default function HourlyWeatherCard({ item }) {
  const date = item.dt_txt.slice(0, 10);
  const hour = item.dt_txt.slice(11, 16);
  const temp = Math.round(item.main.temp);

  return (
    <div className="bg-blue-100 p-6 rounded min-w-[110px] max-w-[110px] flex flex-col items-center shadow">
      <div className="text-xs text-gray-500 mb-1">{date}</div>
      <div className="text-base text-gray-700 mb-1">{hour}</div>
      <img
        src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
        alt={item.weather[0].description}
        className="w-14 h-14 mb-1"
      />
      <div className="text-2xl font-bold">{temp}°C</div>
      <div className="text-xs text-gray-700 text-center mb-1">
        {item.weather[0].description}
      </div>
      <div className="text-xs text-blue-500 mb-1">
        Vėjas: {item.wind.speed} m/s
      </div>
      <div className="text-xs text-gray-400">
        Drėgmė: {item.main.humidity}%
      </div>
    </div>
  );
}