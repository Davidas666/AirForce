const logger = require('../utils/logger');

/**
 * @module controllers/forecastController
 * @description Handles weather forecast related operations including current, daily, and hourly forecasts.
 */

const {
  fetchForecastByCity,
  fetchMultiDayForecastByCity,
  fetchHourlyForecastByCity,
  fetchDailyForecastByCity,
  fetchHourlyForecastByCityCnt
} = require('../models/forecastModel');

/**
 * @function getForecastByCity
 * @description Get current weather forecast for a city
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.city - City name
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with current weather data or error message
 * @example
 * // GET /api/forecast/Vilnius
 * // Returns: { coord: { lon: 25.2798, lat: 54.6892 }, weather: [...], main: {...} }
 */
exports.getForecastByCity = async (req, res) => {
  const city = req.params.city;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  logger.info(`Forecast requested for city: ${city}`);
  try {
    const data = await fetchForecastByCity(city, apiKey);
    logger.info(`Forecast response sent for city: ${city}`);
    res.json(data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logger.warn(`City not found: ${city}`);
      res.status(404).json({ error: 'City not found' });
    } else {
      logger.error('Error in getForecastByCity: %o', error);
      res.status(500).json({ error: 'Failed to get forecast', details: error.message });
    }
  }
};

/**
 * @function getDailyForecastByCity
 * @description Get daily weather forecast for a city
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.city - City name
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.cnt=7] - Number of days to forecast (1-16)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with daily forecast data or error message
 * @example
 * // GET /api/forecast/daily/Vilnius?cnt=5
 * // Returns: { city: { name: 'Vilnius', country: 'LT' }, list: [...] }
 */
exports.getDailyForecastByCity = async (req, res) => {
  const city = req.params.city;
  const cnt = req.query.cnt || 7;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  logger.info(`Daily forecast requested for city: ${city}, count: ${cnt}`);
  try {
    const data = await fetchDailyForecastByCity(city, cnt, apiKey);
    logger.info(`Daily forecast response sent for city: ${city}`);
    res.json(data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logger.warn(`City not found: ${city}`);
      res.status(404).json({ error: 'City not found' });
    } else {
      logger.error('Error in getDailyForecastByCity: %o', error);
      res.status(500).json({ error: 'Failed to get daily forecast', details: error.message });
    }
  }
};

/**
 * @function getMultiDayForecastByCity
 * @description Get multi-day weather forecast for a city
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.city - City name
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with multi-day forecast data or error message
 * @example
 * // GET /api/forecast/multi/Vilnius
 * // Returns: { city: { name: 'Vilnius', country: 'LT' }, list: [...] }
 */
exports.getMultiDayForecastByCity = async (req, res) => {
  const city = req.params.city;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  logger.info(`Multi-day forecast requested for city: ${city}`);
  try {
    const data = await fetchMultiDayForecastByCity(city, apiKey);
    logger.info(`Multi-day forecast response sent for city: ${city}`);
    res.json(data);
  } catch (error) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (status === 404 || message === 'city not found') {
    logger.warn(`City not found: ${city}`);
    return res.status(404).json({ error: 'City not found' });
  }

  logger.error('Error in getForecastByCity: %o', error);
  res.status(500).json({ error: 'Failed to get forecast', details: error.message });
}
};

/**
 * @function getHourlyForecastByCity
 * @description Get hourly weather forecast for a city
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.city - City name
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with hourly forecast data or error message
 * @example
 * // GET /api/forecast/hourly/Vilnius
 * // Returns: { city: { name: 'Vilnius', country: 'LT' }, list: [...] }
 */
exports.getHourlyForecastByCity = async (req, res) => {
  const city = req.params.city;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  logger.info(`Hourly forecast requested for city: ${city}`);
  try {
    const data = await fetchHourlyForecastByCity(city, apiKey);
    logger.info(`Hourly forecast response sent for city: ${city}`);
    res.json(data);
  } catch (error) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (status === 404 || message === 'city not found') {
    logger.warn(`City not found: ${city}`);
    return res.status(404).json({ error: 'City not found' });
  }

  logger.error('Error in getForecastByCity: %o', error);
  res.status(500).json({ error: 'Failed to get forecast', details: error.message });
}

};

/**
 * @function getHourlyForecastByCityCnt
 * @description Get limited hourly weather forecast for a city
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.city - City name
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.cnt=24] - Number of hours to forecast (1-48)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with limited hourly forecast data or error message
 * @example
 * // GET /api/forecast/hourly/Vilnius/cnt?cnt=12
 * // Returns: { city: { name: 'Vilnius', country: 'LT' }, list: [...] }
 */
exports.getHourlyForecastByCityCnt = async (req, res) => {
  const city = req.params.city;
  const cnt = req.query.cnt || 7;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  logger.info(`Hourly forecast (limited) requested for city: ${city}, count: ${cnt}`);
  try {
    const data = await fetchHourlyForecastByCityCnt(city, cnt, apiKey);
    logger.info(`Hourly forecast (limited) response sent for city: ${city}`);
    res.json(data);
  } catch (error) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (status === 404 || message === 'city not found') {
    logger.warn(`City not found: ${city}`);
    return res.status(404).json({ error: 'City not found' });
  }

  logger.error('Error in getForecastByCity: %o', error);
  res.status(500).json({ error: 'Failed to get forecast', details: error.message });
}
};
