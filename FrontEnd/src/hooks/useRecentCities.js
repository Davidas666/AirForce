import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export function useRecentCities(userCity) {
  const [recent, setRecent] = useState([]);

  // Initialize recent cities from cookie on first render
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

  // Update cookie whenever recent cities change
  useEffect(() => {
    if (recent.length > 0) {
      Cookies.set("recentCities", JSON.stringify(recent), { expires: 30 });
    }
  }, [recent]);

  // Add userCity to recent cities if it's valid and not already present
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

  // Clear recent cities when userCity is empty
  return [recent, setRecent];
}