import TelegramLogin from "./TelegramLogin";

// Modern, minimal footer for AirForce Weather
export default function Footer({ onTelegramAuth }) {
  return (
    <footer className="w-full bg-gray-100 border-t py-4 text-center text-gray-600 text-sm fixed bottom-0 left-0 z-50" style={{minHeight:'64px'}}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 px-4">
        <span>
          &copy; {new Date().getFullYear()} AirForce Weather &bull; <a href="https://airforce.pics" className="text-blue-500 hover:underline">airforce.pics</a>
        </span>
        <span className="flex flex-col md:flex-row md:items-center gap-2">
          Powered by <a href="https://t.me/davidas666" className="text-blue-500 hover:underline ml-1" target="_blank" rel="noopener noreferrer">Davidas</a>
          and <a href="https://t.me/Matixonub" className="text-blue-500 hover:underline ml-1" target="_blank" rel="noopener noreferrer">Raimondas</a>
          <span className="hidden md:inline mx-2">|</span>
          <TelegramLogin onAuth={onTelegramAuth} />
        </span>
      </div>
    </footer>
  );
}
