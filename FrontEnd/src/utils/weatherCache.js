/**
 * Get cached weather data for a city and view.
 * @param {string} city - City name.
 * @param {string} view - View type (e.g., "hourly", "7days").
 * @returns {Object|null} Cached data or null if not found/expired.
 */

export function getWeatherCache(city, view) {
  try {
    const key = `weather_${city}_${view}`;
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    // Optional: expire cache after 10 minutes
    if (Date.now() - timestamp > 10 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Set weather data in cache for a city and view.
 * @param {string} city - City name.
 * @param {string} view - View type.
 * @param {Object} data - Data to cache.
 */

export function setWeatherCache(city, view, data) {
  try {
    const key = `weather_${city}_${view}`;
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

/**
 * Clear all cached weather data for a city.
 * @param {string} city - City name.
 */

export function clearWeatherCache(city) {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(`weather_${city}_`))
    .forEach((key) => localStorage.removeItem(key));
}