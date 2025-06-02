import { useEffect, useRef } from 'react';

export default function TelegramLogin({ onAuth }) {
  const containerRef = useRef(null);
  const fallbackRef = useRef(null);

  useEffect(() => {
    const container = document.getElementById('telegram-login-container');
    if (!container) return;
    // Išvalome tik widgeto scriptus, bet paliekame fallback mygtuką
    Array.from(container.childNodes).forEach(node => {
      if (node.tagName === 'SCRIPT') container.removeChild(node);
    });
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

    // Kai widgetas užsikrauna, paslepiame fallback mygtuką
    script.onload = () => {
      if (fallbackRef.current) fallbackRef.current.style.display = 'none';
    };
    // Jei widgetas nesikrauna per 3s, fallback lieka matomas
    setTimeout(() => {
      if (container.querySelector('iframe')) {
        if (fallbackRef.current) fallbackRef.current.style.display = 'none';
      } else {
        if (fallbackRef.current) fallbackRef.current.style.display = 'block';
      }
    }, 3000);

    window.onTelegramAuth = function(user) {
      if (onAuth) onAuth(user);
    };
    return () => {
      window.onTelegramAuth = undefined;
      if (fallbackRef.current) fallbackRef.current.style.display = 'block';
      // Pašaliname tik scriptus, fallback lieka
      Array.from(container.childNodes).forEach(node => {
        if (node.tagName === 'SCRIPT') container.removeChild(node);
      });
    };
  }, [onAuth]);

  return (
    <div className="flex flex-col items-center my-4">
      <div ref={containerRef} id="telegram-login-container" className="flex justify-center"></div>
      <a
        ref={fallbackRef}
        href="https://t.me/airforce_weather_bot"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
        target="_blank" rel="noopener noreferrer"
        style={{display: 'block'}}
      >
        Prisijungti per Telegram
      </a>
    </div>
  );
}
