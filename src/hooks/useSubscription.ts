import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

/**
 * Hook to manage subscription state globally.
 * Syncs with Supabase database for logged-in users, otherwise uses localStorage.
 */
export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Initial logic check
    const init = async () => {
      console.log('useSubscription: Initializing auth check...');
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchSubscriptionFromDB(session.user.id);
      } else {
        checkLocalStorage();
      }
    };

    init();

    // 2. Auth state listener
    const authListener = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSubscriptionFromDB(session.user.id);
      } else {
        checkLocalStorage();
      }
    });

    return () => {
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  const checkLocalStorage = () => {
    const stored = localStorage.getItem('olheiro_pro');
    setIsSubscribed(stored === 'true');
    setLoading(false);
  };

  const fetchSubscriptionFromDB = async (userId: string) => {
    try {
      // Using a standard query instead of .single() to be less strict
      const { data, error } = await supabase
        .from('profiles')
        .select('is_subscribed')
        .eq('id', userId);
      
      if (error) {
        if (error.code === 'PGRST116') { // Record not found
           console.log('No profile record found for user, creating one...');
           // If no record exists, create one with default value
           await supabase.from('profiles').insert({ id: userId, is_subscribed: false });
           setIsSubscribed(false);
        } else {
           console.error('Supabase fetch error:', error);
           checkLocalStorage();
        }
        return;
      }
      
      if (data && data.length > 0) {
        setIsSubscribed(!!data[0].is_subscribed);
        localStorage.setItem('olheiro_pro', String(!!data[0].is_subscribed));
      } else {
        // No record found but no error (unlikely with PostgREST but safe)
        setIsSubscribed(false);
        await supabase.from('profiles').insert({ id: userId, is_subscribed: false });
      }
    } catch (err) {
      console.warn('Database fetch failed, fallback to local storage:', err);
      checkLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const setSubscription = async (value: boolean) => {
    setIsSubscribed(value);
    localStorage.setItem('olheiro_pro', String(value));
    
    if (user) {
      await supabase
        .from('profiles')
        .update({ is_subscribed: value })
        .eq('id', user.id);
    }
  };

  return { isSubscribed, setSubscription, loading, user };
}
