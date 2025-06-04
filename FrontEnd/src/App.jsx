import { useState, useEffect } from "react";
import { useUserCity } from "./hooks/useUserCity";
import { useRecentCities } from "./hooks/useRecentCities";
import Header from "./components/Header";
import Body from "./components/Body";
import Footer from "./components/Footer";
import FavoriteWindow from "./components/FavoriteWindow";
import { getUserFromCookie } from "./utils/auth";

export default function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const userCity = useUserCity();
  const [recent, setRecent] = useRecentCities(userCity);

  // User state (for login/logout)
  const [user, setUser] = useState(getUserFromCookie());
  useEffect(() => {
    const interval = setInterval(() => {
      setUser(getUserFromCookie());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
<FavoriteWindow
  selectedCity={selectedCity}
  onSelect={setSelectedCity}
/>
      <Body
        selectedCity={selectedCity}
        recent={recent}
        setRecent={setRecent}
        // Remove favoriteCities, onAddFavorite, onRemoveFavorite props!
      />
      <Footer onTelegramAuth={handleTelegramAuth} />
    </>
  );
}