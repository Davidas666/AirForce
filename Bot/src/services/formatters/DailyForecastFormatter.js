const BaseFormatter = require('./BaseFormatter');
const HourlyForecastFormatter = require('./HourlyForecastFormatter');

class DailyForecastFormatter extends BaseFormatter {
  format() {
    const result = [];
    const hourlyFormatter = new HourlyForecastFormatter(this.weatherData, this.options);
    
    // Group forecasts by day
    const forecastsByDay = this.groupForecastsByDay();
    
    Object.entries(forecastsByDay).forEach(([date, dayForecasts]) => {
      // Add day header
      result.push(`\n📅 *${this.formatDate(dayForecasts[0].dt, { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      })}*`);
      
      // Add hourly forecasts for the day
      dayForecasts.forEach(forecast => {
        result.push(hourlyFormatter.format(forecast));
      });
      
      result.push('\n' + '─'.repeat(30) + '\n');
    });
    
    return result.join('\n');
  }
  
  groupForecastsByDay() {
    const groups = {};
    
    this.weatherData.list.forEach(forecast => {
      const date = this.formatDate(forecast.dt, { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      
      groups[date].push(forecast);
    });
    
    return groups;
  }
}

module.exports = DailyForecastFormatter;
