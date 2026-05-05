import { useEffect, useState } from 'react';
import { supabase, POI } from '@/lib/supabase';

export function usePOIs(initialPois: POI[] = []) {
  const [pois, setPois] = useState<POI[]>(initialPois);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se não tivermos POIs iniciais, fazemos o fetch inicial (fallback client-side)
    if (initialPois.length === 0) {
      setLoading(true);
      const fetchPOIs = async () => {
        try {
          const { data, error: supabaseError } = await supabase
            .from('pois')
            .select('*')
            .order('id', { ascending: true });

          if (supabaseError) throw supabaseError;

          if (data) {
            const mapped = data.map((p: any) => ({
              ...p,
              lastUpdate: p.last_update
            }));
            setPois(mapped);
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchPOIs();
    }

    const channel = supabase
      .channel('pois-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pois' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            setPois(prev => prev.map(p => 
              p.id === updated.id ? { ...updated, lastUpdate: updated.last_update } : p
            ));
          } else if (payload.eventType === 'INSERT') {
            const inserted = payload.new as any;
            setPois(prev => [...prev, { ...inserted, lastUpdate: inserted.last_update }]);
          } else if (payload.eventType === 'DELETE') {
            setPois(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialPois.length]);

  return { pois, loading, error };
}
