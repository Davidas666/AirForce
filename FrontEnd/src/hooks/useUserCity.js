import { useEffect, useState } from 'react';
import { getCityByIP } from '../utils/getCityByIP';

export function useUserCity() {
  const [userCity, setUserCity] = useState('');

  // Fetch user's city based on their IP address when the component mounts
  useEffect(() => {
    getCityByIP().then(setUserCity);
  }, []);

  return userCity;
}