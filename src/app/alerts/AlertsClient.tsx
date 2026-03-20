"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import POIStatusCard from '@/components/POIStatusCard';
import Paywall from '@/components/Paywall';
import { usePOIs } from '@/hooks/usePOIs';
import { supabase, POI, PointStatus } from '@/lib/supabase';
import styles from './alerts.module.css';

export default function AlertsClient() {
  const [source, setSource] = useState('FOZ');
  const { pois, loading } = usePOIs();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleStatusChange = async (id: string, newStatus: PointStatus, reason: string) => {
    const now = new Date().toISOString();
    
    try {
      // 1. Update POI current state
      const { error: poiError } = await supabase
        .from('pois')
        .update({ 
          status: newStatus, 
          last_update: now 
        })
        .eq('id', id);

      if (poiError) throw poiError;

      // 2. Add to audit log
      const { error: historyError } = await supabase
        .from('status_updates')
        .insert({
          poi_id: id,
          status: newStatus,
          message: reason || `Sentido SAÍDA atualizado para ${newStatus.toUpperCase()}.`,
          timestamp: now
        });

      if (historyError) throw historyError;
      
      alert('Atualização salva com sucesso!');
    } catch (err: any) {
      alert('Erro ao atualizar: ' + err.message);
    }
  };

  if (!isSubscribed) {
    return <Paywall onSubscribe={() => setIsSubscribed(true)} />;
  }

  if (loading) return <div className="container">Carregando informações...</div>;

  return (
    <div className={styles.wrapper}>
      <Header />
      
      <main className="container">
        <h2 className={styles.title}>Atualizar Status</h2>
        
        <div className={styles.originSelector} style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>ORIGEM:</label>
          <select 
            value={source} 
            onChange={(e) => setSource(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--secondary-bg)', border: '1px solid #333', color: 'white' }}
          >
            <option value="FOZ">Foz do Iguaçu / CDE</option>
            <option value="SDG">Salto del Guairá</option>
            <option value="PJC">Pedro Juan Caballero</option>
          </select>
        </div>

        <p className={styles.subtitle}>
          {source === 'FOZ' && 'Foque no sentido **SAINDO DE FOZ** (Cascavel).'}
          {source === 'SDG' && 'Foque no sentido **SAINDO DE SALTO** (Guaíra).'}
          {source === 'PJC' && 'Foque no sentido **SAINDO DE PJC** (Ponta Porã).'}
        </p>
        
        <div className={styles.list}>
          {pois.filter(p => p.routes.includes(source.toLowerCase())).map(poi => (
            <POIStatusCard 
              key={poi.id} 
              poi={poi} 
              onStatusChange={(status, reason) => handleStatusChange(poi.id, status, reason)} 
            />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
