const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');

router.get('/:city', forecastController.getForecastByCity);
router.get('/multi/:city', forecastController.getMultiDayForecastByCity);

module.exports = router;
