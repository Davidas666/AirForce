const fetch = require('node-fetch');
const logger = require('../utils/logger');

// Keletui dienų (weekly forecast)
const fetchMultiDayForecast = async (city) => {
  const url = `http://localhost:3001/api/forecast/multi/${encodeURIComponent(city)}`;
  logger.info(`Fetching multi-day forecast from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }
    const data = await response.json();
    // Pridedame miesto pavadinimą, jei jo nėra
    if (!data.city) {
      data.city = { name: city };
    }
    return data;
  } catch (error) {
    logger.error(`Error fetching multi-day forecast for ${city}:`, error);
    throw error;
  }
};

// Tik valandinė (morning ir thrice)
const fetchHourlyForecast = async (city, cnt = 8) => {
  const url = `http://localhost:3001/api/forecast/hourly/${encodeURIComponent(city)}?cnt=${cnt}`;
  logger.info(`Fetching hourly forecast from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }
    const data = await response.json();
    // Pridedame miesto pavadinimą, jei jo nėra
    if (!data.city) {
      data.city = { name: city };
    }
    return data;
  } catch (error) {
    logger.error(`Error fetching hourly forecast for ${city}:`, error);
    throw error;
  }
};

module.exports = {
  fetchMultiDayForecast,
  fetchHourlyForecast
};
