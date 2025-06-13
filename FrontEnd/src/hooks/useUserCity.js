import { useEffect, useState } from 'react';
import { getCityByIP } from '../utils/getCityByIP';

/**
 * Custom React hook to get the user's city based on their IP address.
 * @returns {string} The detected city name or an empty string.
 */

export function useUserCity() {
  // ...hook code...
}
export function useUserCity() {
  const [userCity, setUserCity] = useState('');

  // Fetch user's city based on their IP address when the component mounts
  useEffect(() => {
    getCityByIP().then(setUserCity);
  }, []);

  return userCity;
}