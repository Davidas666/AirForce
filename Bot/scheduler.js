const cron = require('node-cron');
const subscriptionModel = require('./models/subscriptionModel');
const fetchMultiDayForecast = require('./helpers/fetchMultiDayForecast');
const { formatMultiDayForecast } = require('./helpers/formatters');
const logger = require('./utils/logger');

// Funkcija, kuri tikrina prenumeratas ir siunčia pranešimus
async function checkAndSendForecasts(bot, isTestRun = false) {
  logger.info(`Scheduler: Tikrinamos prenumeratos... ${isTestRun ? '(Testinis paleidimas)' : ''}`);
  try {
    const subscriptions = await subscriptionModel.getAllSubscriptions();
    if (subscriptions.length === 0) {
      logger.info('Scheduler: Nėra aktyvių prenumeratų, praleidžiama.');
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = sekmadienis, 1 = pirmadienis, ...

    for (const sub of subscriptions) {
      let shouldSend = false;

      if (isTestRun) {
        shouldSend = true; // Testiniam paleidimui siunčiame visada
      } else {
        // Tikriname rytinę prognozę (pvz., 8 val.)
        if (sub.morning_forecast && currentHour === 8) {
          shouldSend = true;
        }

        // Tikriname savaitinę prognozę (pvz., pirmadieniais 8 val.)
        if (sub.weekly_forecast && currentDay === 1 && currentHour === 8) {
          shouldSend = true;
        }

        // Tikriname prognozę 3 kartus per dieną (pvz., 8, 14, 20 val.)
        if (sub.daily_thrice_forecast && [8, 14, 20].includes(currentHour)) {
          shouldSend = true;
        }
      }

      if (shouldSend) {
        logger.info(`Scheduler: Siunčiama prognozė vartotojui ${sub.telegram_id} miestui ${sub.city}`);
        try {
          const weatherData = await fetchMultiDayForecast(sub.city);
          const message = formatMultiDayForecast(weatherData, sub.city);
          await bot.sendMessage(sub.telegram_id, message, { parse_mode: 'Markdown' });
        } catch (error) {
          if (error.response && error.response.statusCode === 403) {
            logger.warn(`Scheduler: Vartotojas ${sub.telegram_id} užblokavo botą.`);
          } else {
            logger.error(`Scheduler: Klaida siunčiant prognozę vartotojui ${sub.telegram_id}:`, error);
          }
        }
      }
    }
  } catch (error) {
    logger.error('Scheduler: Klaida gaunant prenumeratas:', error);
  }
  logger.info(`Scheduler: Prenumeratų tikrinimas baigtas. ${isTestRun ? '(Testinis paleidimas)' : ''}`);
}

// Eksportuojame funkciją, kuri paleidžia planuoklį
module.exports = {
  start: (bot) => {
    // Planuojame užduotį vykdyti kas valandą
    cron.schedule('0 * * * *', () => {
      checkAndSendForecasts(bot, false); // Įprastas paleidimas
    });

    logger.info('Orų prognozių siuntimo planuoklis paleistas.');

    // Testinis paleidimas po 30 sekundžių
    logger.info('Scheduler: Testinis pranešimų siuntimas numatytas po 30 sekundžių.');
    setTimeout(() => {
      checkAndSendForecasts(bot, true); // Testinis paleidimas
    }, 30000); // 30 sekundžių
  },
};
