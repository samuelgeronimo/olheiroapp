import { useState, useEffect } from 'react';

export function useGeolocation(isFollowing: boolean) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;

    let watchId: number;

    const startWatching = () => {
      return navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setError(null);
        },
        (error) => {
          let msg = '';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              msg = 'Permissão negada';
              break;
            case error.POSITION_UNAVAILABLE:
              msg = 'Sinal indisponível';
              break;
            case error.TIMEOUT:
              msg = 'Sinal fraco (Timeout)';
              break;
            default:
              msg = 'Erro no GPS';
          }
          setError(msg);
        },
        {
          enableHighAccuracy: isFollowing,
          maximumAge: 2000,
          timeout: 10000,
        }
      );
    };

    watchId = startWatching();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        navigator.geolocation.clearWatch(watchId);
      } else {
        watchId = startWatching();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFollowing]);

  return { location, error };
}
