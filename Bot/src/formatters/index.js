const MorningForecastFormatter = require('./MorningForecastFormatter');
const ThriceDailyForecastFormatter = require('./ThriceDailyForecastFormatter');
const WeeklyForecastFormatter = require('./WeeklyForecastFormatter');

class ForecastFormatterFactory {
  static create(type, weatherData, options = {}) {
    const formatters = {
      'morning': MorningForecastFormatter,
      'thrice_daily': ThriceDailyForecastFormatter,
      'weekly': WeeklyForecastFormatter
    };

    const FormatterClass = formatters[type];
    if (!FormatterClass) {
      throw new Error(`Unknown forecast type: ${type}`);
    }

    return new FormatterClass(weatherData, options);
  }
}

module.exports = {
  ForecastFormatterFactory,
  MorningForecastFormatter,
  ThriceDailyForecastFormatter,
  WeeklyForecastFormatter
};
