function parseWeatherResponse(apiResponse) {
// Validate the input to ensure it is an object
  if (!apiResponse || typeof apiResponse !== 'object') {
    throw new Error('Invalid API response format');
  }

  const main = apiResponse.main;
  const weatherArray = apiResponse.weather;
  const wind = apiResponse.wind;

  if (!main || !weatherArray || !Array.isArray(weatherArray) || weatherArray.length === 0) {
    throw new Error('Missing main, weather or wind data in API response');
  }

  const temperature = main.temp;
  const humidity = main.humidity;
  const description = weatherArray[0].description;
  const windSpeed = wind?.speed ?? 0;
  const datetime = new Date().toISOString();

  if (typeof temperature !== 'number' || temperature < -100 || temperature > 60) {
    throw new Error('Temperature out of expected range');
  }

  if (typeof humidity !== 'number' || humidity < 0 || humidity > 100) {
    throw new Error('Humidity out of expected range');
  }

  if (typeof windSpeed !== 'number' || windSpeed < 0) {
    throw new Error('Wind speed out of expected range');
  }

  if (typeof description !== 'string' || description.trim() === '') {
    throw new Error('Missing or empty weather description');
  }

  return {
    datetime,
    temperature,
    humidity,
    description,
    windSpeed
  };
}

module.exports = parseWeatherResponse;
