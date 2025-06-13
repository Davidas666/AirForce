const model = require('../models/favoriteCitiesModel');

// Controller for managing user's favorite cities
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

// Add a city to user's favorite cities
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

// Delete a city from user's favorite cities
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