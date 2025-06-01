export default function UserCityDisplay({ city }) {
  if (!city) return null;
  return (
    <span className="text-gray-500 text-sm whitespace-nowrap truncate max-w-[120px] overflow-hidden">
      📍 {city}
    </span>
  );
}