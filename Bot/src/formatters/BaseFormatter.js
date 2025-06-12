const logger = require('../../utils/logger');

class BaseFormatter {
  constructor(weatherData, options = {}) {
    if (new.target === BaseFormatter) {
      throw new Error('BaseFormatter is an abstract class and cannot be instantiated directly');
    }
    
    this.weatherData = weatherData;
    this.locale = options.locale || 'lt-LT';
    this.timezone = options.timezone || 'Europe/Vilnius';
    this.isTest = options.isTest || false;
    this.logger = logger.child({ component: this.constructor.name });
  }

  format() {
    throw new Error('Method not implemented');
  }

  getHourlyForecast() {
    return '';
  }

  getWeeklyForecast() {
    return '';
  }
}

module.exports = BaseFormatter;
