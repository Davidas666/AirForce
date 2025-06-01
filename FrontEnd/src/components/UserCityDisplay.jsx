export default function UserCityDisplay({ city }) {
  if (!city) return null;
  return (
    <span className="ml-4 text-gray-500 text-sm">
      📍 Nearest city: <span className="font-semibold">{city}</span>
    </span>
  );
}