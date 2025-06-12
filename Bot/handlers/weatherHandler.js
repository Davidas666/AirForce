const fetchMultiDayForecast = require('../helpers/fetchMultiDayForecast');
const logger = require('../utils/logger');
const { ForecastFormatterFactory } = require('../src/formatters');

class WeatherHandler {
  /**
   * Handles the weather forecast menu selection
   * @param {number} chatId - User's chat ID
   * @param {Object} userStates - User states object
   */
  async handleWeatherForecast(chatId, userStates) {
    try {
      const msgId = await this.messageService.send(
        chatId,
        'Įveskite miesto pavadinimą, kurio orų prognozę norite pamatyti:'
      );
      this.stateManager.addMessage(userStates, chatId, msgId);
      this.stateManager.setState(userStates, chatId, {
        step: 'weather_city',
        previousMessageId: msgId
      });
    } catch (error) {
      logger.error('Klaida pradedant orų prognozės užklausą:', error);
      await this.messageService.send(
        chatId,
        'Įvyko klaida pradedant orų prognozės užklausą. Bandykite dar kartą.'
      );
    }
  }
  constructor(messageService, stateManager, menuHandler) {
    this.messageService = messageService;
    this.stateManager = stateManager;
    this.menuHandler = menuHandler;
    this.forecastApiBase = process.env.FORECAST_API_URL || 'http://localhost:3001/api';
  }

  async handleWeatherCityStep(chatId, userStates, city) {
    try {
      const messageId = await this.messageService.send(
        chatId,
        `Pasirinkite norimą orų prognozės tipą miestui *${city}*:`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Šiandienos orai', callback_data: `weather_today_${city}` }],
              [{ text: '3 dienų prognozė', callback_data: `weather_3days_${city}` }],
              [{ text: 'Grįžti atgal', callback_data: 'back_to_menu' }]
            ]
          }
        }
      );

      this.stateManager.setState(userStates, chatId, {
        step: 'weather_city_selected',
        city: city,
        previousMessageId: messageId
      });
    } catch (error) {
      logger.error(`Klaida apdorojant miesto pasirinkimą ${city}:`, error);
      await this.messageService.send(
        chatId,
        'Įvyko klaida apdorojant jūsų pasirinkimą. Bandykite dar kartą.'
      );
    }
  }



  async handleCallbackQuery(bot, chatId, messageId, data, userStates) {
    try {
      const callbackData = data.data || data;
      if (callbackData.startsWith('weather_today_')) {
        const city = callbackData.replace('weather_today_', '');
        await this.showWeatherForecast(chatId, userStates, city, 1);
        return;
      } else if (callbackData.startsWith('weather_3days_')) {
        const city = callbackData.replace('weather_3days_', '');
        await this.showWeatherForecast(chatId, userStates, city, 3);
        return;
      }
    } catch (error) {
      logger.error('Klaida apdorojant orų prognozės callback:', error);
      await this.messageService.send(
        chatId,
        'Įvyko klaida apdorojant jūsų užklausą. Bandykite dar kartą.'
      );
    }
  }

  async showWeatherForecast(chatId, userStates, city, days = 1) {
    try {
      const weatherData = await fetchMultiDayForecast(city);

      const forecastType = days === 1 ? 'thrice_daily' : 'weekly';

      const formatter = ForecastFormatterFactory.create(forecastType, weatherData, { 
        locale: 'lt-LT', 
        timezone: 'Europe/Vilnius' 
      });

      const message = await formatter.format();
      const messages = Array.isArray(message) ? message : [message];

      for (const msg of messages) {
        await this.messageService.send(chatId, msg, { parse_mode: 'HTML' });
        await new Promise(r => setTimeout(r, 500));
      }
    } catch (error) {
      logger.error(`Klaida rodant prognozę miestui ${city}:`, error);
      await this.messageService.send(chatId, `Nepavyko gauti orų prognozės miestui ${city}.`, { parse_mode: 'HTML' });
    }
  }
}

module.exports = WeatherHandler;