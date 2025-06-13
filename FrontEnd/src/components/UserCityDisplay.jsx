import { useNavigate } from "react-router-dom";

export default function UserCityDisplay({ city }) {
  const navigate = useNavigate();
  // If no city is provided, return null
  if (!city) return null;
  // Return a button that navigates to the weather page for the IP city
  return (
    <button
      className="text-gray-500 text-sm whitespace-nowrap truncate max-w-[120px] overflow-hidden flex items-center hover:underline"
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      onClick={() => navigate(`/${encodeURIComponent(city)}`)}
      title="Weather in your city"
      type="button"
    >
      📍 {city}
    </button>
  );
}