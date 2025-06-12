// Menu handler for AirForce bot
const { Markup } = require('telegraf');

/**
 * Meniu valdymo klasė, atsakinga už visų meniu rodymą ir valdymą
 */
class MenuHandler {
  /**
   * @param {Object} messageService - Paslauga žinučių siuntimui
   * @param {Object} stateManager - Būsenos valdymo servisas
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
   * Rodo pagrindinį meniu
   * @param {number} chatId - Vartotojo chat ID
   * @param {Object} userStates - Vartotojų būsenų objektas
   * @param {string} [message='Pasirinkite veiksmą:'] - Pranešimo tekstas
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
      console.error('Klaida rodant pagrindinį meniu:', error);
      throw error;
    }
  }
}

module.exports = MenuHandler;