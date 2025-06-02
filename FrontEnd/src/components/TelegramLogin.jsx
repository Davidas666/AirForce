import { useEffect } from 'react';

export default function TelegramLogin({ onAuth }) {
  useEffect(() => {
    const container = document.getElementById('telegram-login-container');
    if (!container) return;
    // Išvalome prieš įdedant naują script
    container.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'airforce_weather_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    container.appendChild(script);

    window.onTelegramAuth = function(user) {
      if (onAuth) onAuth(user);
    };
    return () => {
      window.onTelegramAuth = undefined;
      if (container) container.innerHTML = '';
    };
  }, [onAuth]);

  // Fallback button jei widgetas nesikrauna
  return (
    <div id="telegram-login-container" className="flex justify-center my-4">
      <noscript>
        <a
          href="https://t.me/airforce_weather_bot"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          target="_blank" rel="noopener noreferrer"
        >
          Prisijungti per Telegram
        </a>
      </noscript>
      {/* Jei JS neveikia arba widgetas nesikrauna, bus matomas šis mygtukas */}
      <a
        href="https://t.me/airforce_weather_bot"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block md:hidden"
        target="_blank" rel="noopener noreferrer"
      >
        Prisijungti per Telegram
      </a>
    </div>
  );
}
