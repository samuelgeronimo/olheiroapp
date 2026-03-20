"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import MapWrapper from '@/components/MapWrapper';
import Paywall from '@/components/Paywall';
import { usePOIs } from '@/hooks/usePOIs';
import { useSubscription } from '@/hooks/useSubscription';
import { AlertTriangle } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useProximityAlert } from '@/hooks/useProximityAlert';
import { supabase } from '@/lib/supabase';
import styles from './map.module.css';

export default function MapClient() {
  const { isSubscribed, setSubscription } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const [proximityAlert, setProximityAlert] = useState<string | null>(null);
  const { pois, loading } = usePOIs();
  const { location: userLocation } = useGeolocation(false);

  // Hook do Motor de Conversão (Fase 3)
  useProximityAlert(userLocation, pois, isSubscribed, (poiName) => {
    setProximityAlert(poiName);
  });

  if (loading) return <div className="container" style={{ padding: '20px', color: '#fff' }}>Carregando radar...</div>;

  return (
    <div className={styles.wrapper}>
      {showPaywall && !isSubscribed && (
        <Paywall onSubscribe={() => {
          setSubscription(true);
          setShowPaywall(false);
        }} />
      )}

      {/* Alerta de Proximidade (Gatilho Hormozi) */}
      {!isSubscribed && proximityAlert && (
        <div 
          className={styles.riskAlert} 
          onClick={() => setShowPaywall(true)}
          style={{
            position: 'absolute',
            top: '80px',
            left: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #ff4444 0%, #b91c1c 100%)',
            color: '#fff',
            padding: '16px',
            borderRadius: '16px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
            cursor: 'pointer',
            animation: 'slideDown 0.5s ease-out'
          }}
        >
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '2px' }}>ALERTA DE RISCO!</strong>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>{proximityAlert} detectado. Assine para ver detalhes.</p>
          </div>
        </div>
      )}

      <Header />
      
      <main className="container">
        <h2 style={{ margin: '20px 0' }}>Mapa de Monitoramento</h2>
        <MapWrapper 
          pois={pois} 
          isSubscribed={isSubscribed} 
          onShowPaywall={() => setShowPaywall(true)}
        />
        
        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--secondary-bg)', borderRadius: '12px' }}>
          <h4>Dica do Olheiro:</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toque nos ícones para ver detalhes de cada posto e a última atualização dos membros da comunidade.</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
