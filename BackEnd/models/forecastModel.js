const axios = require('axios');

// This module provides functions to fetch weather forecasts from the OpenWeatherMap API.
async function fetchForecastByCity(city, apiKey) {
  const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: {
      q: city,
      appid: apiKey,
      units: 'metric',
      lang: 'en'
    }
  });
  return response.data;
}

// Fetches a multi-day weather forecast for a given city.
async function fetchMultiDayForecastByCity(city, apiKey) {
  const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
    params: {
      q: city,
      appid: apiKey,
      units: 'metric',
      lang: 'en'
    }
  });
  return response.data;
}

// Fetches an hourly weather forecast for a given city.
async function fetchHourlyForecastByCity(city, apiKey) {
  const response = await axios.get('https://pro.openweathermap.org/data/2.5/forecast/hourly', {
    params: {
      q: city,
      appid: apiKey,
      units: 'metric',
      lang: 'en'
    }
  });
  return response.data;
}

// Fetches a daily weather forecast for a given city.
async function fetchDailyForecastByCity(city, cnt, apiKey) {
  const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast/daily', {
    params: {
      q: city,
      cnt,
      appid: apiKey,
      units: 'metric',
      lang: 'en'
    }
  });
  return response.data;
}

// Fetches an hourly weather forecast for a given city with a specified count.
async function fetchHourlyForecastByCityCnt(city, cnt, apiKey) {
  const response = await axios.get('https://pro.openweathermap.org/data/2.5/forecast/hourly', {
    params: {
      q: city,
      appid: apiKey,
      units: 'metric',
      lang: 'en',
      cnt: cnt
    }
  });
  return response.data;
}


module.exports = {
  fetchForecastByCity,
  fetchMultiDayForecastByCity,
  fetchHourlyForecastByCity,
  fetchDailyForecastByCity,
  fetchHourlyForecastByCityCnt,
};
