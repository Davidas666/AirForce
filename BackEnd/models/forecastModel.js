const axios = require('axios');

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
