const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');

router.get('/hourly/:city/limited', forecastController.getHourlyForecastByCityCnt);
router.get('/multi/:city', forecastController.getMultiDayForecastByCity);
router.get('/hourly/:city', forecastController.getHourlyForecastByCity);
router.get('/daily/:city', forecastController.getDailyForecastByCity);
router.get('/:city', forecastController.getForecastByCity);

module.exports = router;
