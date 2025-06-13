const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');

// Route to get city suggestions based on user input
router.get('/', cityController.getCitySuggestions);

module.exports = router;
