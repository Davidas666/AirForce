const subscriptionModel = require('./models/subscriptionModel');
const { fetchMultiDayForecast, fetchHourlyForecast } = require('./helpers/fetchMultiDayForecast');
const logger = require('./utils/logger');
const { ForecastFormatterFactory } = require('./src/formatters');
const path = require('path');

// Įkeliamas failo vardas log'uose
const { name } = path.parse(__filename);
const SCHEDULE_HOUR = 14;
const SCHEDULE_MINUTE = 26;

// Konfigūruojami laikai kiekvienam prenumeratos tipui
const scheduleTimes = {
  morning: {
    hour: parseInt(process.env.SCHEDULE_MORNING_HOUR) || 8,
    minute: parseInt(process.env.SCHEDULE_MORNING_MINUTE) || 0
  },
  weekly: {
    hour: parseInt(process.env.SCHEDULE_WEEKLY_HOUR) || 8,
    minute: parseInt(process.env.SCHEDULE_WEEKLY_MINUTE) || 0,
    day: parseInt(process.env.SCHEDULE_WEEKLY_DAY) || 1 // 1 = pirmadienis
  },
  thrice_daily: {
    hours: (process.env.SCHEDULE_THRICE_HOURS || '8,15,19').split(',').map(h => parseInt(h, 10)),
    minute: parseInt(process.env.SCHEDULE_THRICE_MINUTE) || 0
  }
};

/**
 * Formatuoja orų prognozę pagal prenumeratos tipą
 * @param {Object} weatherData - Orų duomenys iš API
 * @param {Object} sub - Prenumeratos duomenys
 * @returns {Promise<string>} Suformatuotas pranešimas
 */
