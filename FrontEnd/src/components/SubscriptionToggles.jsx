import { useEffect, useState } from "react";
import { getUserFromCookie } from "../utils/auth";

const SUBS = [
  { key: "weekly", label: "Weekly" },
  { key: "morning", label: "Morning" },
  { key: "daily_thrice", label: "Weekly thrice" },
];

export default function SubscriptionToggles({ selectedCity }) {
  const [user, setUser] = useState(getUserFromCookie());
  const [subs, setSubs] = useState({});
  const [loading, setLoading] = useState(false);

  // Keep user in sync with cookie
  useEffect(() => {
    const interval = setInterval(() => setUser(getUserFromCookie()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch current subscriptions for this user/city
  useEffect(() => {
    if (!user?.id || !selectedCity) return;
    setLoading(true);
    fetch(`/api/subscription/user?telegram_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
          console.log("Subscription API data:", data);
        const found = (data.subscriptions || []).find(
          (s) => s.city.toLowerCase() === selectedCity.toLowerCase()
        );
        setSubs({
          weekly: !!found?.weekly_forecast || false,
          morning: !!found?.morning_forecast || false,
          daily_thrice: !!found?.daily_thrice_forecast || false,
        });
      })
      .finally(() => setLoading(false));
  }, [user?.id, selectedCity]);

  const handleToggle = (type) => {
    if (!user?.id || !selectedCity) return;
    const enabled = !subs[type];
    setLoading(true);
    fetch("/api/subscription/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegram_id: user.id,
        city: selectedCity,
        type,
        enabled,
      }),
    })
      .then((res) => res.json())
      .then(() => setSubs((prev) => ({ ...prev, [type]: enabled })))
      .finally(() => setLoading(false));
  };

  if (!user?.id || !selectedCity) return null;

  return (
    <div className="flex flex-col items-center my-4 p-4 bg-blue-50 rounded shadow max-w-md mx-auto">
      <div className="font-semibold mb-2 text-blue-700">
        Weather subscriptions for <span className="underline">{selectedCity}</span>
      </div>
      <div className="flex gap-4">
        {SUBS.map((s) => (
          <button
            key={s.key}
            className={`px-4 py-2 rounded-full font-semibold border transition ${
              subs[s.key]
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
            }`}
            disabled={loading}
            onClick={() => handleToggle(s.key)}
          >
            {s.label} {subs[s.key] ? "ON" : "OFF"}
          </button>
        ))}
      </div>
    </div>
  );
}