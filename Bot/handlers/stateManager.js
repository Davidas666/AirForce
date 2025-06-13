// State management for AirForce bot
module.exports = {
  /**
   * Returns the state object for a given user by chatId.
   * @param {Object} states - Object containing all users' states
   * @param {number} chatId - Telegram chat ID
   * @returns {Object|null} The user's state object or null if not found
   */
  getState(states, chatId) {
    return states[chatId] || null;
  },

  /**
   * Returns the user's state object or creates one if it does not exist.
   * @param {Object} states - Object containing all users' states
   * @param {number} chatId - Telegram chat ID
   * @returns {Object} The user's state object
   */
  getOrCreateUserState(states, chatId) {
    if (!states[chatId]) {
      states[chatId] = { messages: [] };
    }
    return states[chatId];
  },

  /**
   * Adds a message to the user's state.
   * @param {Object} states - Object containing all users' states
   * @param {number} chatId - Telegram chat ID
   * @param {number} messageId - ID of the message to add
   */
  addMessage(states, chatId, messageId) {
    const user = this.getOrCreateUserState(states, chatId);
    user.messages.push(messageId);
  },

  /**
   * Sets the user's state to the provided payload.
   * @param {Object} states - Object containing all users' states
   * @param {number} chatId - Telegram chat ID
   * @param {Object} payload - New state payload
   */
  setState(states, chatId, payload) {
    const user = this.getOrCreateUserState(states, chatId);
    Object.assign(user, payload);
  },

  /**
   * Clears the user's messages, leaving the last N messages.
   * @param {Object} states - Object containing all users' states
   * @param {number} chatId - Telegram chat ID
   * @param {number} [leaveLastN=2] - Number of messages to leave
   * @returns {Array<number>} IDs of messages to delete
   */
  clearMessages(states, chatId, leaveLastN = 2) {
    const user = this.getOrCreateUserState(states, chatId);
    const messages = user.messages || [];
    const toDelete = messages.slice(0, Math.max(0, messages.length - leaveLastN));
    user.messages = messages.slice(-leaveLastN);
    return toDelete;
  },

  /**
   * Resets the user's state, keeping the message history for cleanup.
   * @param {Object} states - Object containing all users' states
   * @param {number} chatId - Telegram chat ID
   */
  resetState(states, chatId) {
    const user = this.getOrCreateUserState(states, chatId);
    const messages = user.messages || [];
    states[chatId] = { messages: messages };
  },

  /**
   * Sets the last menu callback for the user.
   * @param {Object} states - Object containing all users' states
   * @param {number} chatId - Telegram chat ID
   * @param {Function} callback - Last menu callback
   */
  setLastMenu(states, chatId, callback) {
    const user = this.getOrCreateUserState(states, chatId);
    user.lastMenu = callback;
  },

  /**
   * Runs the last menu callback for the user.
   * @param {Object} states - Object containing all users' states
   * @param {number} chatId - Telegram chat ID
   */
  async runLastMenu(states, chatId) {
    const user = this.getOrCreateUserState(states, chatId);
    if (typeof user.lastMenu === 'function') {
      await user.lastMenu();
    }
  }
};
