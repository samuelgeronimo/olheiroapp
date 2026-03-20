import type { Metadata } from 'next';
import MapClient from './MapClient';

export const metadata: Metadata = {
  title: "Mapa de Monitoramento | Olheiro",
  description: "Visualize em tempo real a localização de todos os pontos de fiscalização e alertas na BR-277 entre Foz do Iguaçu e Cascavel.",
};

export default function Page() {
  return <MapClient />;
}
