"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User, Phone, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from './styles.module.css';

type AuthMode = 'login' | 'register' | 'forgot' | 'update';

export default function AuthForm({ 
  onAuthSuccess, 
  initialMode = 'login' 
}: { 
  onAuthSuccess: () => void,
  initialMode?: AuthMode
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuthSuccess();
      } else if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              whatsapp: whatsapp,
            }
          }
        });
        if (signUpError) throw signUpError;
        
        setMessage("Conta criada! Verifique seu e-mail para confirmar.");
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/profile?type=recovery`,
        });
        if (error) throw error;
        setMessage("E-mail de recuperação enviado!");
      } else if (mode === 'update') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage("Senha atualizada com sucesso!");
        setTimeout(() => onAuthSuccess(), 2000);
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h2>
            {mode === 'login' ? 'Bem-vindo de volta' : 
             mode === 'register' ? 'Criar sua conta' : 
             mode === 'forgot' ? 'Recuperar senha' : 
             'Nova Senha'}
          </h2>
          <p>
            {mode === 'login' ? 'Entre para ver suas estatísticas' : 
             mode === 'register' ? 'Junte-se à elite dos motoristas' : 
             mode === 'forgot' ? 'Enviaremos um link para seu e-mail' :
             'Digite sua nova senha de acesso'}
          </p>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className={styles.successBanner}>
            <CheckCircle2 size={18} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {mode === 'register' && (
            <div className={styles.inputGroup}>
              <label>Como gostaria de ser chamado?</label>
              <div className={styles.inputWrapper}>
                <User size={18} />
                <input 
                  type="text" 
                  placeholder="Seu nome ou apelido" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                />
              </div>
            </div>
          )}

          {mode !== 'update' && (
            <div className={styles.inputGroup}>
              <label>E-mail</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} />
                <input 
                  type="email" 
                  placeholder="exemplo@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <span className={styles.inputHint}>Nunca vamos mandar propaganda.</span>
            </div>
          )}

          {mode === 'register' && (
            <div className={styles.inputGroup}>
              <label>WhatsApp</label>
              <div className={styles.inputWrapper}>
                <Phone size={18} />
                <input 
                  type="tel" 
                  placeholder="(00) 00000-0000" 
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required 
                />
              </div>
              <span className={styles.inputHint}>Para backup em caso de queda no app.</span>
            </div>
          )}

          {mode !== 'forgot' && (
            <div className={styles.inputGroup}>
              <label>Senha</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} />
                <input 
                  type="password" 
                  placeholder="••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <RefreshCw size={20} className={styles.spin} /> : (
              <>
                <span>
                  {mode === 'login' ? 'Entrar' : 
                   mode === 'register' ? 'Cadastrar' : 
                   mode === 'forgot' ? 'Enviar Link' :
                   'Atualizar Senha'}
                </span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className={styles.authFooter}>
          {mode === 'login' && (
            <>
              <button onClick={() => setMode('forgot')} className={styles.linkBtn}>Esqueci minha senha</button>
              <p>Não tem conta? <button onClick={() => setMode('register')} className={styles.boldBtn}>Cadastre-se</button></p>
            </>
          )}
          {mode === 'register' && (
            <p>Já tem uma conta? <button onClick={() => setMode('login')} className={styles.boldBtn}>Fazer Login</button></p>
          )}
          {mode === 'forgot' && (
            <button onClick={() => setMode('login')} className={styles.linkBtn}>Voltar para o Login</button>
          )}
        </div>
      </div>
    </div>
  );
}
