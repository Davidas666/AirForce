// Subscription dialog handler for AirForce bot
const subscriptionModel = require('../models/subscriptionModel');
const stateManager = require('./stateManager');
const menuHandler = require('./menuHandler');
const logger = require('../utils/logger');
const { Markup } = require('telegraf');

class SubscriptionHandler {
  constructor(messageService, subscriptionModel) {
    this.messageService = messageService;
    this.subscriptionModel = subscriptionModel;
    this.validFrequencies = ['1 kartą per dieną', '1 kartą per savaitę', '3 kartus per dieną'];
  }

  formatFrequency(sub) {
    const freq = [];
    if (sub.morning_forecast) freq.push('1x/dieną');
    if (sub.weekly_forecast) freq.push('1x/savaitę');
    if (sub.daily_thrice_forecast) freq.push('3x/dieną');
    return freq.length ? freq.join(', ') : 'be dažnio';
  }

  createSubscriptionKeyboard(subscriptions) {
    return Markup.inlineKeyboard(
      subscriptions.map(sub => [
        Markup.button.callback(
          `❌ ${sub.city} (${this.formatFrequency(sub)})`,
          `delete_sub_${sub.city}`
        )
      ]).concat([
        [Markup.button.callback('🔙 Grįžti atgal', 'back_to_menu')]
      ])
    );
  }

  isValidCity(city) {
    return city && /^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-]{2,50}$/.test(city.trim());
  }

  async startSubscriptionFlow(chatId, userStates) {
    stateManager.resetState(userStates, chatId);
    const messageId = await this.messageService.send(
      chatId, 
      'Įveskite miesto pavadinimą:', 
      { reply_markup: { keyboard: [['Grįžti atgal']], resize_keyboard: true } }
    );
    stateManager.addMessage(userStates, chatId, messageId);
    stateManager.setState(userStates, chatId, { step: 'city' });
  }

async function handleCityStep(bot, chatId, userStates, city) {
  if (!isValidCity(city)) {
    const sent = await bot.sendMessage(chatId, 'Neteisingas miesto formatas. Įveskite miestą iš naujo:');
    stateManager.addMessage(userStates, chatId, sent.message_id);
    return;
  }

  stateManager.setState(userStates, chatId, { step: 'frequency', city: city });
  const sent = await bot.sendMessage(chatId, 'Pasirinkite pranešimų dažnumą:', {
    reply_markup: {
      keyboard: [
        ['1 kartą per dieną'],
        ['1 kartą per savaitę'],
        ['3 kartus per dieną'],
        ['Grįžti atgal']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
  stateManager.addMessage(userStates, chatId, sent.message_id);
}

async function handleFrequencyStep(bot, chatId, userStates, frequency) {
  const state = stateManager.getState(userStates, chatId);
  if (!validFrequencies.includes(frequency.toLowerCase().trim())) {
    const sent = await bot.sendMessage(chatId, 'Neteisingas dažnumas. Pasirinkite iš mygtukų.');
    stateManager.addMessage(userStates, chatId, sent.message_id);
    return;
  }

  let morning_forecast = false, weekly_forecast = false, daily_thrice_forecast = false;
  if (frequency === '1 kartą per dieną') morning_forecast = true;
  if (frequency === '1 kartą per savaitę') weekly_forecast = true;
  if (frequency === '3 kartus per dieną') daily_thrice_forecast = true;

  await subscriptionModel.addSubscription(chatId, state.city, morning_forecast, weekly_forecast, daily_thrice_forecast);
  stateManager.resetState(userStates, chatId);
  await menuHandler.showMainMenu(bot, chatId, userStates, `Sėkmingai prenumeravote ${state.city} orus!`);
}

async function handleShowSubscriptions(bot, chatId, userStates) {
  try {
    const subscriptions = await subscriptionModel.getUserSubscriptions(chatId);
    if (!subscriptions.length) {
      await menuHandler.showMainMenu(bot, chatId, userStates, 'Neturite aktyvių prenumeratų.');
      return;
    }

    const keyboard = createSubscriptionKeyboard(subscriptions);
    const sent = await bot.sendMessage(
      chatId,
      'Jūsų prenumeratos. Spustelėkite norėdami pašalinti:',
      {
        ...keyboard,
        parse_mode: 'Markdown'
      }
    );
    
    stateManager.addMessage(userStates, chatId, sent.message_id);
    stateManager.setState(userStates, chatId, { 
      step: 'managing_subscriptions',
      subscriptions: subscriptions
    });
  } catch (err) {
    logger.error(`Klaida gaunant prenumeratas [chatId: ${chatId}]:`, err);
    await menuHandler.showMainMenu(bot, chatId, userStates, 'Nepavyko gauti prenumeratų. Bandykite vėliau.');
  }
}

async function handleCallbackQuery(bot, chatId, messageId, data, userStates) {
  try {
    if (data.startsWith('delete_sub_')) {
      const city = data.replace('delete_sub_', '');
      const subscription = await subscriptionModel.getSubscriptionById(chatId, city);
      
      if (!subscription) {
        await bot.answerCallbackQuery({ callback_query_id: data.id, text: 'Prenerata nerasta.' });
        return;
      }

      await subscriptionModel.deleteSubscription(chatId, city);
      
      // Atnaujiname prenumeratų sąrašą
      const subscriptions = await subscriptionModel.getUserSubscriptions(chatId);
      
      if (subscriptions.length === 0) {
        await bot.editMessageText(
          'Sėkmingai pašalinta. Neturite likusių prenumeratų.',
          { chat_id: chatId, message_id: messageId }
        );
        stateManager.resetState(userStates, chatId);
        await menuHandler.showMainMenu(bot, chatId, userStates, 'Prenerata sėkmingai pašalinta!');
        return;
      }

      const keyboard = createSubscriptionKeyboard(subscriptions);
      await bot.editMessageText(
        'Jūsų prenumeratos. Spustelėkite norėdami pašalinti:',
        {
          chat_id: chatId,
          message_id: messageId,
          ...keyboard,
          parse_mode: 'Markdown'
        }
      );
      
      stateManager.setState(userStates, chatId, { 
        step: 'managing_subscriptions',
        subscriptions: subscriptions
      });
      
      await bot.answerCallbackQuery({ callback_query_id: data.id, text: `Prenerata ${city} pašalinta.` });
    } else if (data === 'back_to_menu') {
      stateManager.resetState(userStates, chatId);
      await menuHandler.showMainMenu(bot, chatId, userStates, 'Pasirinkite veiksmą:');
    }
  } catch (error) {
    logger.error(`Klaida apdorojant callback [chatId: ${chatId}]:`, error);
    await bot.answerCallbackQuery({ callback_query_id: data.id, text: 'Įvyko klaida. Bandykite dar kartą.' });
  }
}

module.exports = SubscriptionHandler;
  