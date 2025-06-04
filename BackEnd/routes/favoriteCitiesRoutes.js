const express = require('express');
const router = express.Router();
const controller = require('../controllers/favoriteCitiesController');

// GET user's favorite cities
router.get('/', controller.getFavoriteCities);

// ADD city to favorites
router.post('/', controller.addFavoriteCity);

// DELETE city from favorites
router.delete('/', controller.deleteFavoriteCity);

module.exports = router;