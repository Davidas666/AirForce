const { searchCities } = require('../models/cityModel');

exports.getCitySuggestions = (req, res) => {
  const query = req.query.query;
  const suggestions = searchCities(query);
  res.json(suggestions);
};