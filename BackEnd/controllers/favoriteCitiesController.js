const model = require('../models/favoriteCitiesModel');

/**
 * @module controllers/favoriteCitiesController
 * @description Handles operations related to user's favorite cities.
 */

/**
 * @function getFavoriteCities
 * @description Get all favorite cities for a user
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.userId - Telegram user ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of favorite cities or error message
 * @example
 * // GET /api/favorites?userId=12345
 * // Returns: [{ id: 1, user_id: 12345, city: 'Vilnius', created_at: '2023-01-01T00:00:00.000Z' }]
 */
exports.getFavoriteCities = async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "userId required" });
  try {
    const cities = await model.getFavoriteCities(userId);
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: "Failed to get favorite cities" });
  }
};

/**
 * @function addFavoriteCity
 * @description Add a city to user's favorite cities
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.userId - Telegram user ID
 * @param {string} req.body.city - City name to add
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated list of favorite cities or error message
 * @example
 * // POST /api/favorites
 * // Request body: { userId: '12345', city: 'Vilnius' }
 * // Returns: [{ id: 1, user_id: 12345, city: 'Vilnius', created_at: '2023-01-01T00:00:00.000Z' }]
 */
exports.addFavoriteCity = async (req, res) => {
  const { userId, city } = req.body;
  if (!userId || !city) return res.status(400).json({ error: "userId and city required" });
  try {
    const cities = await model.addFavoriteCity(userId, city);
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: "Failed to add favorite city" });
  }
};

/**
 * @function deleteFavoriteCity
 * @description Remove a city from user's favorite cities
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.userId - Telegram user ID
 * @param {string} req.body.city - City name to remove
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated list of favorite cities or error message
 * @example
 * // DELETE /api/favorites
 * // Request body: { userId: '12345', city: 'Vilnius' }
 * // Returns: []
 */
exports.deleteFavoriteCity = async (req, res) => {
  const { userId, city } = req.body;
  if (!userId || !city) return res.status(400).json({ error: "userId and city required" });
  try {
    const cities = await model.deleteFavoriteCity(userId, city);
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete favorite city" });
  }
};