function formatMultiDayForecast(data, city) {
  if (!data || !data.list || data.list.length === 0) {
    return `Atsiprašome, nepavyko gauti kelių dienų orų prognozės miestui ${city}.`;
  }

  // Grupės prognozes pagal dieną
  const forecastsByDay = data.list.reduce((acc, forecast) => {
    const date = forecast.dt_txt.split(' ')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(forecast);
    return acc;
  }, {});

  let text = `Orų prognozė kelioms dienoms (*${city}*):\n\n`;

  // Imame prognozę kiekvienai dienai (pvz., vidurdienio)
  for (const date in forecastsByDay) {
    const dayForecasts = forecastsByDay[date];
    // Randame prognozę artimiausią 12:00
    const midDayForecast = dayForecasts.find(f => f.dt_txt.includes('12:00:00')) || dayForecasts[0];

    const forecastDate = new Date(midDayForecast.dt * 1000);
    const dayOfWeek = forecastDate.toLocaleDateString('lt-LT', { weekday: 'long' });
    const formattedDate = forecastDate.toLocaleDateString('lt-LT', { month: 'long', day: 'numeric' });

    const temp = Math.round(midDayForecast.main.temp);
    const description = midDayForecast.weather[0].description;

    text += `*${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}* (${formattedDate}):\n`;
    text += `  🌡️ Temperatūra: ${temp}°C\n`;
    text += `  🌤️ Oras: ${description}\n\n`;
  }

  return text.trim();
}

module.exports = { formatMultiDayForecast };
