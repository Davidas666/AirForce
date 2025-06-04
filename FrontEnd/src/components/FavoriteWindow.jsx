import { useEffect, useState } from "react";
import FavoriteCitiesRow from "./FavoriteCitiesRow";
import { getUserFromCookie } from "../utils/auth";

export default function FavoriteWindow({ selectedCity, onSelect }) {
  const [favoriteCities, setFavoriteCities] = useState([]);
  const [user, setUser] = useState(getUserFromCookie());

  // Keep user in sync with cookie (in case of login/logout)
  useEffect(() => {
    const interval = setInterval(() => {
      setUser(getUserFromCookie());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch favorite cities on user change
  useEffect(() => {
    if (!user?.id) {
      setFavoriteCities([]);
      return;
    }
    fetch(`/api/favorite-cities?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setFavoriteCities(Array.isArray(data) ? data : []))
      .catch(() => setFavoriteCities([]));
  }, [user]);

  // Add favorite city


  return (
    <div>
      <FavoriteCitiesRow
        favoriteCities={favoriteCities}
        onSelect={onSelect}
        currentCity={selectedCity}
      />
    </div>
  );
}