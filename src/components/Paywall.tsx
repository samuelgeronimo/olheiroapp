"use client";

import styles from './Paywall.module.css';
import { ShieldCheck, Zap, Lock, CreditCard } from 'lucide-react';
import { createStripeCheckout } from '@/lib/stripe';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';

interface Props {
  onSubscribe?: () => void;
}

export default function Paywall({ onSubscribe }: Props) {
  const { user } = useSubscription();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      alert('Por favor, faça login ou crie uma conta para assinar o Olheiro PRO.');
      window.location.href = '/profile';
      return;
    }

    setLoading(true);
    const link = await createStripeCheckout(user.id, user.email!);

    if (link) {
      window.location.href = link;
    } else {
      alert('Erro ao gerar checkout do Stripe. Tente novamente mais tarde.');
      setLoading(false);
    }
  };
  return (
    <div className={styles.overlay}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.badge}>MEMBRO OLHEIRO PRO</div>
          <h1 className={styles.title}>Proteja seu Ganha-Pão</h1>
          <p className={styles.subtitle}>Economize com multas e dirija sem surpresas hoje.</p>

          <div className={styles.roiSection}>
            <h3 className={styles.roiTitle}>A matemática é simples:</h3>
            <div className={styles.fineComparison}>
              <div className={styles.comparisonItem}>
                <span className={styles.compLabel}>1 Multa Média</span>
                <span className={`${styles.compVal} ${styles.danger}`}>R$ 293,47</span>
              </div>
              <div className={styles.comparisonItem}>
                <span className={styles.compLabel}>Olheiro PRO</span>
                <span className={`${styles.compVal} ${styles.success}`}>R$ 19,99</span>
              </div>
            </div>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <ShieldCheck color="#22c55e" size={20} />
              <span>Ver radares e blitz em tempo real</span>
            </div>
            <div className={styles.feature}>
              <Zap color="#fbbf24" size={20} />
              <span>Mapa detalhado sem embaçamento</span>
            </div>
            <div className={styles.feature}>
              <Lock color="#3b82f6" size={20} />
              <span>Acesso exclusivo ao grupo VIP</span>
            </div>
          </div>

          <button 
            className={styles.subscribeBtn} 
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? 'PROCESSANDO...' : 'ASSINAR AGORA'}
          </button>

          <div className={styles.guarantee}>
            <ShieldCheck size={18} />
            <span>Garantia de Proteção Olheiro</span>
          </div>

          <div className={styles.socialProof}>
            Junte-se a <strong>1.240 motoristas</strong> protegidos agora
          </div>
        </div>
      </div>
    </div>
  );
}
