const express = require('express');
const router = express.Router();
const subscriptionModel = require('../models/subscriptionModel');

// Prenumeratos sukūrimas per API
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

// Gauti visas vartotojo prenumeratas
router.get('/:telegram_id', async (req, res) => {
  try {
    const subscriptions = await subscriptionModel.getUserSubscriptions(req.params.telegram_id);
    res.json({ subscriptions });
  } catch (err) {
    res.status(500).json({ error: 'Nepavyko gauti prenumeratų' });
  }
});

module.exports = router;
