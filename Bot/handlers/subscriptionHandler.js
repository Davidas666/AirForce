const { Markup } = require('telegraf');
const logger = require('../utils/logger');

/**
 * Prenumeratų valdymo klasė, atsakinga už prenumeratų kūrimą, rodymą ir šalinimą
 */
class SubscriptionHandler {
  /**
   * @param {Object} messageService - Paslauga žinučių siuntimui
   * @param {Object} subscriptionModel - Prenumeratų modelis
   * @param {Object} stateManager - Būsenos valdymo servisas
   * @param {Object} menuHandler - Meniu valdymo servisas
   */
  constructor(messageService, subscriptionModel, stateManager, menuHandler) {
    this.messageService = messageService;
    this.subscriptionModel = subscriptionModel;
    this.stateManager = stateManager;
    this.menuHandler = menuHandler;
    this.validFrequencies = ['1 kartą per dieną', '1 kartą per savaitę', '3 kartus per dieną'];
  }

  formatFrequency(sub) {
    const freq = [];
    if (sub.morning_forecast) freq.push('1x/dieną');
    if (sub.weekly_forecast) freq.push('1x/savaitę');
    if (sub.daily_thrice_forecast) freq.push('3x/dieną');
    return freq.length ? freq.join(', ') : 'be dažnio';
  }

  /**
   * Sukuria mygtukų klaviatūrą su prenumeratų sąrašu
   * @param {Array} subscriptions - Prenumeratų masyvas
   * @returns {Object} Inline klaviatūros objektas
   */
  createSubscriptionKeyboard(subscriptions) {
    const buttons = subscriptions.map(sub => ({
      text: `❌ ${sub.city} (${this.formatFrequency(sub)})`,
      callback_data: `delete_sub_${sub.city}`
    }));

    const keyboard = [];
    for (let i = 0; i < buttons.length; i += 2) {
      keyboard.push(buttons.slice(i, i + 2));
    }

    keyboard.push([{ text: '🔙 Grįžti atgal', callback_data: 'back_to_menu' }]);
    return Markup.inlineKeyboard(keyboard);
  }

