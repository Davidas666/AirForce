const BaseFormatter = require('./BaseFormatter');

class HourlyForecastFormatter extends BaseFormatter {
  format(forecast) {
    const time = this.formatTime(forecast.dt, { hour: '2-digit', minute: '2-digit' });
    const temp = this.formatTemperature(forecast.main.temp);
    const feelsLike = this.formatTemperature(forecast.main.feels_like);
    const weather = this.formatWeatherDescription(forecast.weather[0]);
    const wind = `💨 Vėjas: ${this.formatWindSpeed(forecast.wind.speed)}`;
    const humidity = `💧 Drėgmė: ${this.formatHumidity(forecast.main.humidity)}`;
    const pressure = `⏱️ Slėgis: ${this.formatPressure(forecast.main.pressure)}`;
    const visibility = forecast.visibility ? `👁️ Matomumas: ${(forecast.visibility / 1000).toFixed(1)} km` : '';
    
    // Add rain/snow if present
    let precipitation = '';
    if (forecast.rain && forecast.rain['3h']) {
      precipitation = `🌧️ Lietus (3h): ${forecast.rain['3h']} mm`;
    } else if (forecast.snow && forecast.snow['3h']) {
      precipitation = `❄️ Sniegas (3h): ${forecast.snow['3h']} mm`;
    }

    return [
      `🕒 *${time}* \`${temp}\` (jausmas: ${feelsLike})`,
      weather,
      wind,
      humidity,
      pressure,
      ...(visibility ? [visibility] : []),
      ...(precipitation ? [precipitation] : [])
    ].join('\n');
  }
}

module.exports = HourlyForecastFormatter;
