import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserFromCookie } from "../utils/auth";

export default function SubscribedCities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getUserFromCookie();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/subscription/user-cities?telegram_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCities(Array.isArray(data.cities) ? data.cities : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load subscribed cities");
        setLoading(false);
      });
  }, [user?.id]);

  if (!user?.id) return null;
  if (loading) return <div className="text-gray-500 text-center my-2">Loading your subscriptions...</div>;
  if (error) return <div className="text-red-500 text-center my-2">{error}</div>;

  return (
    <div className="my-4 w-full flex flex-col items-center">
      <h3 className="font-semibold text-blue-700 mb-2">Your Subscribed Cities</h3>
      {cities.length === 0 ? (
        <div className="text-gray-500">You have no city subscriptions.</div>
      ) : (
        <ul className="flex flex-wrap gap-2 justify-center">
          {cities.map((city) => (
            <li key={city}>
              <button
                className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium border border-blue-300 hover:bg-blue-200 transition"
                onClick={() => navigate(`/${encodeURIComponent(city)}`)}
              >
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}