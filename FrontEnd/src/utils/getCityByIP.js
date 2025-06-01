export async function getCityByIP() {
  try {
    const res = await fetch('https://ip-api.io/json?nocache=' + Date.now());
    if (!res.ok) throw new Error('Failed to fetch IP location');
    const data = await res.json();
    return data.city || '';
  } catch {
    return '';
  }
}