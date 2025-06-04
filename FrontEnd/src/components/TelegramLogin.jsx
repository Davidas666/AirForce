import { useEffect, useRef, useState } from 'react';
import UserMenu from './UserMenu';

export default function TelegramLogin({ onAuth }) {
  const containerRef = useRef(null);
  const fallbackRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteCities, setFavoriteCities] = useState(() => {
    // Užkrauna iš localStorage jei yra
    const stored = localStorage.getItem('favoriteCities');
    return stored ? JSON.parse(stored) : [];
  });

  // Išsaugo favoriteCities į localStorage ir DB kai keičiasi
  useEffect(() => {
    localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
    // Jei naudotojas prisijungęs, siunčia į backend
    if (isLoggedIn && user && user.id) {
      fetch('/api/telegram-user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: user.id, favorite_cities: favoriteCities })
      }).catch(e => console.error('Nepavyko išsaugoti mėgstamų miestų DB:', e));
    }
  }, [favoriteCities, isLoggedIn, user]);

  // Siunčia naudotoją į backend po prisijungimo
  const saveTelegramUser = async (userObj) => {
    try {
      await fetch('/api/telegram-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: userObj.id,
          username: userObj.username,
          first_name: userObj.first_name,
          last_name: userObj.last_name,
          photo_url: userObj.photo_url
        })
      });
    } catch (e) {
        console.error('Invalid error format:', e);
    }
  };

  useEffect(() => {
    // Tikrina ar yra naudotojo cookies ir automatiškai prisijungia
    if (!isLoggedIn) {
      const cookies = document.cookie.split(';').map(c => c.trim());
      const userCookie = cookies.find(c => c.startsWith('telegram_user='));
      if (userCookie) {
        try {
          const userObj = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          setIsLoggedIn(true);
          setUser(userObj);
          setLoading(false);
          return;
        } catch (e) {
          console.error('Invalid user cookie format:', e);
        }
      }
    }
    setLoading(false);
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

    window.onTelegramAuth = function(userObj) {
      setIsLoggedIn(true);
      setUser(userObj);
      // Įrašo visą naudotojo objektą į cookies (JSON, 7 dienos)
      document.cookie = `telegram_user=${encodeURIComponent(JSON.stringify(userObj))}; path=/; max-age=${60*60*24*7}`;
      saveTelegramUser(userObj);
      if (onAuth) onAuth(userObj);
    };
    return () => {
      window.onTelegramAuth = undefined;
      if (fallback) fallback.style.display = 'block';
      Array.from(container.childNodes).forEach(node => {
        if (node.tagName === 'SCRIPT') container.removeChild(node);
      });
    };
  }, [onAuth, isLoggedIn]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setShowMenu(false);
    // Pašalina naudotojo cookies
    document.cookie = 'telegram_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isLoggedIn && user) {
    return (
      <>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setShowMenu(true)}>Menu</button>
        {showMenu && <UserMenu user={user} onLogout={handleLogout} onClose={() => setShowMenu(false)} />}
        {/* Favorite cities UI */}
        <div className="mt-4 p-4 border rounded bg-gray-50 max-w-md mx-auto">
          <h2 className="font-bold mb-2">Mėgstami miestai</h2>
          <FavoriteCitiesUI favoriteCities={favoriteCities} setFavoriteCities={setFavoriteCities} />
        </div>
      </>
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

// FavoriteCitiesUI komponentas už pagrindinės funkcijos ribų
function FavoriteCitiesUI({ favoriteCities, setFavoriteCities }) {
  const [cityInput, setCityInput] = useState("");
  const addFavoriteCity = (city) => {
    if (city && !favoriteCities.includes(city)) {
      setFavoriteCities([...favoriteCities, city]);
      setCityInput("");
    }
  };
  const removeFavoriteCity = (city) => {
    setFavoriteCities(favoriteCities.filter(c => c !== city));
  };
  return (
    <div>
      <div className="flex mb-2">
        <input
          className="border rounded px-2 py-1 mr-2 flex-1"
          type="text"
          value={cityInput}
          onChange={e => setCityInput(e.target.value)}
          placeholder="Įveskite miestą"
        />
        <button className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded" onClick={() => addFavoriteCity(cityInput)}>
          Pridėti
        </button>
      </div>
      <ul>
        {favoriteCities.map(city => (
          <li key={city} className="flex items-center justify-between mb-1">
            <span>{city}</span>
            <button className="text-red-500 hover:underline ml-2" onClick={() => removeFavoriteCity(city)}>
              Pašalinti
            </button>
          </li>
        ))}
        {favoriteCities.length === 0 && <li className="text-gray-400">Nėra mėgstamų miestų</li>}
      </ul>
    </div>
  );
}
