export default function ViewButtons({ view, setView }) {
  const views = [
    { key: "today", label: "Today" },
    { key: "hourly", label: "Hourly" },
    { key: "7days", label: "7 days" },
  ];
  return (
    <div className="flex gap-4 mb-6">
      {views.map(({ key, label }) => (
        <button
          key={key}
          className={`px-4 py-2 rounded font-semibold border ${
            view === key ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setView(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}