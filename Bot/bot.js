const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const winston = require('winston');
const menuHandler = require('./handlers/menuHandler');
const subscriptionHandler = require('./handlers/subscriptionHandler');
const stateManager = require('./handlers/stateManager');
const fetchClientCities = require('./helpers/fetchClientCities');
const { Markup } = require('telegraf');

const weatherHandler = require('./handlers/weatherHandler');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'bot.log' })
  ]
});

// Database connection is now handled within the subscription model.

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  logger.error('TELEGRAM_BOT_TOKEN not set!');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const userStates = {};

async function clearChat(chatId, keepMessages = 0) {
  const user = stateManager.getOrCreateUserState(userStates, chatId);
  if (!user.messages || user.messages.length <= keepMessages) return;

  const messagesToDelete = user.messages.slice(0, -keepMessages);
  for (const messageId of messagesToDelete) {
    try {
      await bot.deleteMessage(chatId, messageId);
    } catch (err) {
      if (err.response && err.response.body && err.response.body.description.includes('message to delete not found')) {
        logger.warn(`Bandant ištrinti pranešimą [chatId: ${chatId}, messageId: ${messageId}], jis jau buvo ištrintas.`);
      } else {
        logger.error(`Klaida trinant pranešimą [chatId: ${chatId}, messageId: ${messageId}]:`, err);
      }
    }
  }
  user.messages = user.messages.slice(-keepMessages);
}

bot.on('polling_error', (error) => {
  logger.error(`Polling error: ${error.code} - ${error.message}`);
});

// Įjungiame callback užklausas
bot.on('callback_query', (query) => {
  // Reikalinga, kad botas nebandytų atsakyti į callback'us, kuriuos jau apdorojome
  bot.answerCallbackQuery(query.id).catch(err => {
    logger.error('Klaida atsakant į callback:', err);
  });
});

logger.info('Botas paleistas ir pasiruošęs priimti komandas.');

// Paleidžiame automatinį pranešimų siuntimą
const scheduler = require('./scheduler');
scheduler.start(bot);

// Komanda /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  logger.info(`Vartotojas [chatId: ${chatId}] paspaudė /start`);
  await clearChat(chatId, 0);
  stateManager.resetState(userStates, chatId);
  await menuHandler.showMainMenu(bot, chatId, userStates, 'Sveiki! Aš esu AirForce bot. Pasirinkite veiksmą:');
});

// Apdorojame callback užklausas
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  
  try {
    await subscriptionHandler.handleCallbackQuery(bot, chatId, messageId, data, userStates);
  } catch (error) {
    logger.error(`Klaida apdorojant callback [chatId: ${chatId}]:`, error);
    try {
      await bot.answerCallbackQuery({
        callback_query_id: callbackQuery.id,
        text: 'Įvyko klaida. Bandykite dar kartą.'
      });
    } catch (e) {
      logger.error('Klaida siunčiant atsakymą į callback:', e);
    }
  }
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  // Ignoruojame žinutes be teksto arba komandas
  if (!msg.text || msg.text.startsWith('/')) return;

  try {
    const state = stateManager.getState(userStates, chatId);

    await clearChat(chatId, 0);
    logger.info(`Gauta žinutė [chatId: ${chatId}, text: ${msg.text}]`);

    // Dialogo žingsnių valdymas
    if (state?.step) {
      switch (state.step) {
        case 'city':
          await subscriptionHandler.handleCityStep(bot, chatId, userStates, msg.text);
          return;
        case 'frequency':
          await subscriptionHandler.handleFrequencyStep(bot, chatId, userStates, msg.text);
          return;
        case 'weather_city':
          await weatherHandler.handleWeatherCityStep(bot, chatId, userStates, msg.text);
          return;
      }
    }

    // Pagrindinio meniu komandų valdymas
    switch (msg.text) {
      case 'Prenumeruoti':
        await subscriptionHandler.startSubscriptionFlow(bot, chatId, userStates);
        break;
      case 'Mano prenumeratos':
        await subscriptionHandler.handleShowSubscriptions(bot, chatId, userStates);
        break;
      case 'Klientų miestai':
        await weatherHandler.handleClientCities(bot, chatId, userStates);
        break;
      case 'Orų prognozė':
        await weatherHandler.handleWeatherForecast(bot, chatId, userStates);
        break;
      case 'Pagalba':
        await menuHandler.showMainMenu(bot, chatId, userStates, 'Čia yra pagalbos tekstas. Susisiekite su mumis, jei turite klausimų.');
        break;
      case 'Grįžti atgal':
        stateManager.resetState(userStates, chatId);
        await menuHandler.showMainMenu(bot, chatId, userStates, 'Pasirinkite veiksmą:');
        break;
      default:
        await menuHandler.showMainMenu(bot, chatId, userStates, 'Nesupratau komandos. Pasirinkite iš meniu.');
        break;
    }
  } catch (err) {
    logger.error(`Klaida apdorojant žinutę [chatId: ${chatId}, text: ${msg.text}]:`, err);
  }
});

async function clearChat(chatId, leaveLastN = 1) {
  const toDelete = stateManager.clearMessages(userStates, chatId, leaveLastN);
  for (const msgId of toDelete) {
    try {
      await bot.deleteMessage(chatId, msgId);
    } catch (e) {
      logger.warn(`Nepavyko ištrinti žinutės [chatId: ${chatId}, msgId: ${msgId}]:`, e.message);
    }
  }
}