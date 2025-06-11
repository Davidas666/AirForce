// Telegram bot pagrindinis failas
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const SubscriptionModel = require('./models/subscriptionModel');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const subscriptionModel = new SubscriptionModel(pool);
const express = require('express');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Nerastas TELEGRAM_BOT_TOKEN aplinkos kintamasis!');
  process.exit(1);
}

// Sukuriamas naujas bot instance
const bot = new TelegramBot(token, { polling: true });

// Prenumeratos dialogo būsena
const userStates = {};

// Start komanda
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Sveiki! Jūs sėkmingai užregistravote AirForce orų botą.');
});

bot.onText(/\/subscribe/, async (msg) => {
  const chatId = msg.chat.id;
  userStates[chatId] = { step: 'city' };
  bot.sendMessage(chatId, 'Įveskite miesto pavadinimą, kurio orus norite prenumeruoti:');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const state = userStates[chatId];
  if (!state) return;
  if (msg.text.startsWith('/')) return;

  if (state.step === 'city') {
    state.city = msg.text.trim();
    state.step = 'frequency';
    bot.sendMessage(chatId, 'Kaip dažnai norite gauti prognozę? Pasirinkite dažnumą:', {
      reply_markup: {
        keyboard: [['Vieną kartą per dieną'], ['Kartą per savaitę'], ['3 kartus per dieną']],
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
    return;
  }
  if (state.step === 'frequency') {
    let morning_forecast = false, weekly_forecast = false, daily_thrice_forecast = false;
    if (msg.text.toLowerCase().includes('vieną kartą per dieną')) {
      morning_forecast = true;
    } else if (msg.text.toLowerCase().includes('kartą per savaitę')) {
      weekly_forecast = true;
      state.step = 'day_of_week'; // Galite papildyti, jei norite išsaugoti savaitės dieną atskirai
      bot.sendMessage(chatId, 'Pasirinkite savaitės dieną, kada norite gauti prognozę:', {
        reply_markup: {
          keyboard: [['Pirmadienis','Antradienis','Trečiadienis'],['Ketvirtadienis','Penktadienis','Šeštadienis','Sekmadienis']],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
      state.morning_forecast = morning_forecast;
      state.weekly_forecast = weekly_forecast;
      state.daily_thrice_forecast = daily_thrice_forecast;
      return;
    } else if (msg.text.toLowerCase().includes('3 kartus per dieną')) {
      daily_thrice_forecast = true;
    } else {
      bot.sendMessage(chatId, 'Nesupratau dažnumo. Bandykite dar kartą.');
      return;
    }
    // Išsaugom DB
    console.log('BANDOME IŠSAUGOTI:', { chatId, city: state.city, morning_forecast, weekly_forecast, daily_thrice_forecast });
    await subscriptionModel.addSubscription(chatId, state.city, morning_forecast, weekly_forecast, daily_thrice_forecast)
      .then(() => {
        console.log('PRENUMERATA IŠSAUGOTA!');
        bot.sendMessage(chatId, `Prenumerata sėkmingai sukurta! Miestas: ${state.city}, dažnumas: ${msg.text}`);
      })
      .catch((err) => {
        console.error('KLAIDA IŠSAUGANT PRENUMERATĄ:', err);
        bot.sendMessage(chatId, 'Klaida išsaugant prenumeratą. Bandykite vėliau.');
      });
    delete userStates[chatId];
  }
  if (state.step === 'day_of_week') {
    const days = ['Pirmadienis','Antradienis','Trečiadienis','Ketvirtadienis','Penktadienis','Šeštadienis','Sekmadienis'];
    const selectedDay = days.find(d => msg.text.toLowerCase().includes(d.toLowerCase()));
    if (!selectedDay) {
      bot.sendMessage(chatId, 'Nesupratau savaitės dienos. Bandykite dar kartą.');
      return;
    }
    // Išsaugom DB su papildomu weekly_forecast ir galima būtų pridėti day_of_week stulpelį, jei reikia
    const morning_forecast = state.morning_forecast || false;
    const weekly_forecast = state.weekly_forecast || true;
    const daily_thrice_forecast = state.daily_thrice_forecast || false;
    console.log('BANDOME IŠSAUGOTI:', { chatId, city: state.city, morning_forecast, weekly_forecast, daily_thrice_forecast, selectedDay });
    await subscriptionModel.addSubscription(chatId, state.city, morning_forecast, weekly_forecast, daily_thrice_forecast)
      .then(() => {
        console.log('PRENUMERATA IŠSAUGOTA!');
        bot.sendMessage(chatId, `Prenumerata sėkmingai sukurta! Miestas: ${state.city}, dažnumas: Kartą per savaitę, diena: ${selectedDay}`);
      })
      .catch((err) => {
        console.error('KLAIDA IŠSAUGANT PRENUMERATĄ:', err);
        bot.sendMessage(chatId, 'Klaida išsaugant prenumeratą. Bandykite vėliau.');
      });
    delete userStates[chatId];
  }
});

const app = express();
app.use('/api/subscriptions', subscriptionRoutes);

// Papildoma logika bus pridedama vėliau
