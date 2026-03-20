import type { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: "Meu Perfil | Olheiro",
  description: "Gerencie sua assinatura Premium e acesse suporte exclusivo do monitoramento Olheiro.",
};

export default function Page() {
  return <ProfileClient />;
}
