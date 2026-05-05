import { useEffect, useState, useRef } from 'react';
import { POI } from '@/lib/supabase';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

export function useProximityAlert(
  userLocation: { lat: number; lng: number } | null,
  pois: POI[],
  isSubscribed: boolean,
  onAlert: (poiName: string) => void
) {
  const lastAlertedPoiId = useRef<string | null>(null);

  useEffect(() => {
    if (!userLocation || isSubscribed || pois.length === 0) return;

    // Procura o POI mais próximo que não seja "livre" num raio de 1.5km
    const nearbyPoi = pois.find((poi) => {
      if (poi.status === 'livre') return false;
      const distance = getDistance(userLocation.lat, userLocation.lng, poi.lat, poi.lng);
      return distance < 1500; // 1.5km de proximidade para dar tempo de reação
    });

    if (nearbyPoi && nearbyPoi.id !== lastAlertedPoiId.current) {
      lastAlertedPoiId.current = nearbyPoi.id;
      onAlert(nearbyPoi.name);
    } else if (!nearbyPoi) {
      // Reseta se sair da zona de risco de qualquer POI
      lastAlertedPoiId.current = null;
    }
  }, [userLocation, pois, isSubscribed, onAlert]);
}
