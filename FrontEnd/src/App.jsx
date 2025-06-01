import { useState } from "react";
import Header from "./components/Header";
import "./App.css";
import Body from "./components/Body";

function App() {
  const [selectedCity, setSelectedCity] = useState(null);

  return (
    <>
      <Header onCitySelect={setSelectedCity} />
      <Body selectedCity={selectedCity} />
    </>
  );
}

export default App;