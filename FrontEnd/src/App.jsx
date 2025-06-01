import { useState } from "react";
import Header from "./components/Header";
import Weather from "./components/Weather";
import MultiDayWeather from "./components/MultiDayWeather";
import "./App.css";
import Body from "./components/Body";
import TelegramLogin from "./components/TelegramLogin";

function App() {
  const [selectedCity, setSelectedCity] = useState(null);

  const handleTelegramAuth = (user) => {
    alert("Prisijungėte per Telegram: " + user.username);
  };

  return (
    <>
      <Header onCitySelect={setSelectedCity} />
      <Body selectedCity={selectedCity} />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-8">
        <TelegramLogin onAuth={handleTelegramAuth} />
        <div className="w-full flex justify-between px-10 mb-2">
          <span className="text-red-700 font-semibold">orų prognozė</span>
          <span className="text-red-700 font-semibold">
            5 dienų orų prognozė
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-10 items-start justify-center w-full max-w-5xl">
          <div className="flex-1 flex justify-center">
            <Weather />
          </div>
          <div className="flex-1 flex justify-center">
            <MultiDayWeather />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;