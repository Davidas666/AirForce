// Menu handler for AirForce bot
const stateManager = require('./stateManager');

const mainMenu = {
  reply_markup: {
    keyboard: [
      ['Prenumeruoti', 'Mano prenumeratos'],
      ['Klientų miestai', 'Orų prognozė'],
      ['Pagalba']
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  }
};

async function showMainMenu(bot, chatId, userStates, text, options = {}) {
  const sent = await bot.sendMessage(chatId, text, { ...mainMenu, ...options });
  stateManager.addMessage(userStates, chatId, sent.message_id);
  return sent;
}

async function showBackButton(bot, chatId, userStates, text) {
  const sent = await bot.sendMessage(chatId, text, {
    reply_markup: {
      keyboard: [['Grįžti atgal']],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
  stateManager.addMessage(userStates, chatId, sent.message_id);
  return sent;
}

module.exports = {
  mainMenu,
  showMainMenu,
  showBackButton
};