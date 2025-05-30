const { fetchForecastByCity, fetchMultiDayForecastByCity } = require('../models/forecastModel');

exports.getForecastByCity = async (req, res) => {
  const city = req.params.city;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  try {
    const data = await fetchForecastByCity(city, apiKey);
    res.json(data);
  } catch (error) {
    res.status(500).json({ klaida: 'Nepavyko gauti prognozės', error: error.message });
  }
};

exports.getMultiDayForecastByCity = async (req, res) => {
  const city = req.params.city;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  try {
    const data = await fetchMultiDayForecastByCity(city, apiKey);
    res.json(data);
  } catch (error) {
    res.status(500).json({ klaida: 'Nepavyko gauti kelių dienų prognozės', error: error.message });
  }
};
