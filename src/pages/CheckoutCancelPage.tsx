// @ts-nocheck
// src/pages/CheckoutCancelPage.tsx
// ─────────────────────────────────────────────────────────────
// Page de retour Stripe après une annulation du paiement.
// Redirige vers /select-plan pour que l'utilisateur réessaie.
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CheckoutCancelPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050b16 0%, #0c1b33 100%)',
      fontFamily: 'Inter, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 28, padding: '56px 48px', maxWidth: 480, width: '100%',
        textAlign: 'center', backdropFilter: 'blur(20px)',
      }}>
        {/* Icône annulation */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(100,116,139,0.2)', border: '2px solid rgba(100,116,139,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 36,
        }}>
          ✕
        </div>

        <h1 style={{ color: '#e2e8f0', fontFamily: 'Georgia, serif', fontSize: 28, margin: '0 0 12px', fontWeight: 400 }}>
          Paiement annulé
        </h1>

        <p style={{ color: '#64748b', fontSize: 15, margin: '0 0 36px', lineHeight: 1.7 }}>
          Votre paiement n'a pas été effectué. Votre abonnement Trial reste actif.
          Vous pouvez sélectionner un plan à tout moment.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => navigate('/select-plan')}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #c19a6b, #a07850)',
              border: 'none', borderRadius: 12, color: '#050b16',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', letterSpacing: 0.5,
            }}
          >
            Réessayer — Choisir un plan
          </button>
          <button
            onClick={() => navigate('/nexus/overview')}
            style={{
              width: '100%', padding: '14px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, color: '#94a3b8',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            Continuer en mode Trial
          </button>
        </div>

        <p style={{ color: '#1e293b', fontSize: 12, marginTop: 24 }}>
          Aucun montant n'a été débité. Votre carte n'a pas été enregistrée.
        </p>
      </div>
    </div>
  );
}
