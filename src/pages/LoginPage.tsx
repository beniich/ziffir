// @ts-nocheck
// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/nexus/overview');
    } catch (err: any) {
      setError(err?.message || 'Identifiants invalides');
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
            Bienvenue — connectez-vous à votre espace
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              placeholder="••••••••"
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
            {submitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 24 }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: '#c19a6b', textDecoration: 'none', fontWeight: 600 }}>
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
