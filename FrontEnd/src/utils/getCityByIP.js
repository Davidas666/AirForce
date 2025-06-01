export async function getCityByIP() {
  // try ipapi.co first
  try {
    let res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      let data = await res.json();
      if (data.city) return data.city;
    }
  } catch {}

  // fallback to ipwho.is if ipapi.co fails
  try {
    let res = await fetch('https://ipwho.is/');
    if (res.ok) {
      let data = await res.json();
      if (data.city) return data.city;
    }
  } catch {}

  // if both fail, return empty string
  return '';
}