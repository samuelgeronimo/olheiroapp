import type { Metadata } from 'next';
import AlertsClient from './AlertsClient';

export const metadata: Metadata = {
  title: "Atualizar Alertas | Olheiro BR-277",
  description: "Contribua com a comunidade e reporte a situação da fiscalização na BR-277. Ajude outros viajantes a evitarem imprevistos.",
};

export default function Page() {
  return <AlertsClient />;
}
