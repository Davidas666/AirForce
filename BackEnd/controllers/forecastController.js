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
  try {
    const data = await fetchForecastByCity(city, apiKey);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get forecast', details: error.message });
  }
};

exports.getDailyForecastByCity = async (req, res) => {
  const city = req.params.city;
  const cnt = req.query.cnt || 7;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  try {
    const data = await fetchDailyForecastByCity(city, cnt, apiKey);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get daily forecast', details: error.message });
  }
};

exports.getMultiDayForecastByCity = async (req, res) => {
  const city = req.params.city;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  try {
    const data = await fetchMultiDayForecastByCity(city, apiKey);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get multi-day forecast', details: error.message });
  }
};

exports.getHourlyForecastByCity = async (req, res) => {
  const city = req.params.city;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  try {
    const data = await fetchHourlyForecastByCity(city, apiKey);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get hourly forecast', details: error.message });
  }
};

exports.getHourlyForecastByCityCnt = async (req, res) => {
  const city = req.params.city;
  const cnt = req.query.cnt || 7;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  try {
    const data = await fetchHourlyForecastByCityCnt(city, cnt, apiKey);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get limited hourly forecast', details: error.message });
  }
};