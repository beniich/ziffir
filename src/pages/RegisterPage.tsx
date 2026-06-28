// @ts-nocheck
// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const { signUp, signInWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signUp(email, password, name);
      navigate('/select-plan');
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'inscription. Vérifiez vos informations.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la connexion via Google.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #050b16 0%, #0c1b33 100%)', fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(193,154,107,0.2)',
        borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 420, backdropFilter: 'blur(20px)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏰</div>
          <h1 style={{ color: '#c19a6b', fontFamily: 'Georgia, serif', fontSize: 28, margin: 0, fontWeight: 400 }}>
            Ziffir
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '8px 0 0' }}>
            Créez votre compte pour commencer
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Nom complet
            </label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="Jean Dupont"
              style={{
                width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0',
                fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="votre@email.com"
              style={{
                width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0',
                fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Mot de passe
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="Minimum 8 caractères"
              style={{
                width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0',
                fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={submitting || isLoading}
            style={{
              padding: '14px', background: 'linear-gradient(135deg, #c19a6b, #a07850)', color: '#050b16',
              border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer',
              letterSpacing: 0.5, marginTop: 8, opacity: submitting ? 0.7 : 1, transition: 'opacity 0.2s'
            }}
          >
            {submitting ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ padding: '0 12px', color: '#64748b', fontSize: 12 }}>OU</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <button
          onClick={handleGoogle}
          disabled={submitting || isLoading}
          style={{
            width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontWeight: 600, fontSize: 14,
            cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
          Continuer avec Google
        </button>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 24 }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: '#c19a6b', textDecoration: 'none', fontWeight: 600 }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
