import { useEffect, useState } from "react";
import FavoriteCitiesUI from "./FavoriteCitiesUI";
import { useUserCity } from "../hooks/useUserCity";

export default function FavoriteCitiesSidebar({ currentCity }) {
  const [favoriteCities, setFavoriteCities] = useState([]);
  const [loading, setLoading] = useState(true);

  function getUserFromCookie() {
    const userCookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("telegram_user="));
    if (!userCookie) return null;
    try {
      return JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
    } catch {
      return null;
    }
  }

  // Užkrauna mėgstamus miestus iš naujo modelio (favorite_cities lentelės)
  useEffect(() => {
    const user = getUserFromCookie();
    if (user?.id) {
      fetch(`/api/favorite-cities?telegram_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setFavoriteCities(Array.isArray(data.cities) ? data.cities : []);
          setLoading(false);
        })
        .catch(() => {
          setFavoriteCities([]);
          setLoading(false);
        });
    } else {
      setFavoriteCities([]);
      setLoading(false);
    }
  }, []);

  // Stebi naudotojo pasikeitimą (prisijungimą/atsijungimą) ir atnaujina sąrašą
  useEffect(() => {
    let lastUserId = getUserFromCookie()?.id;
    const interval = setInterval(() => {
      const currentUserId = getUserFromCookie()?.id;
      if (currentUserId !== lastUserId) {
        lastUserId = currentUserId;
        setLoading(true);
        if (currentUserId) {
          fetch(`/api/favorite-cities?telegram_id=${currentUserId}`)
            .then((res) => res.json())
            .then((data) => {
              setFavoriteCities(Array.isArray(data.cities) ? data.cities : []);
              setLoading(false);
            })
            .catch(() => {
              setFavoriteCities([]);
              setLoading(false);
            });
        } else {
          setFavoriteCities([]);
          setLoading(false);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Prideda miestą į DB ir atnaujina sąrašą
  const addFavoriteCity = (city) => {
    const user = getUserFromCookie();
    if (user?.id && city && !favoriteCities.includes(city)) {
      fetch('/api/favorite-cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: user.id, city_name: city })
      })
        .then(() => {
          setFavoriteCities([...favoriteCities, city]);
        });
    }
  };

  // Pašalina miestą iš DB ir atnaujina sąrašą
  const removeFavoriteCity = (city) => {
    const user = getUserFromCookie();
    if (user?.id && city) {
      fetch(`/api/favorite-cities?telegram_id=${user.id}&city_name=${encodeURIComponent(city)}`, {
        method: 'DELETE'
      })
        .then(() => {
          setFavoriteCities(favoriteCities.filter((c) => c !== city));
        });
    }
  };

  if (loading) return <div className="p-4">Kraunama...</div>;

  return (
    <aside className="w-80 min-w-[260px] max-w-xs bg-gray-50 border rounded p-4 self-start">
      <h2 className="font-bold mb-2">Mėgstami miestai</h2>
      <FavoriteCitiesUI
        favoriteCities={favoriteCities}
        setFavoriteCities={{ add: addFavoriteCity, remove: removeFavoriteCity }}
        currentCity={currentCity}
      />
    </aside>
  );
}
