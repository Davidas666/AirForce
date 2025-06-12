import { useNavigate } from "react-router-dom";

export default function UserCityDisplay({ city }) {
  const navigate = useNavigate();
  if (!city) return null;
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