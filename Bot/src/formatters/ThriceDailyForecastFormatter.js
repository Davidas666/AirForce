const BaseFormatter = require('./BaseFormatter');

class ThriceDailyForecastFormatter extends BaseFormatter {
  format() {
    try {
      return `${this.getHeader()}\n\n${this.getHourlyForecast()}`;
    } catch (error) {
      this.logger.error('Error formatting thrice daily forecast:', error);
      return 'Nepavyko suformatuoti dienos prognozės';
    }
  }

  getHeader() {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: this.timezone,
      locale: this.locale
    };
    const formattedDate = now.toLocaleDateString(this.locale, options);
    return `📅 ${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}`;
  }

  formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString(this.locale, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: this.timezone 
    });
  }

  getWeatherEmoji(weatherCode) {
    const code = weatherCode.toString();
    // Map weather codes to emojis and English descriptions
    const weatherMap = {
      // Thunderstorm
      '200': { emoji: '⛈', desc: 'Thunderstorm with light rain' },
      '201': { emoji: '⛈', desc: 'Thunderstorm with rain' },
      '202': { emoji: '⛈', desc: 'Thunderstorm with heavy rain' },
      '210': { emoji: '🌩', desc: 'Light thunderstorm' },
      '211': { emoji: '🌩', desc: 'Thunderstorm' },
      '212': { emoji: '🌩', desc: 'Heavy thunderstorm' },
      '221': { emoji: '🌩', desc: 'Ragged thunderstorm' },
      '230': { emoji: '⛈', desc: 'Thunderstorm with light drizzle' },
      '231': { emoji: '⛈', desc: 'Thunderstorm with drizzle' },
      '232': { emoji: '⛈', desc: 'Thunderstorm with heavy drizzle' },
      
      // Drizzle
      '300': { emoji: '🌧', desc: 'Light intensity drizzle' },
      '301': { emoji: '🌧', desc: 'Drizzle' },
      '302': { emoji: '🌧', desc: 'Heavy intensity drizzle' },
      '310': { emoji: '🌧', desc: 'Light intensity drizzle rain' },
      '311': { emoji: '🌧', desc: 'Drizzle rain' },
      '312': { emoji: '🌧', desc: 'Heavy intensity drizzle rain' },
      '313': { emoji: '🌧', desc: 'Shower rain and drizzle' },
      '314': { emoji: '🌧', desc: 'Heavy shower rain and drizzle' },
      '321': { emoji: '🌧', desc: 'Shower drizzle' },
      
      // Rain
      '500': { emoji: '🌦', desc: 'Light rain' },
      '501': { emoji: '🌦', desc: 'Moderate rain' },
      '502': { emoji: '🌧', desc: 'Heavy intensity rain' },
      '503': { emoji: '🌧', desc: 'Very heavy rain' },
      '504': { emoji: '🌧', desc: 'Extreme rain' },
      '511': { emoji: '❄️', desc: 'Freezing rain' },
      '520': { emoji: '🌦', desc: 'Light intensity shower rain' },
      '521': { emoji: '🌧', desc: 'Shower rain' },
      '522': { emoji: '🌧', desc: 'Heavy intensity shower rain' },
      '531': { emoji: '🌧', desc: 'Ragged shower rain' },
      
      // Snow
      '600': { emoji: '🌨', desc: 'Light snow' },
      '601': { emoji: '❄️', desc: 'Snow' },
      '602': { emoji: '❄️', desc: 'Heavy snow' },
      '611': { emoji: '🌨', desc: 'Sleet' },
      '612': { emoji: '🌨', desc: 'Light shower sleet' },
      '613': { emoji: '🌨', desc: 'Shower sleet' },
      '615': { emoji: '🌨', desc: 'Light rain and snow' },
      '616': { emoji: '🌨', desc: 'Rain and snow' },
      '620': { emoji: '🌨', desc: 'Light shower snow' },
      '621': { emoji: '❄️', desc: 'Shower snow' },
      '622': { emoji: '❄️', desc: 'Heavy shower snow' },
      
      // Atmosphere
      '701': { emoji: '🌫', desc: 'Mist' },
      '711': { emoji: '🌫', desc: 'Smoke' },
      '721': { emoji: '🌫', desc: 'Haze' },
      '731': { emoji: '🌫', desc: 'Dust whirls' },
      '741': { emoji: '🌫', desc: 'Fog' },
      '751': { emoji: '🌫', desc: 'Sand' },
      '761': { emoji: '🌫', desc: 'Dust' },
      '762': { emoji: '🌋', desc: 'Volcanic ash' },
      '771': { emoji: '💨', desc: 'Squalls' },
      '781': { emoji: '🌪', desc: 'Tornado' },
      
      // Clear
      '800': { emoji: '☀️', desc: 'Clear sky' },
      
      // Clouds
      '801': { emoji: '🌤', desc: 'Few clouds' },
      '802': { emoji: '⛅️', desc: 'Scattered clouds' },
      '803': { emoji: '🌥', desc: 'Broken clouds' },
      '804': { emoji: '☁️', desc: 'Overcast clouds' }
    };
    
    // Return specific weather or default to clouds
    return weatherMap[code] || { emoji: '☁️', desc: 'Cloudy' };
  }

  getRainVolume(forecast) {
    if (forecast.rain && forecast.rain['3h'] !== undefined) {
      return `\n🌧️ Lietus (3h): ${forecast.rain['3h'].toFixed(2)} mm`;
    }
    return '';
  }

  getHourlyForecast() {
    // Suranda visus šiandienos intervalus (3 val. žingsniu)
    if (!this.weatherData?.list || !Array.isArray(this.weatherData.list)) {
      return 'Nepavyko gauti orų duomenų';
    }
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    // Filtruojame tik šiandienos prognozes
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

module.exports = ThriceDailyForecastFormatter;
