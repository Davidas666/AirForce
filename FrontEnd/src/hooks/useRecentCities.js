import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export function useRecentCities(userCity) {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try {
      const fromCookie = Cookies.get("recentCities");
      if (fromCookie) {
        const parsed = JSON.parse(fromCookie);
        if (Array.isArray(parsed)) setRecent(parsed);
      }
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    if (recent.length > 0) {
      Cookies.set("recentCities", JSON.stringify(recent), { expires: 30 });
    }
  }, [recent]);

  useEffect(() => {
    if (userCity && userCity.trim()) {
      setRecent((prev) => {
        const filtered = prev.filter(
          (c) => c.toLowerCase() !== userCity.toLowerCase()
        );
        const updated = [userCity, ...filtered].slice(0, 3);
        Cookies.set("recentCities", JSON.stringify(updated), { expires: 30 });
        return updated;
      });
    }
  }, [userCity]);

  return [recent, setRecent];
}