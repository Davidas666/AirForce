const axios = require('axios');

async function fetchForecastByCity(city, apiKey) {
  const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: {
      q: city,
      appid: apiKey,
      units: 'metric',
      lang: 'lt'
    }
  });
  return response.data;
}

async function fetchMultiDayForecastByCity(city, apiKey) {
  const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
    params: {
      q: city,
      appid: apiKey,
      units: 'metric',
      lang: 'lt'
    }
  });
  return response.data;
}

module.exports = { fetchForecastByCity, fetchMultiDayForecastByCity };
