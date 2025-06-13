export default function ViewButtons({ view, setView }) {
  // Define the available views with their keys and labels
  const views = [
    { key: "today", label: "Today" },
    { key: "hourly", label: "Hourly" },
    { key: "7days", label: "7 days" },
  ];

  // Return a set of buttons to switch between views
  return (
    <div className="flex gap-4 mb-6">
      {views.map(({ key, label }) => (
        <button
          key={key}
          className={`px-4 py-2 rounded-2xl font-semibold border transition-colors
            ${view === key
              ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-blue-500"
              : "bg-gray-100 text-gray-700 border-gray-300"}
          `}
          onClick={() => setView(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}