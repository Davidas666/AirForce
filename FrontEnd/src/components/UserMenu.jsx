import PropTypes from "prop-types";

export default function UserMenu({ user, onLogout, onClose }) {
  // Return menu component with user details and logout button
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Uždaryti"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-blue-700">Jūsų profilis</h2>
        <div className="mb-2">
          <span className="font-semibold">Telegram vartotojas:</span> @{user.username}
        </div>
        {user.photo_url && (
          <img src={user.photo_url} alt="User" className="w-20 h-20 rounded-full mx-auto mb-2" />
        )}
        <div className="mb-2">
          <span className="font-semibold">Vardas:</span> {user.first_name} {user.last_name || ""}
        </div>
        <button
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          onClick={onLogout}
        >
          Atsijungti
        </button>
      </div>
    </div>
  );
}

// PropTypes for UserMenu component
UserMenu.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    photo_url: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
