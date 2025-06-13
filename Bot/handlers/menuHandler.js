/**
 * @file menuHandler.js
 * @module handlers/menuHandler
 * @description Atsakingas už AirForce boto meniu valdymą ir rodymą vartotojui.
 */
const { Markup } = require('telegraf');

/**
 * Meniu valdymo klasė, atsakinga už visų meniu rodymą ir valdymą.
 * @class
 */
class MenuHandler {
  /**
   * Sukuria naują MenuHandler egzempliorių.
   * @param {Object} messageService - Paslauga žinučių siuntimui Telegram'e
   * @param {Object} stateManager - Vartotojo būsenų valdymo servisas
   */
  constructor(messageService, stateManager) {
    this.messageService = messageService;
    this.stateManager = stateManager;
    this.mainMenu = [
      ['Prenumeruoti', 'Mano prenumeratos'],
      ['Orų prognozė'],
      ['Pagalba']
    ];
  }

  /**
   * Parodo pagrindinį boto meniu vartotojui.
   * @param {number} chatId - Vartotojo Telegram chat ID
   * @param {Object} userStates - Objektas, kuriame saugomos vartotojų būsenos
   * @param {string} [message='Pasirinkite veiksmą:'] - Pranešimo tekstas (neprivalomas)
   * @throws Klaida, jei nepavyksta parodyti meniu
   * @returns {Promise<void>}
   */
  async showMainMenu(chatId, userStates, message = 'Pasirinkite veiksmą:') {
    this.stateManager.resetState(userStates, chatId);
    try {
      const messageId = await this.messageService.send(
        chatId,
        message,
        {
          reply_markup: {
            keyboard: this.mainMenu,
            resize_keyboard: true,
            one_time_keyboard: false
          }
        }
      );
      this.stateManager.addMessage(userStates, chatId, messageId);
    } catch (error) {
      // Klaida bus išmesta į iškvietėją
      throw error;
    }
  }
}

module.exports = MenuHandler;