const logger = require('../utils/logger');

const {
  fetchForecastByCity,
  fetchMultiDayForecastByCity,
  fetchHourlyForecastByCity,
  fetchDailyForecastByCity,
  fetchHourlyForecastByCityCnt
} = require('../models/forecastModel');

exports.getForecastByCity = async (req, res) => {
  const city = req.params.city;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  logger.info(`Forecast requested for city: ${city}`);
  try {
    const data = await fetchForecastByCity(city, apiKey);
    logger.info(`Forecast response sent for city: ${city}`);
    res.json(data);
  } catch (error) {
    logger.error('Error in getForecastByCity: %o', error);
    res.status(500).json({ error: 'Failed to get forecast', details: error.message });
  }
};

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
    logger.error('Error in getDailyForecastByCity: %o', error);
    res.status(500).json({ error: 'Failed to get daily forecast', details: error.message });
  }
};

exports.getMultiDayForecastByCity = async (req, res) => {
  const city = req.params.city;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  logger.info(`Multi-day forecast requested for city: ${city}`);
  try {
    const data = await fetchMultiDayForecastByCity(city, apiKey);
    logger.info(`Multi-day forecast response sent for city: ${city}`);
    res.json(data);
  } catch (error) {
    logger.error('Error in getMultiDayForecastByCity: %o', error);
    res.status(500).json({ error: 'Failed to get multi-day forecast', details: error.message });
  }
};

exports.getHourlyForecastByCity = async (req, res) => {
  const city = req.params.city;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  logger.info(`Hourly forecast requested for city: ${city}`);
  try {
    const data = await fetchHourlyForecastByCity(city, apiKey);
    logger.info(`Hourly forecast response sent for city: ${city}`);
    res.json(data);
  } catch (error) {
    logger.error('Error in getHourlyForecastByCity: %o', error);
    res.status(500).json({ error: 'Failed to get hourly forecast', details: error.message });
  }
};

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
    logger.error('Error in getHourlyForecastByCityCnt: %o', error);
    res.status(500).json({ error: 'Failed to get limited hourly forecast', details: error.message });
  }
};