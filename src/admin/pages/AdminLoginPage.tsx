import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simuler le login pour l'instant
    setTimeout(() => {
      setLoading(false);
      navigate('/admin');
    }, 1000);
  };
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-primary)'
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          background: 'var(--bg-card)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: '400px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '32px', marginBottom: '1rem' }}>🛡️</div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Ziffir Admin</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Super-Admin Access</p>
        </div>
        
        <div className="form-group">
          <label className="form-label">Email de sécurité</label>
          <input type="email" required className="form-input" placeholder="admin@ziffir.com" />
        </div>
        
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label">Mot de passe</label>
          <input type="password" required className="form-input" placeholder="••••••••" />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
          {loading ? 'Vérification...' : 'Connexion'}
        </button>
      </form>
    </div>
  );
}
