// @ts-nocheck
// src/pages/ForbiddenPage.tsx
import React from 'react';

export default function ForbiddenPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #050b16 0%, #0c1b33 100%)', color: '#fff', textAlign: 'center', gap: 20 }}>
      <div style={{ fontSize: 64 }}>🔒</div>
      <h1 style={{ color: '#c19a6b', fontFamily: 'Georgia, serif', fontSize: 36, margin: 0 }}>Accès Refusé</h1>
      <p style={{ color: '#94a3b8', fontSize: 16, maxWidth: 400 }}>
        Vous n'avez pas les permissions nécessaires pour accéder à cette section.
      </p>
      <a href="/portal" style={{ background: '#c19a6b', color: '#050b16', borderRadius: 12, padding: '12px 32px', textDecoration: 'none', fontWeight: 700, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' }}>
        Retour au portail
      </a>
    </div>
  );
}
