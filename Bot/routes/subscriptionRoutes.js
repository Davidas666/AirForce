/**
 * @file subscriptionRoutes.js
 * @module routes/subscriptionRoutes
 * @description API routes for managing user weather forecast subscriptions.
 *
 * Provides endpoints to create a new subscription and to fetch all subscriptions for a user.
 */

const express = require('express');
const router = express.Router();
const subscriptionModel = require('../models/subscriptionModel');

/**
 * @route POST /
 * @summary Create a new subscription for a Telegram user
 * @param {Object} req.body - The request body
 * @param {string} req.body.telegram_id - Telegram user ID
 * @param {string} req.body.city - City for the weather subscription
 * @param {boolean} [req.body.morning_forecast] - Subscribe to morning forecast
 * @param {boolean} [req.body.weekly_forecast] - Subscribe to weekly forecast
 * @param {boolean} [req.body.daily_thrice_forecast] - Subscribe to thrice-daily forecast
 * @returns {Object} 200 - Success response with the saved subscription
 * @returns {Object} 400 - Error response if required fields are missing
 * @returns {Object} 500 - Error response if saving fails
 */
router.post('/', async (req, res) => {
  console.log('Gauta POST / prenumeratos užklausa');
  const { telegram_id, city, morning_forecast, weekly_forecast, daily_thrice_forecast } = req.body;
  console.log('Gauti duomenys:', { telegram_id, city, morning_forecast, weekly_forecast, daily_thrice_forecast });
  if (
    !telegram_id ||
    !city ||
    (morning_forecast === undefined && weekly_forecast === undefined && daily_thrice_forecast === undefined)
  ) {
    console.log('Trūksta laukų!');
    return res.status(400).json({ error: 'Trūksta laukų: telegram_id, city, bent vienas forecast tipas' });
  }
  try {
    const subscription = await subscriptionModel.addSubscription(
      telegram_id,
      city,
      !!morning_forecast,
      !!weekly_forecast,
      !!daily_thrice_forecast
    );
    console.log('Prenumerata išsaugota:', subscription);
    res.json({ success: true, subscription });
  } catch (err) {
    console.error('Klaida backend maršrute:', err);
    res.status(500).json({ error: 'Nepavyko išsaugoti prenumeratos' });
  }
});

/**
 * @route GET /:telegram_id
 * @summary Get all subscriptions for a Telegram user
 * @param {string} req.params.telegram_id - Telegram user ID
 * @returns {Object} 200 - Success response with a list of subscriptions
 * @returns {Object} 500 - Error response if fetching fails
 */
router.get('/:telegram_id', async (req, res) => {
  try {
    const subscriptions = await subscriptionModel.getUserSubscriptions(req.params.telegram_id);
    res.json({ subscriptions });
  } catch (err) {
    res.status(500).json({ error: 'Nepavyko gauti prenumeratų' });
  }
});

module.exports = router;
