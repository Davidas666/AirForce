import { useState } from "react";
import { useUserCity } from "./hooks/useUserCity";
import { useRecentCities } from "./hooks/useRecentCities";
import Header from "./components/Header";
import Body from "./components/Body";

function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const userCity = useUserCity();
  const [recent, setRecent] = useRecentCities(userCity);

  return (
    <>
      <Header
        onCitySelect={setSelectedCity}
        recent={recent}
        handleSearch={setSelectedCity}
      />
      <Body
        selectedCity={selectedCity}
        recent={recent}
        setRecent={setRecent}
      />
    </>
  );
}
export default App;