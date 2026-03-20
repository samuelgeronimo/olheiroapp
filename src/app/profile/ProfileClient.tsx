"use client";

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Paywall from '@/components/Paywall';
import AuthForm from './AuthForm';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';
import { createStripeCheckout } from '@/lib/stripe';
import styles from './styles.module.css';
import { User, Shield, ShieldCheck, LogOut, MessageSquare, Settings, ChevronRight, Key, Camera, Loader2 } from 'lucide-react';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function ProfileClient() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { isSubscribed, setSubscription } = useSubscription();
  const [recoveryMode, setRecoveryMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check if we are in a recovery flow
      if (typeof window !== 'undefined' && (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery'))) {
        setRecoveryMode(true);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      if (_event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // 1. Convert to WebP using Canvas
      const webpBlob = await convertToWebP(file);
      const fileName = `${user.id}-${Math.random()}.webp`;

      // 2. Upload to Supabase Storage (Assumes 'avatars' bucket exists and is public)
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, webpBlob, {
          contentType: 'image/webp',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // 4. Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;
      
      // Update local state IMMEDIATELY for instant UI feedback
      setUser((prev: any) => ({
        ...prev,
        user_metadata: {
          ...prev.user_metadata,
          avatar_url: publicUrl
        }
      }));

    } catch (err: any) {
      console.error("Error uploading photo:", err);
      // Show the actual error to help debugging
      alert(`Erro ao carregar foto: ${err.message || 'Verifique o bucket avatars no Supabase.'}`);
    } finally {
      setUploading(false);
    }
  };

  // Utility to convert image to WebP in browser
  const convertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas conversion failed'));
        }, 'image/webp', 0.8);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  if (loading) {
    return <div className={styles.wrapper} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Carregando...</div>;
  }

  if (!user) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <AuthForm onAuthSuccess={() => {}} />
        <BottomNav />
      </div>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className={styles.wrapper}>
      <Header />
      
      <main className="container" style={{ display: 'flex', flexDirection: 'column', paddingBottom: 0, flex: 1 }}>
        {recoveryMode ? (
          <div className={styles.profileCard}>
            <div className={styles.authHeader}>
              <Key size={32} color="#fbbf24" style={{ marginBottom: '12px' }} />
              <h2>Redefinir Senha</h2>
              <p>Escolha uma nova senha segura para sua conta.</p>
            </div>
            <AuthForm 
              initialMode="update" 
              onAuthSuccess={() => {
                setRecoveryMode(false);
                window.location.hash = '';
              }} 
            />
            <button 
              onClick={() => {
                setRecoveryMode(false);
                window.location.hash = '';
              }}
              className={styles.linkBtn}
              style={{ width: '100%', marginTop: '10px' }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div 
                className={styles.avatarWrapper} 
                onClick={handlePhotoClick}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.avatar}>
                  {uploading ? (
                    <Loader2 size={30} className={styles.spin} />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className={styles.avatarImg} />
                  ) : (
                    <User size={40} />
                  )}
                  <div className={styles.avatarOverlay}>
                    <Camera size={16} />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>
              
              <div className={styles.userInfo}>
                <h3>{user.user_metadata?.full_name || 'Membro Olheiro'}</h3>
                <p className={styles.email}>{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <h4 className={styles.sectionTitle}>Ações e Suporte</h4>
        <div className={styles.menu}>
          <a href="https://wa.me/5545999999999" target="_blank" className={styles.menuItem}>
            <div className={styles.menuLabel}>
              <MessageSquare size={18} />
              <span>Feedback / Sugerir Ponto de Interesse</span>
            </div>
            <ChevronRight size={16} color="#475569" />
          </a>

          <div 
            className={styles.menuItem} 
            onClick={!isSubscribed ? async () => {
              const link = await createStripeCheckout(user.id, user.email!);
              if (link) window.location.href = link;
            } : undefined}
            style={{ cursor: !isSubscribed ? 'pointer' : 'default' }}
          >
            <div className={styles.menuLabel}>
              <Shield size={18} color={isSubscribed ? "#fbbf24" : "#475569"} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Plano Olheiro {isSubscribed ? 'PRÓ' : 'BÁSICO'}</span>
                {!isSubscribed && <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 'bold' }}>ASSINAR AGORA</span>}
              </div>
            </div>
            {isSubscribed ? <ShieldCheck size={16} color="#fbbf24" /> : <ChevronRight size={16} color="#475569" />}
          </div>
        </div>

        {!recoveryMode && (
          <>
            <div style={{ flex: 1 }}></div>
            <button 
              className={styles.logoutBtn} 
              onClick={handleLogout}
              style={{ marginBottom: 'calc(80px + var(--safe-area-inset-bottom))' }}
            >
              <LogOut size={18} />
              <span>Sair da Conta</span>
            </button>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