async function formatForecastBySubscription(weatherData, sub) {
  try {
    // Patikriname ar gauname teisingus duomenis
    if (!weatherData?.list || !Array.isArray(weatherData.list) || weatherData.list.length === 0) {
      logger.error('Netinkamas orų duomenų formatas', {
        hasList: !!weatherData?.list,
        isArray: Array.isArray(weatherData?.list),
        listLength: weatherData?.list?.length
      });
      return 'Nepavyko gauti orų duomenų: neteisingas duomenų formatas';
    }

    const isTest = sub.telegram_id?.startsWith('TEST_');

    let subscriptionType = 'weekly';
    if (sub.morning_forecast) {
      subscriptionType = 'morning';
    } else if (sub.daily_thrice_forecast) {
      subscriptionType = 'thrice_daily';
    }
    logger.debug(`Formatuojama prognozė vartotojui ${sub.telegram_id}, miestas: ${sub.city}`, {
      forecastCount: weatherData.list.length,
      subscriptionType
    });

    // Nustatome pranešimo tipą
    let forecastType = subscriptionType;

    // Sukuriame tinkamą formatuotoją
    let formatter;
    try {
      formatter = ForecastFormatterFactory.create(
        forecastType,
        weatherData,
        {
          locale: 'lt-LT',
          timezone: 'Europe/Vilnius',
          isTest
        }
      );
    } catch (e) {
      logger.error('Nepavyko sukurti formatuotojo objektui:', forecastType, e);
      return 'Nepavyko suformuoti pranešimo.';
    }
    if (!formatter) {
      logger.error('Nepavyko sukurti formatuotojo objektui:', forecastType);
      return 'Nepavyko suformuoti pranešimo.';
    }

    // Grąžiname suformatuotą pranešimą
    return formatter.format();
  } catch (error) {
    logger.error('Kritinė klaida formuojant prognozę:', error);
    return 'Įvyko klaida formuojant orų prognozę. Bandykite vėliau.';
  }
}

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
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();

    for (const sub of subscriptions) {
      let shouldSend = false;
      let subType = null;
      if (isTestRun) {
        shouldSend = true;
      } else if (
        sub.morning_forecast &&
        currentHour === scheduleTimes.morning.hour &&
        currentMinute === scheduleTimes.morning.minute
      ) {
        shouldSend = true;
        subType = 'morning';
      } else if (
        sub.weekly_forecast &&
        currentHour === scheduleTimes.weekly.hour &&
        currentMinute === scheduleTimes.weekly.minute &&
        currentDay === scheduleTimes.weekly.day
      ) {
        shouldSend = true;
        subType = 'weekly';
      } else if (
        sub.daily_thrice_forecast &&
        scheduleTimes.thrice_daily.hours.includes(currentHour) &&
        currentMinute === scheduleTimes.thrice_daily.minute
      ) {
        shouldSend = true;
        subType = 'thrice_daily';
      }

      if (shouldSend) {
        logger.info(`Scheduler: Siunčiama prognozė vartotojui ${sub.telegram_id} miestui ${sub.city}`);
        try {
          let weatherData;
          if (subType === 'morning' || subType === 'thrice_daily') {
            const cnt = Math.max(0, Math.ceil((24 - currentHour) / 3));
            weatherData = await fetchHourlyForecast(sub.city, cnt);
          } else if (subType === 'weekly') {
            weatherData = await fetchMultiDayForecast(sub.city);
          } else {
            const cnt = Math.max(0, Math.ceil((24 - currentHour) / 3));
            weatherData = await fetchHourlyForecast(sub.city, cnt);
          }

          if (!weatherData) {
            logger.error(`Scheduler: Gauti tušti orų duomenys miestui ${sub.city}`);
            continue;
          }
          if (!weatherData.list || !Array.isArray(weatherData.list)) {
            logger.error(`Scheduler: Neteisingas orų duomenų formatas miestui ${sub.city}:`, JSON.stringify(weatherData).substring(0, 200));
            continue;
          }
          logger.info(`Scheduler: Sėkmingai gauti orų duomenys miestui ${sub.city}, rasta įrašų: ${weatherData.list.length}`);

          // Siunčiame tik tą prenumeratos tipą, kuris atitinka dabartinį laiką
          if (
            (subType === 'morning' && sub.morning_forecast) ||
            (subType === 'thrice_daily' && sub.daily_thrice_forecast) ||
            (subType === 'weekly' && sub.weekly_forecast)
          ) {
            await sendSubscriptionMessage(bot, sub, weatherData, subType, '');
          } else {
            logger.info(`Scheduler: Vartotojui ${sub.telegram_id} (${sub.city}) neatitinka prenumeratos tipas, pranešimas nesiunčiamas.`);
          }
        } catch (error) {
          logger.error(`Scheduler: Klaida siunčiant prognozę vartotojui ${sub.telegram_id}:`, error);
        }
        // 1 sek delay tarp naudotojų (rate limit)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    logger.error('Scheduler: Klaida gaunant prenumeratas:', error);
  }
  logger.info(`Scheduler: Prenumeratų tikrinimas baigtas. ${isTestRun ? '(Testinis paleidimas)' : ''}`);
}

/**
 * Helper function to send subscription messages based on subscription type
 * @param {Object} bot - Telegram bot instance
 * @param {Object} sub - Subscription data
 * @param {Object} weatherData - Weather data
 * @param {string} subType - Subscription type ('morning', 'thrice_daily', 'weekly')
 * @param {string} header - Message header
 * @returns {Promise<boolean>} True if message was sent successfully
 */
