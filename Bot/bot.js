const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const winston = require('winston');

const MessageService = require('./services/MessageService');
const StateManager = require('./handlers/stateManager');
const MenuHandler = require('./handlers/menuHandler');
const SubscriptionHandler = require('./handlers/subscriptionHandler');
const WeatherHandler = require('./handlers/weatherHandler');
const SubscriptionModel = require('./models/subscriptionModel');
const scheduler = require('./scheduler');

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


const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const messageService = new MessageService(bot);
const stateManager = StateManager; 
const subscriptionModel = SubscriptionModel; 
const menuHandler = new MenuHandler(messageService, stateManager);
const subscriptionHandler = new SubscriptionHandler(
  messageService,
  subscriptionModel,
  stateManager,
  menuHandler
);
const weatherHandler = new WeatherHandler(messageService, stateManager, menuHandler);

const userStates = {};

scheduler.start(bot);

logger.info('Botas sėkmingai inicijuotas');

async function clearChat(chatId, keepMessages = 0) {
  const user = stateManager.getOrCreateUserState(userStates, chatId);
  
  if (user.lastUserMessageId) {
    if (!user.messages) user.messages = [];
    user.messages.push(user.lastUserMessageId);
  }
  
  if (!user.messages || user.messages.length <= keepMessages) return;

  const messagesToDelete = [...new Set(user.messages)]; 
  user.messages = []; 
  
  for (const messageId of messagesToDelete) {
    try {
      await bot.deleteMessage(chatId, messageId);
    } catch (err) {
      if (err.response?.body?.description) {
        if (!err.response.body.description.includes('message to delete not found')) {
          logger.warn(`Klaida trinant pranešimą [chatId: ${chatId}, messageId: ${messageId}]:`, err.message);
        }
      } else {
        logger.warn(`Klaida trinant pranešimą [chatId: ${chatId}, messageId: ${messageId}]:`, err);
      }
    }
  }
  
  if (user.lastUserMessageId) {
    delete user.lastUserMessageId;
  }
}

bot.on('polling_error', (error) => {
  logger.error(`Polling error: ${error.code} - ${error.message}`);
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  
  try {
    logger.info(`Gautas callback [chatId: ${chatId}, data: ${data}]`);
    
    await bot.answerCallbackQuery(callbackQuery.id).catch(err => {
      logger.error('Klaida atsakant į callback:', err);
    });
    
    const user = stateManager.getOrCreateUserState(userStates, chatId);
    user.lastCallbackData = data;
    
    if (data.startsWith('delete_sub_') || data.startsWith('confirm_delete_') || data === 'back_to_subscriptions' || data === 'back_to_menu') {
      await subscriptionHandler.handleCallbackQuery(
        bot, 
        chatId, 
        messageId, 
        {
          id: callbackQuery.id,
          data: data,
          from: callbackQuery.from
        }, 
        userStates
      );
    } 
    else if (
      data.startsWith('weather_today_') ||
      data.startsWith('weather_3days_')
    ) {
      await weatherHandler.handleCallbackQuery(
        bot,
        chatId,
        messageId,
        {
          id: callbackQuery.id,
          data: data,
          from: callbackQuery.from
        },
        userStates
      );
    } 
    else if (user.step === 'weather_city') {
      await weatherHandler.handleCallbackQuery(
        bot,
        chatId,
        messageId,
        {
          id: callbackQuery.id,
          data: data,
          from: callbackQuery.from
        },
        userStates
      );
    }
    else {
      logger.warn(`Neatpažintas callback tipas: ${data}`);
      await messageService.answerCallback(
        callbackQuery.id, 
        'Neatpažinta komanda',
        true
      );
    }
  } catch (error) {
    logger.error(`Klaida apdorojant callback [chatId: ${chatId}]:`, error);
    try {
      await messageService.answerCallback(
        callbackQuery.id, 
        'Įvyko klaida apdorojant jūsų užklausą. Bandykite dar kartą.',
        true
      );
    } catch (e) {
      logger.error('Nepavyko išsiųsti klaidos atsakymo į callback:', e);
    }
  }
});

logger.info('Botas paleistas ir pasiruošęs priimti komandas.');


bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  logger.info(`Vartotojas [chatId: ${chatId}] paspaudė /start`);
  
  try {
    await clearChat(chatId, 0);
    stateManager.resetState(userStates, chatId);
    await menuHandler.showMainMenu(
      chatId, 
      userStates, 
      'Sveiki! Aš esu AirForce bot. Pasirinkite veiksmą:'
    );
  } catch (error) {
    logger.error(`Klaida apdorojant /start komandą [chatId: ${chatId}]:`, error);
    try {
      await messageService.send(
        chatId,
        'Įvyko klaida inicijuojant pokalbį. Bandykite dar kartą.'
      );
    } catch (e) {
      logger.error('Nepavyko išsiųsti klaidos pranešimo:', e);
    }
  }
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  
  if (!msg.text) return;
  
  if (msg.message_id) {
    const user = stateManager.getOrCreateUserState(userStates, chatId);
    user.lastUserMessageId = msg.message_id;
  }
  
  if (msg.text.startsWith('/')) {
    return;
  }

  try {
    const state = stateManager.getState(userStates, chatId);
    await clearChat(chatId, 0);
    logger.info(`Gauta žinutė [chatId: ${chatId}, text: ${msg.text}]`);

    switch (msg.text) {
      case 'Prenumeruoti':
      case 'Mano prenumeratos':
      case 'Orų prognozė':
      case 'Pagalba':
      case 'Grįžti atgal':
        break;
      default:
        if (state?.step) {
          switch (state.step) {
            case 'city':
              await subscriptionHandler.handleCityStep(chatId, userStates, msg.text);
              return;
            case 'frequency':
              await subscriptionHandler.handleFrequencyStep(chatId, userStates, msg.text);
              return;
            case 'weather_city':
              await weatherHandler.handleWeatherCityStep(chatId, userStates, msg.text);
              return;
          }
        }
    }

    switch (msg.text) {
      case 'Prenumeruoti':
        await subscriptionHandler.startSubscriptionFlow(chatId, userStates);
        break;
      case 'Mano prenumeratos':
        await subscriptionHandler.handleShowSubscriptions(chatId, userStates);
        break;

      case 'Orų prognozė':
        await weatherHandler.handleWeatherForecast(chatId, userStates);
        break;
      case 'Pagalba':
        await menuHandler.showMainMenu(
          chatId, 
          userStates, 
          'Čia yra pagalbos tekstas. Susisiekite su mumis, jei turite klausimų.'
        );
        break;
      case 'Grįžti atgal':
        stateManager.resetState(userStates, chatId);
        await menuHandler.showMainMenu(chatId, userStates, 'Pasirinkite veiksmą:');
        return; 
      default:
        if (state?.step) {
          stateManager.resetState(userStates, chatId);
          await menuHandler.showMainMenu(chatId, userStates, 'Veiksmas atšauktas. Pasirinkite veiksmą:');
        } else {
          await menuHandler.showMainMenu(
            chatId, 
            userStates, 
            'Nesupratau komandos. Pasirinkite iš meniu.'
          );
        }
        break;
    }
  } catch (error) {
    logger.error(`Klaida apdorojant žinutę [chatId: ${chatId}, text: ${msg.text}]:`, error);
    try {
      await messageService.send(
        chatId,
        'Įvyko klaida apdorojant jūsų užklausą. Bandykite dar kartą.'
      );
    } catch (e) {
      logger.error('Nepavyko išsiųsti klaidos pranešimo:', e);
    }
  }
});
