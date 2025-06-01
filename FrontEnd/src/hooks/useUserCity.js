import { useEffect, useState } from 'react';
import { getCityByIP } from '../utils/getCityByIP';

export function useUserCity() {
  const [userCity, setUserCity] = useState('');

  useEffect(() => {
    getCityByIP().then(setUserCity);
  }, []);

  return userCity;
}