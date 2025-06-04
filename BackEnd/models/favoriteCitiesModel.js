const pool = require('../db');

// Get favorite cities for a user
async function getFavoriteCities(userId) {
  const result = await pool.query(
    'SELECT city FROM favorite_cities WHERE user_id = $1',
    [userId]
  );
  return result.rows.map(row => row.city);
}

// Add a city to favorites
async function addFavoriteCity(userId, city) {
  await pool.query(
    'INSERT INTO favorite_cities (user_id, city) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [userId, city]
  );
  return getFavoriteCities(userId);
}

// Remove a city from favorites
async function deleteFavoriteCity(userId, city) {
  await pool.query(
    'DELETE FROM favorite_cities WHERE user_id = $1 AND city = $2',
    [userId, city]
  );
  return getFavoriteCities(userId);
}

module.exports = {
  getFavoriteCities,
  addFavoriteCity,
  deleteFavoriteCity,
};