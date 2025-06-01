const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');

router.get('/multi/:city', forecastController.getMultiDayForecastByCity);
router.get('/hourly/:city', forecastController.getHourlyForecastByCity);
router.get('/:city', forecastController.getForecastByCity);

module.exports = router;
