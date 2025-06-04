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

export function setWeatherCache(city, view, data) {
  try {
    const key = `weather_${city}_${view}`;
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

export function clearWeatherCache(city) {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(`weather_${city}_`))
    .forEach((key) => localStorage.removeItem(key));
}