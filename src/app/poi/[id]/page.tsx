import type { Metadata } from 'next';
import POIDetailClient from './POIDetailClient';
import { supabase } from '@/lib/supabase';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  const { data: poi } = await supabase
    .from('pois')
    .select('name')
    .eq('id', id)
    .single();

  return {
    title: `${poi?.name || 'Ponto'} | Status em Tempo Real - Olheiro`,
    description: `Confira o histórico de atualizações e o status atual de ${poi?.name || 'este ponto'}. Monitoramento colaborativo na BR-277.`,
  };
}

export default function Page({ params }: Props) {
  return <POIDetailClient params={params} />;
}
