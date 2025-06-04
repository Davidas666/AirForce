const express = require('express');
const router = express.Router();
const { saveTelegramUser, getTelegramUsers, updateUserFavorites } = require('../models/telegramUserModel');

// Save or update Telegram user
router.post('/', saveTelegramUser);

// Get all Telegram users
//router.get('/all', getTelegramUsers);

// Update user's favorite cities (JSONB field)
router.post('/favorites', updateUserFavorites);

module.exports = router;
