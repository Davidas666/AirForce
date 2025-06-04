const pool = require('../db');
const winston = require('winston');

// GET user's favorite cities
async function getFavoriteCities(req, res) {
  const { telegram_id } = req.query;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
  try {
    const result = await pool.query(
      'SELECT city_name FROM favorite_cities WHERE telegram_id = $1',
      [telegram_id]
    );
    res.json({ cities: result.rows.map(r => r.city_name) });
  } catch (err) {
    winston.error(`Error fetching favorite cities: ${err}`);
    res.status(500).json({ error: 'Nepavyko gauti mėgstamų miestų.' });
  }
}

// ADD city to favorites
async function addFavoriteCity(req, res) {
  const { telegram_id, city_name } = req.body;
  if (!telegram_id || !city_name) return res.status(400).json({ error: 'telegram_id and city_name required' });
  try {
    await pool.query(
      'INSERT INTO favorite_cities (telegram_id, city_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [telegram_id, city_name]
    );
    res.json({ success: true });
  } catch (err) {
    winston.error(`Error adding favorite city: ${err}`);
    res.status(500).json({ error: 'Nepavyko pridėti mėgstamo miesto.' });
  }
}

// DELETE city from favorites
async function deleteFavoriteCity(req, res) {
  const { telegram_id, city_name } = req.query;
  if (!telegram_id || !city_name) return res.status(400).json({ error: 'telegram_id and city_name required' });
  try {
    await pool.query(
      'DELETE FROM favorite_cities WHERE telegram_id = $1 AND city_name = $2',
      [telegram_id, city_name]
    );
    res.json({ success: true });
  } catch (err) {
    winston.error(`Error deleting favorite city: ${err}`);
    res.status(500).json({ error: 'Nepavyko pašalinti mėgstamo miesto.' });
  }
}

module.exports = {
  getFavoriteCities,
  addFavoriteCity,
  deleteFavoriteCity
};
