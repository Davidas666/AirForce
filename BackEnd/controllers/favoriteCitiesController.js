const model = require('../models/favoriteCitiesModel');

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

exports.getUserSubscribedCities = async (req, res) => {
  const { telegram_id } = req.query;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
  try {
    const cities = await getUserSubscribedCities(telegram_id);
    res.json({ cities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};