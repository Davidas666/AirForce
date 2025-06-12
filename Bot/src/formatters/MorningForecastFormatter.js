const BaseFormatter = require('./BaseFormatter');

class MorningForecastFormatter extends BaseFormatter {
  format() {
    try {
      return `🌅 Rytinė prognozė\n\n${this.getHourlyForecast()}`;
    } catch (error) {
      this.logger.error('Error formatting morning forecast:', error);
      return 'Nepavyko suformatuoti rytinės prognozės';
    }
  }

  getHourlyForecast() {
    // Implementation for morning forecast
    const forecast = this.weatherData.list[0];
    return `🌡 Temperatūra: ${forecast.main.temp}°C
💧 Drėgmė: ${forecast.main.humidity}%
💨 Vėjo gūsiai: ${forecast.wind.speed} m/s`;
  }
}

module.exports = MorningForecastFormatter;
