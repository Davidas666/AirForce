import { useEffect, useState } from "react";
import FavoriteCitiesUI from "./FavoriteCitiesUI";

export default function FavoriteCitiesSidebar() {
  const [favoriteCities, setFavoriteCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: get user from cookies
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

  // Load favorite cities ONLY from DB if user is logged in
  useEffect(() => {
    const user = getUserFromCookie();
    if (user?.id) {
      fetch(`/api/telegram-users?id=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          // Jei favorite_cities yra null, naudoti tuščią masyvą
          const dbCities = data?.users?.[0]?.favorite_cities ?? [];
          setFavoriteCities(Array.isArray(dbCities) ? dbCities : []);
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

  // Kai favoriteCities keičiasi ir naudotojas prisijungęs, išsaugoti į DB (be GET po POST, kad nebūtų ciklo)
  useEffect(() => {
    const user = getUserFromCookie();
    if (user?.id) {
      fetch('/api/telegram-user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: user.id, favorite_cities: favoriteCities })
      });
    }
  }, [favoriteCities]);

  if (loading) return <div className="p-4">Kraunama...</div>;

  return (
    <aside className="w-80 min-w-[260px] max-w-xs bg-gray-50 border rounded p-4 self-start">
      <h2 className="font-bold mb-2">Mėgstami miestai</h2>
      <FavoriteCitiesUI
        favoriteCities={favoriteCities}
        setFavoriteCities={setFavoriteCities}
      />
    </aside>
  );
}
