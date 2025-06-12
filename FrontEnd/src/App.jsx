import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useUserCity } from "./hooks/useUserCity";
import { useRecentCities } from "./hooks/useRecentCities";
import Header from "./components/Header";
import Body from "./components/Body";
import Footer from "./components/Footer";
import FavoriteWindow from "./components/FavoriteWindow";
import { getUserFromCookie } from "./utils/auth";

function CityPage({ setRecent, setBodyError }) {
  const { city } = useParams();
  return (
    <Body selectedCity={city} setRecent={setRecent} setError={setBodyError} />
  );
}

function AppRoutes({
  selectedCity,
  setSelectedCity,
  recent,
  setRecent,
  bodyError,
  setBodyError,
  handleTelegramAuth,
}) {
  const userCity = useUserCity();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to /userCity if on "/" and userCity is detected
  useEffect(() => {
    if (
      userCity &&
      userCity.trim() &&
      location.pathname === "/" &&
      typeof window !== "undefined"
    ) {
      navigate(`/${encodeURIComponent(userCity)}`, { replace: true });
    }
  }, [userCity, location.pathname, navigate]);

  return (
    <>
      <Header
        onCitySelect={setSelectedCity}
        recent={recent}
        handleSearch={setSelectedCity}
      />
      <Routes>
        <Route
          path="/:city"
          element={
            <>
              <CityPage setRecent={setRecent} setBodyError={setBodyError} />
              <FavoriteWindow
                cityNotFound={
                  !!bodyError && bodyError.includes("Failed to fetch data")
                }
              />
            </>
          }
        />
        <Route
          path="/"
          element={
            <Body
              selectedCity={selectedCity}
              setRecent={setRecent}
              setError={setBodyError}
            />
          }
        />
      </Routes>
      <Footer onTelegramAuth={handleTelegramAuth} />
    </>
  );
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const userCity = useUserCity();
  const [recent, setRecent] = useRecentCities(userCity);
  const [bodyError, setBodyError] = useState("");
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
    <BrowserRouter>
      <AppRoutes
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        recent={recent}
        setRecent={setRecent}
        bodyError={bodyError}
        setBodyError={setBodyError}
        handleTelegramAuth={handleTelegramAuth}
      />
    </BrowserRouter>
  );
}
