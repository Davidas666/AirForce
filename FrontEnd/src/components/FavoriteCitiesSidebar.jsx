import FavoriteCitiesUI from "./FavoriteCitiesUI";
import { useState, useEffect } from "react";

export default function FavoriteCitiesSidebar() {
  const [favoriteCities, setFavoriteCities] = useState(() => {
    const stored = localStorage.getItem("favoriteCities");
    return stored ? JSON.parse(stored) : [];
  });
  useEffect(() => {
    localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));
  }, [favoriteCities]);

  return (
    <aside className="w-80 min-w-[260px] max-w-xs bg-gray-50 border rounded p-4 self-start">
      <h2 className="font-bold mb-2">Mėgstami miestai</h2>
      <FavoriteCitiesUI favoriteCities={favoriteCities} setFavoriteCities={setFavoriteCities} />
    </aside>
  );
}
