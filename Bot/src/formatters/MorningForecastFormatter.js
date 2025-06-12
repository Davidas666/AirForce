const BaseFormatter = require('./BaseFormatter');

class MorningForecastFormatter extends BaseFormatter {
  format() {
    try {
      return `\n\n${this.getHourlyForecast()}`;
    } catch (error) {
      this.logger.error('Error formatting morning forecast:', error);
      return 'Nepavyko suformatuoti rytinės prognozės';
    }
  }

  getHourlyForecast() {
    if (!this.weatherData?.list || !Array.isArray(this.weatherData.list)) {
      return 'Nepavyko gauti orų duomenų';
    }
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    const todaysForecasts = this.weatherData.list.filter(forecast => {
      const date = new Date(forecast.dt * 1000);
      return date.getDate() === todayDate && date.getMonth() === todayMonth && date.getFullYear() === todayYear;
    });
    if (todaysForecasts.length === 0) {
      return 'Šiandienos prognozių nėra';
    }
    return todaysForecasts.map(forecast => {
      const time = new Date(forecast.dt * 1000).toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit', hour12: false });
      return `🕒 ${time} | 🌡️ ${forecast.main.temp}°C | 💧 ${forecast.main.humidity}% | 💨 ${forecast.wind.speed} m/s`;
    }).join('\n');
  }
}

module.exports = MorningForecastFormatter;
