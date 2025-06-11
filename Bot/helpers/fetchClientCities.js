const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * Fetches client city data from the backend API (localhost/manoapi/klientomiestas).
 * Returns JSON array, or throws error if fetch fails.
 */
async function fetchClientCities() {
  const url = 'http://localhost:3001/api/cities';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API klaida: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

module.exports = fetchClientCities;
