const { searchCities } = require('../models/cityModel');

exports.getCitySuggestions = (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  const suggestions = searchCities(query);
  res.json(suggestions);
};
