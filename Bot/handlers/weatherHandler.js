const fetchClientCities = require('../helpers/fetchClientCities');
const fetchMultiDayForecast = require('../helpers/fetchMultiDayForecast');
const { formatMultiDayForecast } = require('../helpers/formatters');
const stateManager = require('./stateManager');
const menuHandler = require('./menuHandler');
const logger = require('../utils/logger');

async function handleClientCities(bot, chatId, userStates) {
  let text = '';
  try {
    const cities = await fetchClientCities();
    if (!Array.isArray(cities) || !cities.length) {
      text = 'Nėra klientų miestų duomenų.';
    } else {
      text = 'Klientų miestai:\n';
      for (const city of cities) {
        text += `• ${city.name || city.miestas || city}\n`;
      }
    }
  } catch (err) {
    logger.error(`Klaida gaunant klientų miestus:`, err);
    text = 'Nepavyko gauti klientų miestų. Bandykite vėliau.';
  }
  await menuHandler.showMainMenu(bot, chatId, userStates, text);
}

async function handleWeatherForecast(bot, chatId, userStates) {
  const sent = await bot.sendMessage(chatId, 'Įveskite miesto pavadinimą, kurio orų prognozės norite:');
  stateManager.addMessage(userStates, chatId, sent.message_id);
  stateManager.setState(userStates, chatId, { step: 'weather_city' });
}

async function handleWeatherCityStep(bot, chatId, userStates, city) {
  let text = '';
  try {
    const data = await fetchMultiDayForecast(city);
    text = formatMultiDayForecast(data, city);
  } catch (err) {
    logger.error(`Klaida gaunant kelių dienų orų prognozę miestui ${city}:`, err);
    text = 'Nepavyko gauti orų duomenų. Bandykite vėliau.';
  }
  stateManager.resetState(userStates, chatId);
  await menuHandler.showMainMenu(bot, chatId, userStates, text, { parse_mode: 'Markdown' });
}

module.exports = {
  handleClientCities,
  handleWeatherForecast,
  handleWeatherCityStep
};
