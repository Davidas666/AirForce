const fetch = require('node-fetch');
const logger = require('../utils/logger');

const fetchMultiDayForecast = async (city) => {
  const url = `http://localhost:3001/api/forecast/multi/${encodeURIComponent(city)}`;
  logger.info(`Fetching multi-day forecast from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error(`Error fetching multi-day forecast for ${city}:`, error);
    throw error;
  }
}

module.exports = fetchMultiDayForecast;
