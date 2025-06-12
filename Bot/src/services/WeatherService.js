const DailyForecastFormatter = require('./formatters/DailyForecastFormatter');
const HourlyForecastFormatter = require('./formatters/HourlyForecastFormatter');

class WeatherService {
  constructor(weatherData, options = {}) {
    this.weatherData = weatherData;
    this.options = options;
  }

  getDailyForecast() {
    const formatter = new DailyForecastFormatter(this.weatherData, this.options);
    return formatter.format();
  }

  getHourlyForecast() {
    const formatter = new HourlyForecastFormatter(this.weatherData, this.options);
    return this.weatherData.list.map(forecast => formatter.format(forecast)).join('\n\n');
  }

  static getWeatherSummary(weatherData) {
    if (!weatherData || !weatherData.list || weatherData.list.length === 0) {
      return 'Nepavyko gauti orų duomenų.';
    }

    const current = weatherData.list[0];
    const city = weatherData.city?.name || 'Nežinomas miestas';
    const country = weatherData.city?.country || '';
    
    return (
      `🌆 *${city}${country ? `, ${country}` : ''}*\n` +
      `🕒 Atnaujinta: ${new Date().toLocaleString('lt-LT')}\n\n`
    );
  }
}

module.exports = WeatherService;