async function sendSubscriptionMessage(bot, sub, weatherData, subType, header = '') {
  let chatId = sub.chat_id || sub.telegram_id;
  if (!chatId) {
    logger.error(`Nenurodytas chat_id vartotojui: ${JSON.stringify(sub)}`);
    return false;
  }
  try {
    // Create a temporary subscription object for the specific type
    const tempSub = {
      ...sub,
      morning_forecast: subType === 'morning',
      daily_thrice_forecast: subType === 'thrice_daily',
      weekly_forecast: subType === 'weekly',
      chat_id: chatId,
      telegram_id: sub.telegram_id || chatId // Ensure telegram_id is set
    };
    logger.info(`Formatuojamas ${subType} pranešimas vartotojui ${sub.telegram_id} (${sub.city})`);
    // Format the message using the appropriate formatter
    const message = await formatForecastBySubscription(weatherData, tempSub);
    // Handle both string and array of message parts
    const messages = Array.isArray(message) ? message : [message];
    logger.info(`Siunčiamas ${subType} pranešimas vartotojui ${chatId} (${sub.city})`);
    // Pridedame prenumeratos tipą ir miesto pavadinimą prie kiekvienos žinutės
    let typeLabel = '';
    if (subType === 'morning') typeLabel = '🌅 Rytinė';
    else if (subType === 'thrice_daily') typeLabel = 'Dienos prognozė';
    else if (subType === 'weekly') typeLabel = 'Savaitės prognozė';
    const cityName = weatherData.city?.name || sub.city || '';
    for (const msg of messages) {
      const fullMsg = `<b>${typeLabel}</b>\n<b>${cityName}</b>\n${msg}`;
      await bot.sendMessage(chatId, fullMsg, { parse_mode: 'HTML' });
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    logger.info(`${subType} pranešimas sėkmingai išsiųstas vartotojui ${sub.telegram_id} miestui ${sub.city}`);
    return true;
  } catch (error) {
    logger.error(`Klaida siunčiant ${subType} pranešimą vartotojui ${sub.telegram_id}:`, error);
    try {
      await bot.sendMessage(chatId, 'Įvyko klaida siunčiant prognozę. Bandykite vėliau.');
    } catch (e) {
      logger.error('Nepavyko išsiųsti klaidos pranešimo:', e);
    }
    return false;
  }
}

/**
 * Testinė funkcija, kuri imituoja tikrą pranešimų siuntimą pagal vartotojų prenumeratas
 * @param {Object} bot - Telegram bot objektas
 */
async function testAllSubscriptionTypes(bot) {
  logger.info('Pradedamas tikrų prenumeratų testavimas...');
  
  try {
    // Gauname visas prenumeratas iš duomenų bazės
    const subscriptions = await subscriptionModel.getAllSubscriptions();
    
    if (subscriptions.length === 0) {
      logger.info('Nerasta jokių prenumeratų testavimui');
      return;
    }
    
    logger.info(`Radome ${subscriptions.length} prenumeratų testavimui`);
    
    // Grupuojame prenumeratas pagal vartotoją ir miestą
    const subscriptionsByUser = {};
    
    subscriptions.forEach(sub => {
      const key = `${sub.telegram_id}_${sub.city.toLowerCase()}`;
      if (!subscriptionsByUser[key]) {
        subscriptionsByUser[key] = {
          telegram_id: sub.telegram_id,
          chat_id: sub.telegram_id, // Naudojame tą patį ID kaip ir chat_id
          city: sub.city,
          morning_forecast: false,
          weekly_forecast: false,
          daily_thrice_forecast: false,
          isTest: true
        };
      }
      
      // Nustatome prenumeratos tipą
      if (sub.morning_forecast) subscriptionsByUser[key].morning_forecast = true;
      if (sub.weekly_forecast) subscriptionsByUser[key].weekly_forecast = true;
      if (sub.daily_thrice_forecast) subscriptionsByUser[key].daily_thrice_forecast = true;
    });
    
    const userSubscriptions = Object.values(subscriptionsByUser);
    logger.info(`Surinkta ${userSubscriptions.length} unikalių vartotojų ir miestų kombinacijų`);
    
    // Siunčiame pranešimus kiekvienam vartotojui pagal jo prenumeratą
    for (const sub of userSubscriptions) {
      try {
        logger.info(`Tikrinama prenumerata vartotojui ${sub.telegram_id}, miestas: ${sub.city}`);
        
        try {
          let weatherData;
          const now = new Date();
          const currentHour = now.getHours();
          // For each type, fetch the correct data
          if (sub.morning_forecast) {
            const cnt = Math.max(0, Math.ceil((24 - currentHour) / 3));
            weatherData = await fetchHourlyForecast(sub.city, cnt);
            await sendSubscriptionMessage(bot, sub, weatherData, 'morning', '*🔹 TESTINIS PRANEŠIMAS*\n');
          }
          if (sub.daily_thrice_forecast) {
            const cnt = Math.max(0, Math.ceil((24 - currentHour) / 3));
            weatherData = await fetchHourlyForecast(sub.city, cnt);
            await sendSubscriptionMessage(bot, sub, weatherData, 'thrice_daily', '*🔹 TESTINIS PRANEŠIMAS*\n');
          }
          if (sub.weekly_forecast) {
            weatherData = await fetchMultiDayForecast(sub.city);
            await sendSubscriptionMessage(bot, sub, weatherData, 'weekly', '*🔹 TESTINIS PRANEŠIMAS*\n');
          }
        } catch (fetchError) {
          logger.error(`Klaida gaunant orų duomenis vartotojui ${sub.telegram_id} (${sub.city}):`, {
            message: fetchError.message,
            stack: fetchError.stack,
            response: fetchError.response?.data
          });
        }
      } catch (error) {
        logger.error(`Netikėta klaida apdorojant prenumeratą vartotojui ${sub.telegram_id} (${sub.city}):`, {
          message: error.message,
          stack: error.stack,
          error: error
        });
      }
    }
    
    logger.info('Visi testiniai pranešimai sėkmingai išsiųsti pagal vartotojų prenumeratas.');
    
  } catch (error) {
    logger.error('Kritinė klaida vykdant testinį pranešimų siuntimą:', error);
  }
}

// Eksportuojame funkciją, kuri paleidžia planuotoją
module.exports = {
  start: (bot) => {
    if (process.env.RUN_TESTS === 'true') {
      logger.info('Scheduler: Testinis pranešimų siuntimas pagal vartotojų prenumeratas numatytas po 5 sekundžių.');
      setTimeout(() => testAllSubscriptionTypes(bot), 5000);
      return;
    }
    setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.getDay();
      // Tikriname visus prenumeratos tipus
      if (
        currentHour === scheduleTimes.morning.hour &&
        currentMinute === scheduleTimes.morning.minute
      ) {
        checkAndSendForecasts(bot, false);
      }
      if (
        currentHour === scheduleTimes.weekly.hour &&
        currentMinute === scheduleTimes.weekly.minute &&
        currentDay === scheduleTimes.weekly.day
      ) {
        checkAndSendForecasts(bot, false);
      }
      if (
        scheduleTimes.thrice_daily.hours.includes(currentHour) &&
        currentMinute === scheduleTimes.thrice_daily.minute
      ) {
        checkAndSendForecasts(bot, false);
      }
    }, 60000); // Tikriname kas minutę
    logger.info(`Scheduler: Planuotojas paleistas. Laikai: Ryto: ${scheduleTimes.morning.hour}:${scheduleTimes.morning.minute}, Savaitės: ${scheduleTimes.weekly.hour}:${scheduleTimes.weekly.minute} (${scheduleTimes.weekly.day}), Triskart: ${scheduleTimes.thrice_daily.hours.join(',')}:${scheduleTimes.thrice_daily.minute}`);
    // Paleidžiame iš karto, jei atitinka bet kurį laiką
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();
    if (
      (currentHour === scheduleTimes.morning.hour && currentMinute === scheduleTimes.morning.minute) ||
      (currentHour === scheduleTimes.weekly.hour && currentMinute === scheduleTimes.weekly.minute && currentDay === scheduleTimes.weekly.day) ||
      (scheduleTimes.thrice_daily.hours.includes(currentHour) && currentMinute === scheduleTimes.thrice_daily.minute)
    ) {
      checkAndSendForecasts(bot, false);
    }
  },
};
