const subscriptionModel = require('./models/subscriptionModel');
const fetchMultiDayForecast = require('./helpers/fetchMultiDayForecast');
const logger = require('./utils/logger');
const { ForecastFormatterFactory } = require('./src/formatters');
const path = require('path');

// Įkeliamas failo vardas log'uose
const { name } = path.parse(__filename);

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

    const isTest = sub.telegram_id && sub.telegram_id.startsWith('TEST_');
    
    logger.debug(`Formatuojama prognozė vartotojui ${sub.telegram_id}, miestas: ${sub.city}`, {
      forecastCount: weatherData.list.length,
      subscriptionType: sub.morning_forecast ? 'morning' : 
                        sub.daily_thrice_forecast ? 'thrice_daily' : 'weekly'
    });
    
    // Nustatome pranešimo tipą
    let forecastType = 'weekly';
    if (sub.morning_forecast) forecastType = 'morning';
    else if (sub.daily_thrice_forecast) forecastType = 'thrice_daily';
    
    // Sukuriame tinkamą formatuotoją
    const formatter = ForecastFormatterFactory.create(
      forecastType,
      weatherData,
      {
        locale: 'lt-LT',
        timezone: 'Europe/Vilnius',
        isTest
      }
    );
    
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
    const currentDay = now.getDay(); // 0 = sekmadienis, 1 = pirmadienis, ...

    for (const sub of subscriptions) {
      let shouldSend = false;

      if (isTestRun) {
        shouldSend = true; // Testiniam paleidimui siunčiame visada
      } else {
        // Tikriname rytinę prognozę (8 val.)
        if (sub.morning_forecast && currentHour === 8) {
          shouldSend = true;
        }
        // Tikriname savaitinę prognozę (pirmadieniais 8 val.)
        else if (sub.weekly_forecast && currentHour === 8 && currentDay === 1) {
          shouldSend = true;
        }
        // Tikriname prognozę 1 kartą per dieną 14:26
        else if (sub.daily_thrice_forecast && currentHour === 14 && now.getMinutes() === 26) {
          shouldSend = true;
        }
      }

      if (shouldSend) {
        logger.info(`Scheduler: Siunčiama prognozė vartotojui ${sub.telegram_id} miestui ${sub.city}`);
        try {
          const weatherData = await fetchMultiDayForecast(sub.city);
          
          if (!weatherData) {
            logger.error(`Scheduler: Gauti tušti orų duomenys miestui ${sub.city}`);
            continue;
          }
          
          if (!weatherData.list || !Array.isArray(weatherData.list)) {
            logger.error(`Scheduler: Neteisingas orų duomenų formatas miestui ${sub.city}:`, 
              JSON.stringify(weatherData).substring(0, 200));
            continue;
          }
          
          logger.info(`Scheduler: Sėkmingai gauti orų duomenys miestui ${sub.city}, rasta įrašų: ${weatherData.list.length}`);
          
          // Siunčiame atskirus pranešimus pagal prenumeratos tipą
          if (sub.morning_forecast) {
            await sendSubscriptionMessage(bot, sub, weatherData, 'morning', '');
          }
          
          if (sub.daily_thrice_forecast) {
            await sendSubscriptionMessage(bot, sub, weatherData, 'thrice_daily', '');
          }
          
          if (sub.weekly_forecast) {
            await sendSubscriptionMessage(bot, sub, weatherData, 'weekly', '');
          }
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
  try {
    // Ensure we have a valid chat_id
    const chatId = sub.chat_id || sub.telegram_id;
    if (!chatId) {
      logger.error(`Nenurodytas chat_id vartotojui: ${JSON.stringify(sub)}`);
      return false;
    }

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
    
    for (const msg of messages) {
      await bot.sendMessage(chatId, msg, { parse_mode: 'HTML' });
      // Add a small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    logger.info(`${subType} pranešimas sėkmingai išsiųstas vartotojui ${sub.telegram_id} miestui ${sub.city}`);
    return true;
  } catch (error) {
    logger.error(`Klaida siunčiant ${subType} pranešimą vartotojui ${sub.telegram_id}:`, error);
    
    // Try to send error message if possible
    try {
      await bot.sendMessage(chatId, 'Įvyko klaida siunčiant prognozę. Bandykite vėliau.');
    } catch (e) {
      logger.error('Nepavyko išsiųsti klaidos pranešimo:', e);
      return false;
    }
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
          // Gauname orų duomenis
          logger.info(`Gaunami orų duomenys miestui: ${sub.city}`);
          const weatherData = await fetchMultiDayForecast(sub.city);
          
          if (!weatherData) {
            logger.error(`Gauti tušti orų duomenys miestui ${sub.city}`);
            continue;
          }
          
          if (!weatherData.list || !Array.isArray(weatherData.list)) {
            logger.error(`Neteisingas orų duomenų formatas miestui ${sub.city}:`, JSON.stringify(weatherData).substring(0, 200));
            continue;
          }
          
          logger.info(`Sėkmingai gauti orų duomenys miestui ${sub.city}, rasta įrašų: ${weatherData.list.length}`);
          
          // Pridedame antraštę, kad būtų aišku, kad tai testas
          const testHeader = `*🔹 TESTINIS PRANEŠIMAS (${new Date().toLocaleString('lt-LT')}) 🔹*\n` +
                            `*Miestas:* ${sub.city}\n`;
          
          // Siunčiame atskirus pranešimus pagal prenumeratos tipą
          if (sub.morning_forecast) {
            await sendSubscriptionMessage(bot, sub, weatherData, 'morning', testHeader);
          }
          
          if (sub.daily_thrice_forecast) {
            await sendSubscriptionMessage(bot, sub, weatherData, 'thrice_daily', testHeader);
          }
          
          if (sub.weekly_forecast) {
            await sendSubscriptionMessage(bot, sub, weatherData, 'weekly', testHeader);
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
    // Tikriname ar reikia paleisti testinį režimą
    if (process.env.RUN_TESTS === 'true') {
      logger.info('Scheduler: Testinis pranešimų siuntimas pagal vartotojų prenumeratas numatytas po 5 sekundžių.');
      setTimeout(() => testAllSubscriptionTypes(bot), 5000);
      return;
    }
    
    // Nustatome laikrodžio tikrinimą kas minutę
    setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.getDay(); // 0 = sekmadienis, 1 = pirmadienis, ...
      
      // Tikriname ar dabartinė valanda yra 14, o minutė 26
      if (currentHour === 14 && currentMinute === 26) {
        logger.info(`Scheduler: Pradedamas pranešimų siuntimas ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
        checkAndSendForecasts(bot, false);
      }
    }, 60000); // Tikriname kas minutę
  
    logger.info('Scheduler: Planuotojas paleistas. Pranešimai bus siunčiami 14:26 valandą.');
    
    // Paleidžiame iš karto, jei atitinka laiką (14:26)
    const now = new Date();
    if (now.getHours() === 14 && now.getMinutes() === 26) {
      checkAndSendForecasts(bot, false);
    } 
  },
};
