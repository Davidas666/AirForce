const fs = require('fs');
const path = require('path');

let cityList = null;

function loadCityList() {
  if (!cityList) {
    cityList = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/CityList.json'), 'utf8')
    );
  }
  return cityList;
}

function searchCities(query) {
  const cities = loadCityList();
  const q = (query || '').toLowerCase();
  if (!q || q.length < 2) return [];
  return cities
    .filter(city => city.name.toLowerCase().includes(q))
    .slice(0, 10)
    .map(city => ({
      name: city.name,
      country: city.country
    }));
}

module.exports = {
  searchCities,
};