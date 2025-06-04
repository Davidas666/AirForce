import { useEffect, useState } from "react";
import FavoriteCitiesUI from "./FavoriteCitiesUI";

export default function FavoriteCitiesSidebar() {
  const [favoriteCities, setFavoriteCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Bandome gauti iš localStorage, bet jei yra prisijungęs naudotojas – iš DB
    const userCookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("telegram_user="));
    if (userCookie) {
      try {
        const userObj = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
        fetch(`/api/telegram-users?id=${userObj.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (
              data &&
              data.users &&
              data.users[0] &&
              data.users[0].favorite_cities
            ) {
              setFavoriteCities(data.users[0].favorite_cities);
              localStorage.setItem(
                "favoriteCities",
                JSON.stringify(data.users[0].favorite_cities)
              );
            } else {
              // fallback į localStorage jei nėra DB duomenų
              const stored = localStorage.getItem("favoriteCities");
              setFavoriteCities(stored ? JSON.parse(stored) : []);
            }
            setLoading(false);
          })
          .catch(() => {
            const stored = localStorage.getItem("favoriteCities");
            setFavoriteCities(stored ? JSON.parse(stored) : []);
            setLoading(false);
          });
      } catch {
        const stored = localStorage.getItem("favoriteCities");
        setFavoriteCities(stored ? JSON.parse(stored) : []);
        setLoading(false);
      }
    } else {
      const stored = localStorage.getItem("favoriteCities");
      setFavoriteCities(stored ? JSON.parse(stored) : []);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));
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
