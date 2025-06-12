const parseWeather = require('../utils/parseWeather');

describe('parseWeatherResponse', () => {
  it('should parse valid response correctly', () => {
    const mockData = {
      main: { temp: 20, humidity: 50 },
      weather: [{ description: 'clear sky' }],
      wind: { speed: 5 }
    };

    const result = parseWeather(mockData);

    expect(result.temperature).toBe(20);
    expect(result.humidity).toBe(50);
    expect(result.description).toBe('clear sky');
    expect(result.windSpeed).toBe(5);
    expect(typeof result.datetime).toBe('string');
  });

  it('should throw error for invalid temperature', () => {
    const data = {
      main: { temp: 999, humidity: 50 },
      weather: [{ description: 'clear sky' }],
      wind: { speed: 2 }
    };
    expect(() => parseWeather(data)).toThrow('Temperature out of expected range');
  });

  it('should throw error for missing description', () => {
    const data = {
      main: { temp: 20, humidity: 50 },
      weather: [{ description: '' }],
      wind: { speed: 2 }
    };
    expect(() => parseWeather(data)).toThrow('Missing or empty weather description');
  });

  it('should throw error for invalid humidity', () => {
    const data = {
      main: { temp: 20, humidity: 200 },
      weather: [{ description: 'cloudy' }],
      wind: { speed: 2 }
    };
    expect(() => parseWeather(data)).toThrow('Humidity out of expected range');
  });

  it('should throw error for missing weather data', () => {
    const data = {
      main: { temp: 20, humidity: 50 },
      wind: { speed: 2 }
    };
    expect(() => parseWeather(data)).toThrow('Missing main, weather or wind data in API response');
  });
});
