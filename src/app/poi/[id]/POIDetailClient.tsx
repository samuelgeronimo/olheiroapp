"use client";

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Paywall from '@/components/Paywall';
import { useSubscription } from '@/hooks/useSubscription';
import { queueUpdate } from '@/lib/offlineSync';
import POIStatusCard from '@/components/POIStatusCard';
import { POI, PointStatus } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { MapPin, ArrowLeft, History, Clock, WifiOff } from 'lucide-react';
import styles from './poi.module.css';
import { formatRelativeTime } from '@/lib/dateUtils';

export default function POIDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [poi, setPoi] = useState<POI | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const { isSubscribed, setSubscription } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    const fetchPoiData = async () => {
      // Fetch current POI state
      const { data: poiData } = await supabase
        .from('pois')
        .select('*')
        .eq('id', id)
        .single();

      if (poiData) {
        setPoi({
          ...poiData,
          lastUpdate: poiData.last_update
        });
      }

      // Fetch history (last 15 updates)
      const { data: historyData } = await supabase
        .from('status_updates')
        .select('*')
        .eq('poi_id', id)
        .order('timestamp', { ascending: false })
        .limit(15);

      if (historyData) {
        setHistory(historyData);
      }
      setLoading(false);
    };

    fetchPoiData();

    // Subscribe to both tables
    const poiChannel = supabase
      .channel(`poi_detail_${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pois', filter: `id=eq.${id}` },
        (payload) => {
          const updated = payload.new as any;
          setPoi({ ...updated, lastUpdate: updated.last_update });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'status_updates', filter: `poi_id=eq.${id}` },
        (payload) => {
          setHistory(current => [payload.new, ...current].slice(0, 15));
        }
      )
      .subscribe();

    return () => {
       supabase.removeChannel(poiChannel);
    };
  }, [id]);

  const handleStatusUpdate = async (status: PointStatus, message: string, image?: Blob) => {
    const now = new Date().toISOString();
    let imageUrl = poi?.image_url;

    const updatePayload = {
      poi_id: id,
      status,
      message,
      timestamp: now
    };

    // 1. Handle image upload if provided (only if online)
    if (image && navigator.onLine) {
      const fileName = `images/${id}.webp`;
      const { data, error } = await supabase.storage
        .from('poi-images')
        .upload(fileName, image, {
          contentType: 'image/webp',
          upsert: true
        });

      if (!error) {
        const { data: { publicUrl } } = supabase.storage
          .from('poi-images')
          .getPublicUrl(fileName);
        imageUrl = `${publicUrl}?t=${Date.now()}`;
      }
    }

    // 2. Decide: Direct Update or Queue
    if (!navigator.onLine) {
      console.log('Offline: Queuing update...');
      await queueUpdate(updatePayload);
      alert('Sem sinal! Sua atualização foi salva e será enviada automaticamente assim que a internet voltar.');
      return;
    }

    try {
      // Update POI current state
      const { error: poiError } = await supabase
        .from('pois')
        .update({ 
          status, 
          last_update: now,
          image_url: imageUrl
        })
        .eq('id', id);

      if (poiError) throw poiError;

      // Add to audit log
      const { error: auditError } = await supabase
        .from('status_updates')
        .insert(updatePayload);
      
      if (auditError) throw auditError;

    } catch (err) {
      console.error('Update failed, queuing for retry:', err);
      await queueUpdate(updatePayload);
      alert('Falha na conexão. Atualização agendada para sincronização em segundo plano.');
    }
  };

  if (!isSubscribed) {
    return <Paywall onSubscribe={() => setSubscription(true)} />;
  }

  if (loading) return <div className="container">Carregando informações...</div>;
  if (!poi) return <div className="container">Ponto não encontrado</div>;

  const formatFullDate = (isoString: string) => {
    if (!isoString) return '--/--/---- --:--';
    return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.wrapper}>
      <Header />

      <main className="container">
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ArrowLeft size={18} />
          Voltar para o Painel
        </button>

        <section className={styles.header}>
          <div className={styles.typeBadge}>{poi.type.toUpperCase()}</div>
          <h1 className={styles.title}>{poi.name}</h1>
          <div className={styles.coordinate}>
            <MapPin size={14} />
            <span>{poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}</span>
          </div>

          {poi.image_url && (
            <div className={styles.currentImageContainer}>
              <img
                src={poi.image_url}
                alt={`Condição atual em ${poi.name}`}
                className={styles.currentImage}
              />
              <div className={styles.imageOverlay}>
                <Clock size={12} />
                <span>Foto enviada {formatRelativeTime(poi.lastUpdate)}</span>
              </div>
            </div>
          )}
        </section>

        <div className={styles.updateSection}>
          <POIStatusCard poi={poi} onStatusChange={handleStatusUpdate} />
        </div>

        <section className={styles.historySection}>
          <div className={styles.historyHeader}>
            <History size={18} color="var(--accent-color)" />
            <h2>Histórico de Atualizações</h2>
          </div>
          <p className={styles.historySub}>Últimas 15 movimentações registradas</p>

          <div className={styles.timeline}>
            {history.length > 0 ? history.map((update, index) => (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.timelineLine}></div>
                <div className={`${styles.timelineDot} ${styles[update.status]}`}></div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <span className={`${styles.miniBadge} ${styles[update.status]}`}>
                      {update.status.toUpperCase()}
                    </span>
                    <span className={styles.timelineTime}>{formatFullDate(update.timestamp)}</span>
                  </div>
                  <p className={styles.timelineMsg}>
                    {update.message || (update.status === 'sujo' ? 'Presença de fiscalização.' :
                      update.status === 'atencao' ? 'Alerta registrado.' : 'Via liberada.')}
                  </p>
                </div>
              </div>
            )) : (
              <p className={styles.emptyHistory}>Nenhum histórico registrado.</p>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
