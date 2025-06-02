import { useEffect } from 'react';

export default function TelegramLogin({ onAuth }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'airforce_weather_bot'); 
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    document.getElementById('telegram-login-container').appendChild(script);

    window.onTelegramAuth = function(user) {
      if (onAuth) onAuth(user);
    };
    return () => {
      window.onTelegramAuth = undefined;
    };
  }, [onAuth]);

  return (
    <div id="telegram-login-container" className="flex justify-center my-4"></div>
  );
}
