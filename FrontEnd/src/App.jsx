import { useState } from "react";
import { useUserCity } from "./hooks/useUserCity";
import { useRecentCities } from "./hooks/useRecentCities";
import Header from "./components/Header";
import Body from "./components/Body";
import TelegramLogin from "./components/TelegramLogin";

function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const userCity = useUserCity();
  const [recent, setRecent] = useRecentCities(userCity);

  const handleTelegramAuth = (user) => {
    alert("Prisijungėte per Telegram: " + user.username);
  };

  return (
    <>
      <Header
        onCitySelect={setSelectedCity}
        recent={recent}
        handleSearch={setSelectedCity}
      >
        <div className="flex w-72 z-20 absolute left-1/2 -translate-x-1/2">
          <TelegramLogin onAuth={handleTelegramAuth} />
        </div>
      </Header>
      <Body
        selectedCity={selectedCity}
        recent={recent}
        setRecent={setRecent}
      />
    </>
  );
}
export default App;