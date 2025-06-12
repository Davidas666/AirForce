class BaseFormatter {
  constructor(weatherData, options = {}) {
    this.weatherData = weatherData;
    this.options = options;
    this.locale = options.locale || 'lt-LT';
    this.timezone = options.timezone || 'Europe/Vilnius';
  }

  formatTemperature(temp, decimals = 0) {
    return `${Math.round(temp)}°C`;
  }

  formatWindSpeed(speed, decimals = 1) {
    return `${speed.toFixed(decimals)} m/s`;
  }

  formatHumidity(humidity) {
    return `${humidity}%`;
  }

  formatPressure(pressure) {
    return `${Math.round(pressure * 0.75)} mmHg`; // Convert hPa to mmHg
  }

  formatTime(timestamp, format = { hour: '2-digit', minute: '2-digit' }) {
    return new Date(timestamp * 1000).toLocaleTimeString(this.locale, {
      timeZone: this.timezone,
      ...format
    });
  }

  formatDate(timestamp, format = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) {
    return new Date(timestamp * 1000).toLocaleDateString(this.locale, {
      timeZone: this.timezone,
      ...format
    });
  }

  getWeatherEmoji(weatherCode) {
    const emojiMap = {
      // Clear
      800: '☀️',
      // Clouds
      801: '🌤️',
      802: '⛅',
      803: '🌥️',
      804: '☁️',
      // Rain
      500: '🌦️',
      501: '🌧️',
      502: '🌧️',
      503: '🌧️',
      504: '🌧️',
      // Thunderstorm
      200: '⛈️',
      201: '⛈️',
      202: '⛈️',
      // Snow
      600: '❄️',
      601: '🌨️',
      602: '🌨️',
      // Atmosphere
      701: '🌫️',
      711: '💨',
      721: '🌫️',
      731: '🌪️',
      741: '🌫️',
      751: '💨',
      761: '💨',
      762: '🌋',
      771: '💨',
      781: '🌪️'
    };
    
    return emojiMap[weatherCode] || '🌈';
  }

  formatWeatherDescription(weather) {
    const emoji = this.getWeatherEmoji(weather.id);
    return `${emoji} ${weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}`;
  }
}

module.exports = BaseFormatter;
