class MessageService {
  /**
   * @param {Object} bot - Telegram bot objektas
   */
  constructor(bot) {
    this.bot = bot;
  }

  /**
   * Siunčia žinutę vartotojui
   * @param {number|string} chatId - Pokalbio ID
   * @param {string} text - Žinutės tekstas
   * @param {Object} [options] - Papildomi nustatymai
   * @returns {Promise<string>} Išsiųstos žinutės ID
   */

  async send(chatId, text, options = {}) {
    try {
      const sentMessage = await this.bot.sendMessage(chatId, text, options);
      return sentMessage.message_id;
    } catch (error) {
      console.error(`Klaida siunčiant žinutę į ${chatId}:`, error);
      throw error;
    }
  }

  /**
   * Ištrina žinutę
   * @param {number|string} chatId - Pokalbio ID
   * @param {string} messageId - Ištrinamos žinutės ID
   * @returns {Promise<boolean>} Ar pavyko ištrinti
   */
  async delete(chatId, messageId) {
    try {
      await this.bot.deleteMessage(chatId, messageId);
      return true;
    } catch (error) {
      if (error.response?.body?.description?.includes('message to delete not found')) {
        console.warn(`Žinutė ${messageId} jau buvo ištrinta`);
        return false;
      }
      console.error(`Klaida trinant žinutę ${messageId}:`, error);
      throw error;
    }
  }

  /**
   * Redaguoja egzistuojančią žinutę
   * @param {number|string} chatId - Pokalbio ID
   * @param {string} messageId - Redaguojamos žinutės ID
   * @param {string} text - Naujas žinutės tekstas
   * @param {Object} [options] - Papildomi nustatymai
   * @returns {Promise<boolean>} Ar pavyko atnaujinti
   */
  async editMessage(chatId, messageId, text, options = {}) {
    try {
      await this.bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        ...options,
        parse_mode: options.parse_mode || 'Markdown'
      });
      return true;
    } catch (error) {
      console.error(`Klaida redaguojant žinutę ${messageId}:`, error);
      throw error;
    }
  }

  /**
   * Siunčia atsakymą į callback užklausą
   * @param {string} callbackQueryId - Callback užklausos ID
   * @param {string} text - Atsakymo tekstas
   * @param {boolean} [showAlert=false] - Ar rodyti pranešimą kaip pranešimą
   * @returns {Promise<boolean>} Ar pavyko išsiųsti atsakymą
   */
  async answerCallback(callbackQueryId, text, showAlert = false) {
    try {
      await this.bot.answerCallbackQuery({
        callback_query_id: callbackQueryId,
        text: text.length > 200 ? text.substring(0, 197) + '...' : text, // Ensure text is not too long
        show_alert: showAlert
      });
      return true;
    } catch (error) {
      // Ignore timeout errors for old callbacks
      if (error.response?.body?.description?.includes('query is too old')) {
        console.warn(`Callback ${callbackQueryId} is too old, ignoring`);
        return false;
      }
      console.error('Klaida atsakant į callback užklausą:', error);
      throw error;
    }
  }
}

module.exports = MessageService;
