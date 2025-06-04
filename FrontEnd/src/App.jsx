import { useState, useEffect } from "react";
import { useUserCity } from "./hooks/useUserCity";
import { useRecentCities } from "./hooks/useRecentCities";
import Header from "./components/Header";
import Body from "./components/Body";
import Footer from "./components/Footer";
import FavoriteCitiesRow from "./components/FavoriteCitiesRow";
import { getUserFromCookie } from "./utils/auth";

export default function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const userCity = useUserCity();
  const [recent, setRecent] = useRecentCities(userCity);

  // Favorite cities from backend
  const [favoriteCities, setFavoriteCities] = useState([]);
  const [user, setUser] = useState(getUserFromCookie());

  // Listen for login/logout (optional: use context for better UX)
  useEffect(() => {
    const interval = setInterval(() => {
      setUser(getUserFromCookie());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  console.log("User:", user);
  console.log("Recent cities:", recent);
  console.log("UserCity: " + userCity);
  console.log("selectedCity: " + selectedCity);

  // Fetch favorite cities from backend
useEffect(() => {
  if (!user?.id) {
    setFavoriteCities([]);
    return;
  }
  fetch(`/api/favorite-cities?userId=${user.id}`)
    .then((res) => res.json())
    .then((data) => {
      setFavoriteCities(Array.isArray(data) ? data : []);
    })
    .catch(() => setFavoriteCities([]));
            console.log("loading: " + user.id, recent);

}, [user]);

const handleAddFavorite = (userCity) => {
  if (!user?.id || !userCity || favoriteCities.includes(userCity)) return;
  fetch('/api/favorite-cities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id, userCity })
  })
    .then(() => {
      setFavoriteCities([...favoriteCities, userCity]);
    });
            console.log("add: " + user.id, userCity);

};

const handleRemoveFavorite = (userCity) => {
  if (!user?.id || !userCity) return;
  fetch('/api/favorite-cities', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id, userCity })
  })
    .then(() => {
      setFavoriteCities(favoriteCities.filter((c) => c !== userCity));
    });
        console.log("Remove: " + user.id, userCity);

};

  const handleTelegramAuth = (user) => {
    alert("Prisijungėte per Telegram: " + user.username);
  };

  return (
    <>
      <Header
        onCitySelect={setSelectedCity}
        recent={recent}
        handleSearch={setSelectedCity}
      />
      <FavoriteCitiesRow
        favoriteCities={favoriteCities}
        onSelect={setSelectedCity}
      />
      <Body
        selectedCity={selectedCity}
        recent={recent}
        setRecent={setRecent}
        favoriteCities={favoriteCities}
        onAddFavorite={handleAddFavorite}
        onRemoveFavorite={handleRemoveFavorite}
      />
      <Footer onTelegramAuth={handleTelegramAuth} />
    </>
  );
}