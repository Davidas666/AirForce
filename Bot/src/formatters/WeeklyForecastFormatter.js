const BaseFormatter = require('./BaseFormatter');

class WeeklyForecastFormatter extends BaseFormatter {
  format() {
    try {
      // Return as an array of message parts to handle long messages
      const forecast = this.getWeeklyForecast();
      return this.splitMessage(forecast);
    } catch (error) {
      this.logger.error('Error formatting weekly forecast:', error);
      return ['Nepavyko suformatuoti savaitės prognozės'];
    }
  }

  // Helper method to split messages that are too long
  splitMessage(message, maxLength = 4000) {
    const result = [];
    let currentPart = '';
    
    // Split by double newlines to keep day forecasts together
    const dayParts = message.split('\n\n');
    
    for (const part of dayParts) {
      // If adding this part would exceed max length, push current part and start new one
      if (currentPart.length + part.length + 2 > maxLength && currentPart.length > 0) {
        result.push(currentPart.trim());
        currentPart = '';
      }
      // Add the part to current message
      if (currentPart.length > 0) currentPart += '\n\n';
      currentPart += part;
    }
    
    // Add the last part if not empty
    if (currentPart.length > 0) {
      result.push(currentPart.trim());
    }
    
    return result;
  }

  formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('lt-LT', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: this.timezone 
    });
  }

  formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const dayNames = ['Sekmadienis', 'Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis'];
    const dayName = dayNames[date.getDay()];
    const formattedDate = date.toLocaleDateString('lt-LT', { timeZone: this.timezone });
    
    return `${dayName}, ${formattedDate}`;
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

  getWeeklyForecast() {
    const forecastsByDay = {};
    // Grupuoja prognozes pagal dieną
    this.weatherData.list.forEach(forecast => {
      const date = new Date(forecast.dt * 1000);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.getTime();
      if (!forecastsByDay[dateKey]) {
        forecastsByDay[dateKey] = [];
      }
      forecastsByDay[dateKey].push(forecast);
    });
    // Surūšiuoja dienas ir ima 7 dienas
    const sortedDays = Object.entries(forecastsByDay)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .slice(0, 7);
    // Kuriuos laikus rodyti (8, 12, 20 val.)
    const targetHours = [8, 12, 20];
    // Formatuoja kiekvienos dienos santrauką
    return sortedDays.map(([_, forecasts]) => {
      const dayForecast = [];
      dayForecast.push(`📅 ${this.formatDate(forecasts[0].dt)}`);
      // Randa artimiausią prognozę kiekvienam tiksliniam laikui
      targetHours.forEach(targetHour => {
        let closest = null;
        let minDiff = Infinity;
        forecasts.forEach(forecast => {
          const date = new Date(forecast.dt * 1000);
          const diff = Math.abs(date.getHours() - targetHour);
          if (diff < minDiff) {
            minDiff = diff;
            closest = forecast;
          }
        });
        if (closest) {
          const time = this.formatTime(closest.dt);
          const temp = Math.round(closest.main.temp);
          const weatherInfo = this.getWeatherEmoji(closest.weather[0].id.toString());
          dayForecast.push(`🕒 ${time} ${weatherInfo.emoji} ${temp}°C`);
        }
      });
      return dayForecast.join('\n');
    }).join('\n\n');
  }
}

module.exports = WeeklyForecastFormatter;