  isValidCity(city) {
    return city && /^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-]{2,50}$/.test(city.trim());
  }

  async startSubscriptionFlow(chatId, userStates) {
    this.stateManager.setState(userStates, chatId, { step: 'city' });
    const messageId = await this.messageService.send(
      chatId,
      'Įveskite miestą, kurio orus norite prenumeruoti:',
      { reply_markup: { keyboard: [['Grįžti atgal']], resize_keyboard: true } }
    );
    this.stateManager.addMessage(userStates, chatId, messageId);
  }

  async handleCityStep(chatId, userStates, city) {
    if (!this.isValidCity(city)) {
      const messageId = await this.messageService.send(
        chatId,
        'Neteisingas miesto formatas. Įveskite miestą iš naujo:'
      );
      this.stateManager.addMessage(userStates, chatId, messageId);
      return;
    }

    this.stateManager.setState(userStates, chatId, {
      step: 'frequency',
      city: city.trim()
    });

    const messageId = await this.messageService.send(
      chatId,
      'Pasirinkite pranešimų dažnumą:',
      {
        reply_markup: {
          keyboard: [
            ['1 kartą per dieną'],
            ['1 kartą per savaitę'],
            ['3 kartus per dieną'],
            ['Grįžti atgal']
          ],
          resize_keyboard: true
        }
      }
    );
    this.stateManager.addMessage(userStates, chatId, messageId);
  }

  async handleFrequencyStep(chatId, userStates, frequency) {
    const state = this.stateManager.getState(userStates, chatId);
    if (!this.validFrequencies.includes(frequency)) {
      const messageId = await this.messageService.send(
        chatId,
        'Neteisingas dažnumas. Pasirinkite iš mygtukų.'
      );
      this.stateManager.addMessage(userStates, chatId, messageId);
      return;
    }

    const frequencyMap = {
      '1 kartą per dieną': { morning: true, weekly: false, dailyThrice: false },
      '1 kartą per savaitę': { morning: false, weekly: true, dailyThrice: false },
      '3 kartus per dieną': { morning: false, weekly: false, dailyThrice: true }
    };

    const { morning, weekly, dailyThrice } = frequencyMap[frequency];

    try {
      await this.subscriptionModel.addSubscription(
        chatId,
        state.city,
        morning,
        weekly,
        dailyThrice
      );

      this.stateManager.resetState(userStates, chatId);
      await this.menuHandler.showMainMenu(
        chatId,
        userStates,
        `Sėkmingai prenumeravote ${state.city} orus!`
      );
    } catch (error) {
      logger.error(`Klaida išsaugant prenumeratą: ${error}`);
      await this.messageService.send(
        chatId,
        'Įvyko klaida išsaugant prenumeratą. Bandykite dar kartą.'
      );
    }
  }

  async handleShowSubscriptions(chatId, userStates) {
    try {
      const subscriptions = await this.subscriptionModel.getUserSubscriptions(chatId);

      if (!subscriptions.length) {
        await this.menuHandler.showMainMenu(chatId, userStates, 'Neturite aktyvių prenumeratų.');
        return;
      }

      const keyboard = this.createSubscriptionKeyboard(subscriptions);
      const messageId = await this.messageService.send(
        chatId,
        'Jūsų prenumeratos. Spustelėkite norėdami pašalinti:',
        {
          ...keyboard,
          parse_mode: 'Markdown'
        }
      );

      this.stateManager.addMessage(userStates, chatId, messageId);
      this.stateManager.setState(userStates, chatId, {
        step: 'managing_subscriptions',
        subscriptions
      });
    } catch (error) {
      logger.error(`Klaida gaunant prenumeratas [chatId: ${chatId}]:`, error);
      await this.menuHandler.showMainMenu(
        chatId,
        userStates,
        'Nepavyko gauti prenumeratų. Bandykite vėliau.'
      );
    }
  }

  async handleCallbackQuery(bot, chatId, messageId, data, userStates) {
    const callbackQueryId = data.id;
    const callbackData = data.data || data;

    try {
      if (callbackData.startsWith('delete_sub_')) {
        const city = callbackData.replace('delete_sub_', '');

        await this.messageService.editMessage(
          chatId,
          messageId,
          `Ar tikrai norite pašalinti prenumeratą miestui ${city}?`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '✅ Taip', callback_data: `confirm_delete_${city}` },
                  { text: '❌ Ne', callback_data: 'back_to_subscriptions' }
                ]
              ]
            }
          }
        );

        this.stateManager.setState(userStates, chatId, {
          step: 'confirm_delete',
          cityToDelete: city,
          previousMessageId: messageId
        });

        await this.messageService.answerCallback(callbackQueryId, 'Pasirinkite veiksmą su prenumerata');
      } else if (callbackData.startsWith('confirm_delete_')) {
        const city = callbackData.replace('confirm_delete_', '');

        try {
          await this.subscriptionModel.deleteSubscription(chatId, city);
          const subscriptions = await this.subscriptionModel.getUserSubscriptions(chatId);

          if (!subscriptions.length) {
            await this.messageService.editMessage(
              chatId,
              messageId,
              'Sėkmingai pašalinta. Neturite likusių prenumeratų.'
            );
            this.stateManager.resetState(userStates, chatId);
            await this.menuHandler.showMainMenu(chatId, userStates, 'Prenumerata sėkmingai pašalinta!');
            return;
          }

          const keyboard = this.createSubscriptionKeyboard(subscriptions);
          await this.messageService.editMessage(
            chatId,
            messageId,
            'Jūsų prenumeratos. Spustelėkite norėdami pašalinti:',
            {
              ...keyboard,
              parse_mode: 'Markdown'
            }
          );

          this.stateManager.setState(userStates, chatId, {
            step: 'managing_subscriptions',
            subscriptions
          });

          await this.messageService.answerCallback(callbackQueryId, `Prenumerata ${city} pašalinta.`);
        } catch (error) {
          logger.error(`Klaida trinant prenumeratą ${city}:`, error);
          await this.messageService.answerCallback(
            callbackQueryId,
            'Nepavyko pašalinti prenumeratos. Bandykite dar kartą.',
            true
          );
        }
      } else if (callbackData === 'back_to_subscriptions' || callbackData === 'back_to_menu') {
        try {
          this.stateManager.resetState(userStates, chatId);
          await this.menuHandler.showMainMenu(chatId, userStates, 'Pasirinkite veiksmą:');
          await this.messageService.answerCallback(callbackQueryId, 'Grįžtama į pagrindinį meniu');
        } catch (menuError) {
          logger.error('Klaida grąžinant į meniu:', menuError);
          await this.messageService.answerCallback(
            callbackQueryId,
            'Įvyko klaida. Bandykite dar kartą.',
            true
          );
        }
      }
    } catch (error) {
      logger.error(`Klaida apdorojant callback [chatId: ${chatId}]:`, error);
      try {
        await this.messageService.answerCallback(
          callbackQueryId,
          'Įvyko klaida. Bandykite dar kartą.',
          true
        );
      } catch (e) {
        logger.error('Nepavyko išsiųsti klaidos pranešimo:', e);
      }
    }
  }
}

module.exports = SubscriptionHandler;
