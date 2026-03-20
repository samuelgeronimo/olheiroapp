import type { Metadata } from 'next';
import HomeClient from './HomeClient';

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

export default function Page() {
  return <HomeClient />;
}
