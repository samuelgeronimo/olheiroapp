import { Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { useState, useEffect, useCallback } from 'react';
import { POI } from '@/lib/supabase';
import { Navigation, RefreshCw, AlertCircle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/dateUtils';
import Link from 'next/link';

interface Props {
  pois: POI[];
  isSubscribed: boolean;
  onShowPaywall: () => void;
}

import { useGeolocation } from '@/hooks/useGeolocation';

export default function GoogleMapComponent({ pois, isSubscribed, onShowPaywall }: Props) {
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasCentered, setHasCentered] = useState(false);
  const map = useMap();
  const { location: userLocation, error: geoError } = useGeolocation(isFollowing);

  useEffect(() => {
    if (userLocation && !hasCentered && map) {
      map.panTo(userLocation);
      map.setZoom(13);
      setHasCentered(true);
    }

    if (userLocation && isFollowing && map) {
      map.panTo(userLocation);
    }
  }, [userLocation, map, hasCentered, isFollowing]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const toggleFollow = useCallback(() => {
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    
    if (nextFollowing && userLocation && map) {
      map.panTo(userLocation);
      map.setZoom(15);
    }
  }, [isFollowing, userLocation, map]);

  const getMarkerColors = (status: string) => {
    switch (status) {
      case 'sujo': return { background: '#ff4444', border: '#b91c1c', glyph: '#7f1d1d' };
      case 'atencao': return { background: '#fbbf24', border: '#d97706', glyph: '#92400e' };
      default: return { background: '#10b981', border: '#059669', glyph: '#064e3b' };
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {geoError && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255, 68, 68, 0.95)',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: '30px',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          fontSize: '13px',
          fontWeight: 'bold',
          backdropFilter: 'blur(4px)'
        }}>
          <AlertCircle size={18} />
          <span>GPS: {geoError}</span>
          <button 
            onClick={handleRefresh}
            style={{
              backgroundColor: '#fff',
              color: '#ff4444',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw size={12} />
            RECARREGAR
          </button>
        </div>
      )}

      <Map
        defaultCenter={{ lat: -25.5083, lng: -54.5125 }}
        defaultZoom={11}
        mapId="bf51a910020fa566"
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Render User Location Marker */}
        {userLocation && (
          <AdvancedMarker position={userLocation} zIndex={100}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#4285F4',
              border: '3px solid white',
              borderRadius: '50%',
              boxShadow: '0 0 10px rgba(66, 133, 244, 0.6)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                backgroundColor: 'rgba(66, 133, 244, 0.2)',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
            </div>
            <style jsx>{`
              @keyframes pulse {
                0% { transform: scale(0.5); opacity: 1; }
                100% { transform: scale(1.5); opacity: 0; }
              }
            `}</style>
          </AdvancedMarker>
        )}

        {pois.map((poi) => {
          const colors = getMarkerColors(poi.status);
          const isBlurred = !isSubscribed;

          return (
            <AdvancedMarker
              key={poi.id}
              position={{ lat: poi.lat, lng: poi.lng }}
              onClick={() => {
                if (isSubscribed) {
                  setSelectedPoi(poi);
                } else {
                  onShowPaywall();
                }
              }}
            >
              <div style={{
                filter: isBlurred ? 'blur(4px)' : 'none',
                opacity: isBlurred ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}>
                <Pin 
                  background={isBlurred ? '#64748b' : colors.background} 
                  borderColor={isBlurred ? '#475569' : colors.border} 
                  glyphColor={isBlurred ? '#334155' : colors.glyph}
                  scale={1.2}
                />
              </div>
            </AdvancedMarker>
          );
        })}

        {selectedPoi && (
          <InfoWindow
            position={{ lat: selectedPoi.lat, lng: selectedPoi.lng }}
            onCloseClick={() => setSelectedPoi(null)}
          >
            <div style={{ color: '#000', padding: '8px', minWidth: '160px', borderRadius: '8px' }}>
              <strong style={{ display: 'block', fontSize: '15px', marginBottom: '6px', color: '#1a1a1a' }}>
                {selectedPoi.name}
              </strong>
              
              <div style={{ marginBottom: '8px' }}>
                <span style={{ 
                  backgroundColor: getMarkerColors(selectedPoi.status).background,
                  color: selectedPoi.status === 'atencao' ? '#000' : '#fff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '900',
                  letterSpacing: '0.5px'
                }}>
                  {selectedPoi.status.toUpperCase()}
                </span>
                <span style={{ fontSize: '10px', color: '#666', marginLeft: '6px' }}>
                  {formatRelativeTime(selectedPoi.last_update || selectedPoi.lastUpdate)}
                </span>
              </div>

              <Link 
                href={`/poi/${selectedPoi.id}`}
                style={{
                  display: 'block',
                  padding: '10px',
                  backgroundColor: '#000', // Black for maximum contrast
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  textAlign: 'center',
                  marginTop: '10px'
                }}
              >
                ATUALIZAR STATUS
              </Link>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Floating Follow Button */}
      <button
        onClick={toggleFollow}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '25px',
          backgroundColor: isFollowing ? '#4285F4' : '#fff',
          color: isFollowing ? '#fff' : '#4285F4',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        aria-label="Seguir localização"
      >
        <Navigation 
          size={20} 
          fill={isFollowing ? "currentColor" : "none"}
          style={{ 
            transform: isFollowing ? 'rotate(45deg)' : 'none',
            transition: 'transform 0.3s ease'
          }} 
        />
      </button>
    </div>
  );
}
