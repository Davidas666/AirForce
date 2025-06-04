const express = require('express');
const router = express.Router();
const { getFavoriteCities, addFavoriteCity, deleteFavoriteCity } = require('../models/favoriteCitiesRoutes');

// GET user's favorite cities
router.get('/', getFavoriteCities);

// ADD city to favorites
router.post('/', addFavoriteCity);

// DELETE city from favorites
router.delete('/', deleteFavoriteCity);

module.exports = router;
