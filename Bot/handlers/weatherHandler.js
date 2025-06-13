const { fetchMultiDayForecast, fetchHourlyForecast } = require('../helpers/fetchMultiDayForecast');
const logger = require('../utils/logger');
const { ForecastFormatterFactory } = require('../src/formatters');

/**
 * Handles weather-related user interactions for the AirForce Telegram bot.
 */
class WeatherHandler {
  /**
   * Starts the weather forecast flow by asking the user for a city name.
   * @param {number} chatId - Telegram chat ID of the user
   * @param {Object} userStates - Object containing all users' states
   * @returns {Promise<void>}
   */
  async handleWeatherForecast(chatId, userStates) {
    try {
      const msgId = await this.messageService.send(
        chatId,
        'Enter the city name for which you want to see the weather forecast:'
      );
      this.stateManager.addMessage(userStates, chatId, msgId);
      this.stateManager.setState(userStates, chatId, {
        step: 'weather_city',
        previousMessageId: msgId
      });
    } catch (error) {
      logger.error('Error starting weather forecast flow:', error);
      await this.messageService.send(
        chatId,
        'An error occurred while starting the weather forecast flow. Please try again.'
      );
    }
  }

  /**
   * Creates a new WeatherHandler instance.
   * @param {Object} messageService - Service for sending messages to Telegram
   * @param {Object} stateManager - State manager utility
   * @param {Object} menuHandler - Menu handler utility
   */
  constructor(messageService, stateManager, menuHandler) {
    this.messageService = messageService;
    this.stateManager = stateManager;
    this.menuHandler = menuHandler;
    this.forecastApiBase = process.env.FORECAST_API_URL || 'http://localhost:3001/api';
  }

  /**
   * Handles the step where the user selects the forecast type for a given city.
   * @param {number} chatId - Telegram chat ID of the user
   * @param {Object} userStates - Object containing all users' states
   * @param {string} city - City for which the forecast is requested
   * @returns {Promise<void>}
   */
  async handleWeatherCityStep(chatId, userStates, city) {
    try {
      const messageId = await this.messageService.send(
        chatId,
        `Select the desired weather forecast type for the city *${city}*:`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Today\'s weather', callback_data: `weather_today_${city}` }],
              [{ text: '3-day forecast', callback_data: `weather_3days_${city}` }],
              [{ text: 'Back to menu', callback_data: 'back_to_menu' }]
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
      logger.error(`Error handling city selection for ${city}:`, error);
      await this.messageService.send(
        chatId,
        'An error occurred while handling your selection. Please try again.'
      );
    }
  }

  /**
   * Handles the callback query when the user selects a forecast type from the inline menu.
   * @param {Object} bot - Telegram bot instance
   * @param {number} chatId - Telegram chat ID of the user
   * @param {number} messageId - Telegram message ID
   * @param {Object|string} data - Callback data from Telegram
   * @param {Object} userStates - Object containing all users' states
   * @returns {Promise<void>}
   */
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
      logger.error('Error handling weather forecast callback:', error);
      await this.messageService.send(
        chatId,
        'An error occurred while handling your request. Please try again.'
      );
    }
  }

  /**
   * Shows the weather forecast for a specific city and time range.
   * @param {number} chatId - Telegram chat ID of the user
   * @param {Object} userStates - Object containing all users' states
   * @param {string} city - City for which the forecast is requested
   * @param {number} [days=1] - Number of days for the forecast (1 for today, 3 for 3-day forecast)
   * @returns {Promise<void>}
   */
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