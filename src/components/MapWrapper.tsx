import dynamic from 'next/dynamic';
import { POI } from '@/lib/supabase';
import { APIProvider } from '@vis.gl/react-google-maps';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const Map = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => <div style={{ height: '100%', width: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando Google Maps...</div>
});

interface Props {
  pois: POI[];
  isSubscribed: boolean;
  onShowPaywall: () => void;
}

export default function MapWrapper({ pois, isSubscribed, onShowPaywall }: Props) {
  return (
    <APIProvider apiKey={API_KEY}>
      <div style={{ height: 'calc(100vh - 140px)', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #333' }}>
        <Map pois={pois} isSubscribed={isSubscribed} onShowPaywall={onShowPaywall} />
      </div>
    </APIProvider>
  );
}
