const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');

// Routes for weather forecast

// Route to get hourly forecast by city with a specified count
router.get('/hourly/:city/limited', forecastController.getHourlyForecastByCityCnt);

// Route to get multi-day forecast by city
router.get('/multi/:city', forecastController.getMultiDayForecastByCity);

// Route to get hourly, daily, or general forecast by city
router.get('/hourly/:city', forecastController.getHourlyForecastByCity);

// Route to get daily forecast by city
router.get('/daily/:city', forecastController.getDailyForecastByCity);

// Route to get general forecast by city
router.get('/:city', forecastController.getForecastByCity);

module.exports = router;
