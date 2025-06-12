const pool = require('../db');

// Create or update a subscription
async function upsertSubscription(telegram_id, city, type, enabled) {
  const column = {
    morning: 'morning_forecast',
    weekly: 'weekly_forecast',
    daily_thrice: 'daily_thrice_forecast'
  }[type];
  if (!column) throw new Error('Invalid subscription type');

  const result = await pool.query(
    `INSERT INTO subscriptions (telegram_id, city, ${column})
     VALUES ($1, $2, $3)
     ON CONFLICT (telegram_id, city)
     DO UPDATE SET ${column} = $3
     RETURNING *`,
    [telegram_id, city, enabled]
  );
  return result.rows[0];
};

// Get subscriptions for a user
async function getSubscriptions(telegram_id) {
  const result = await pool.query(
    'SELECT city, morning_forecast, weekly_forecast, daily_thrice_forecast FROM subscriptions WHERE telegram_id = $1',
    [telegram_id]
  );
  return result.rows;
};

// Get all cities a user is subscribed
async function getUserSubscribedCities(telegram_id) {
  const result = await pool.query(
    `SELECT DISTINCT city
     FROM subscriptions
     WHERE telegram_id = $1
       AND (morning_forecast = true OR weekly_forecast = true OR daily_thrice_forecast = true)`,
    [telegram_id]
  );
  return result.rows.map(row => row.city);
}

module.exports = {upsertSubscription, getSubscriptions, getUserSubscribedCities };