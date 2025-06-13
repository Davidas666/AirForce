const { searchCities } = require('../models/cityModel');

/**
 * @module controllers/cityController
 * @description Handles city-related operations such as searching for cities.
 */

/**
 * @function getCitySuggestions
 * @description Get city suggestions based on search query
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.q - Search query string
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of matching cities or error message
 * @example
 * // GET /api/cities?q=viln
 * // Returns: [{ name: 'Vilnius', country: 'LT', lat: 54.6892, lon: 25.2798 }]
 */
exports.getCitySuggestions = (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  const suggestions = searchCities(query);
  res.json(suggestions);
};
