import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { supabase, POI } from '@/lib/supabase';

export const metadata: Metadata = {
  title: "Olheiro - Radar BR-277 | Foz do Iguaçu em Tempo Real",
  description: "Monitore a presença de PRF, Receita Federal e Pedágios na BR-277 sentido Cascavel. Informações colaborativas em tempo real para sua segurança.",
  openGraph: {
    title: "Olheiro - Radar Colaborativo BR-277",
    description: "Saiba como está a fiscalização na saída de Foz do Iguaçu agora.",
    url: "https://olheiro.app",
    siteName: "Olheiro",
    locale: "pt_BR",
    type: "website",
  },
  alternates: {
    canonical: "https://olheiro.app",
  },
};

export default async function Page() {
  const { data } = await supabase
    .from('pois')
    .select('*')
    .order('id', { ascending: true });

  const initialPois: POI[] = (data || []).map((p: any) => ({
    ...p,
    lastUpdate: p.last_update
  }));

  return <HomeClient initialPois={initialPois} />;
}
