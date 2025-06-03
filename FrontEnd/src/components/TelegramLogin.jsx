import { useEffect, useRef, useState } from 'react';

export default function TelegramLogin({ onAuth }) {
  const containerRef = useRef(null);
  const fallbackRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) return;
    const container = containerRef.current;
    const fallback = fallbackRef.current;
    if (!container) return;
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
    // Fix: Telegram widget domain support (www and non-www)
    script.setAttribute('data-auth-url', window.location.origin + '/api/telegram-auth');
    container.appendChild(script);

    script.onload = () => {
      if (fallback) fallback.style.display = 'none';
    };
    setTimeout(() => {
      if (container.querySelector('iframe')) {
        if (fallback) fallback.style.display = 'none';
      } else {
        fallback && (fallback.style.display = 'block');
      }
    }, 3000);

    window.onTelegramAuth = function(user) {
      setIsLoggedIn(true);
      if (onAuth) onAuth(user);
    };
    return () => {
      window.onTelegramAuth = undefined;
      if (fallback) fallback.style.display = 'block';
      Array.from(container.childNodes).forEach(node => {
        if (node.tagName === 'SCRIPT') container.removeChild(node);
      });
    };
  }, [onAuth, isLoggedIn]);

  if (isLoggedIn) {
    return (
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => alert('Menu!')}>Menu</button>
    );
  }

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
