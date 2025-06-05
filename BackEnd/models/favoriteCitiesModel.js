const pool = require('../db');

// Get favorite cities for a user
async function getFavoriteCities(userId) {
  const result = await pool.query(
    'SELECT city_name FROM favorite_cities WHERE telegram_id = $1',
    [userId]
  );
  return result.rows.map(row => row.city_name); }

// Add a city to favorites
async function addFavoriteCity(userId, city) {
  await pool.query(
    'INSERT INTO favorite_cities (telegram_id, city_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [userId, city]
  );
  return getFavoriteCities(userId);
}

// Remove a city from favorites
async function deleteFavoriteCity(userId, city) {
  await pool.query(
    'DELETE FROM favorite_cities WHERE telegram_id = $1 AND city_name = $2',
    [userId, city]
  );
  return getFavoriteCities(userId);
}

module.exports = {
  getFavoriteCities,
  addFavoriteCity,
  deleteFavoriteCity,
};