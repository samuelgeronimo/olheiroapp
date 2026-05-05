"use client";

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import RoutePlanner from '@/components/RoutePlanner';
import { usePOIs } from '@/hooks/usePOIs';
import { useSubscription } from '@/hooks/useSubscription';
import { MapPin, Clock, AlertTriangle, Lock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import styles from './page.module.css';
import { formatRelativeTime } from '@/lib/dateUtils';
import { POI } from '@/lib/supabase';

export default function HomeClient({ initialPois = [] }: { initialPois?: POI[] }) {
  const [source, setSource] = useState('FOZ');
  const [destination, setDestination] = useState('curitiba');
  const [mounted, setMounted] = useState(false);
  const { pois: points, loading } = usePOIs(initialPois);
  const { isSubscribed } = useSubscription();

  useEffect(() => {
    console.log('HomeClient mounted. Subscription state:', isSubscribed);
    setMounted(true);
  }, [isSubscribed]);

  const handlePlan = (dest: string, src: string) => {
    setDestination(dest);
    setSource(src);
  };

  const sourceCoords = useMemo(() => {
    switch (source) {
      case 'FOZ': return { lat: -25.5000, lng: -54.5800 };
      case 'SDG': return { lat: -24.0300, lng: -54.3000 };
      case 'PJC': return { lat: -22.5400, lng: -55.7200 };
      default: return { lat: -25.5000, lng: -54.5800 };
    }
  }, [source]);

  const filteredPoints = useMemo(() => {
    return points
      .filter(p => p.routes.includes(`${source.toLowerCase()}-${destination}`))
      .sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.lat - sourceCoords.lat, 2) + Math.pow(a.lng - sourceCoords.lng, 2));
        const distB = Math.sqrt(Math.pow(b.lat - sourceCoords.lat, 2) + Math.pow(b.lng - sourceCoords.lng, 2));
        return distA - distB;
      });
  }, [points, source, destination, sourceCoords]);

  const overallStatus = useMemo(() => {
    if (filteredPoints.some(p => p.status === 'sujo')) return 'sujo';
    if (filteredPoints.some(p => p.status === 'atencao')) return 'atencao';
    return 'livre';
  }, [filteredPoints]);

  const getSourceLabel = () => {
    switch (source) {
      case 'FOZ': return 'Foz / CDE';
      case 'SDG': return 'Salto del Guairá';
      case 'PJC': return 'Pedro Juan Caballero';
      default: return 'Foz';
    }
  };

  const getDestinationLabel = () => {
    switch (destination) {
      case 'curitiba': return 'Curitiba';
      case 'ourinhos': return 'Ourinhos';
      case 'umuarama': return 'Umuarama';
      case 'maringa': return 'Maringá';
      case 'presidente-prudente': return 'Pres. Prudente';
      case 'pato-branco': return 'Pato Branco';
      case 'campo-grande': return 'Campo Grande';
      case 'dourados': return 'Dourados';
      default: return 'Leste (PR/SC/SP)';
    }
  };

  return (
    <div className={styles.wrapper}>
      <Header />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Olheiro Monitoring",
            "description": `Real-time collaborative route monitoring for Foz to ${destination}.`,
            "areaServed": "Foz do Iguaçu, Cascavel, Curitiba, Londrina",
            "provider": {
              "@type": "Organization",
              "name": "Olheiro"
            }
          })
        }}
      />

      <main className="container" aria-label="Painel de Monitoramento">
        <section className={styles.plannerSection}>
          <RoutePlanner onPlan={handlePlan} />
        </section>

        <section className={styles.headerSection}>
          <div className={styles.badge}>ROTA MONITORADA</div>
          <div className={styles.routeInfo}>
            <div className={styles.direction}>
              <span>{getSourceLabel()}</span>
              <span className={styles.arrow}>→</span>
              <span>{getDestinationLabel()}</span>
            </div>
          </div>
        </section>

        <div className={styles.dashboard}>
          <div className={`${styles.overallAlert} ${isSubscribed ? styles[overallStatus] : styles.locked}`}>
             <div className={styles.overallDesc}>STATUS DA ROTA</div>
             {isSubscribed ? (
               <div className={styles.overallStatus}>{overallStatus.toUpperCase()}</div>
             ) : (
               <div className={styles.overallStatus} style={{ fontSize: '1.2rem', marginTop: '4px' }}>
                 <div className={styles.lockBadge}>
                   <Lock size={18} />
                   ASSINE PARA LIBERAR
                 </div>
               </div>
             )}
          </div>

          <div className={styles.poiList}>
            {filteredPoints.map(poi => (
              <Link href={`/poi/${poi.id}`} key={poi.id} className={styles.poiCard}>
                <div className={styles.poiMain}>
                  <div className={styles.poiInfo}>
                    <div className={styles.poiHeader}>
                      <MapPin size={14} className={styles.pinIcon} />
                      <span className={styles.poiType}>{poi.type.toUpperCase()}</span>
                    </div>
                    <h3 className={styles.poiName}>{poi.name}</h3>
                  </div>
                  
                  {isSubscribed ? (
                    <div className={`${styles.statusBadge} ${styles[poi.status]}`}>
                      {poi.status.toUpperCase()}
                    </div>
                  ) : (
                    <div className={`${styles.statusBadge} ${styles.lockedBadge}`}>
                      <Lock size={12} />
                      ASSINE JÁ
                    </div>
                  )}
                </div>
                <div className={styles.poiFooter}>
                  <div className={styles.lastUpdate}>
                    <Clock size={12} />
                    <span>{mounted ? formatRelativeTime(poi.lastUpdate) : '--:--'}</span>
                  </div>
                  {(isSubscribed && poi.status === 'sujo') && (
                    <div className={styles.alertNote}>
                      <AlertTriangle size={12} />
                      <span>{poi.history?.[0]?.message || 'Fiscalização ativa'}</span>
                    </div>
                  )}
                  {!isSubscribed && (
                    <div className={styles.alertNote} style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                      <Lock size={12} />
                      <span>Detalhes bloqueados</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.supportLink}>
          <a href="https://wa.me/5511978867413" target="_blank" className={styles.waBtn} rel="noreferrer">
            <div className={styles.waIcon}><MessageSquare size={16} /></div>
            <span>Suporte: Sugerir Ponto ou Feedback</span>
          </a>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
