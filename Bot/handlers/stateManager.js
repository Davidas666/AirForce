// State management for AirForce bot
module.exports = {
  getState(states, chatId) {
    return states[chatId] || null;
  },

  getOrCreateUserState(states, chatId) {
    if (!states[chatId]) {
      states[chatId] = { messages: [] };
    }
    return states[chatId];
  },

  addMessage(states, chatId, messageId) {
    const user = this.getOrCreateUserState(states, chatId);
    user.messages.push(messageId);
  },

  setState(states, chatId, payload) {
    const user = this.getOrCreateUserState(states, chatId);
    Object.assign(user, payload);
  },

  clearMessages(states, chatId, leaveLastN = 2) {
    const user = this.getOrCreateUserState(states, chatId);
    const messages = user.messages || [];
    const toDelete = messages.slice(0, Math.max(0, messages.length - leaveLastN));
    user.messages = messages.slice(-leaveLastN);
    return toDelete;
  },

  resetState(states, chatId) {
    const user = this.getOrCreateUserState(states, chatId);
    const messages = user.messages || [];
    // Reset state but keep message history for cleanup
    states[chatId] = { messages: messages };
  },

  setLastMenu(states, chatId, callback) {
    const user = this.getOrCreateUserState(states, chatId);
    user.lastMenu = callback;
  },

  async runLastMenu(states, chatId) {
    const user = this.getOrCreateUserState(states, chatId);
    if (typeof user.lastMenu === 'function') {
      await user.lastMenu();
    }
  }
};
