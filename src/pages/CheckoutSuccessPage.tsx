// @ts-nocheck
// src/pages/CheckoutSuccessPage.tsx
// ─────────────────────────────────────────────────────────────
// Page de retour Stripe après un paiement réussi.
// Affiche les confettis, le plan activé et redirige vers /nexus/overview.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PLANS, type PlanKey } from '../config/plans';

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planKey = (searchParams.get('plan') || 'STARTER').toUpperCase() as PlanKey;
  const plan = PLANS[planKey] || PLANS['STARTER'];
  const [count, setCount] = useState(5);

  useEffect(() => {
    // Confetti dynamique
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#c19a6b', '#fff', plan.color] });
      setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { x: 0.1, y: 0.6 }, colors: ['#c19a6b', plan.color] }), 400);
      setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { x: 0.9, y: 0.6 }, colors: ['#fff', '#c19a6b'] }), 700);
    });

    // Compte à rebours de redirection
    const interval = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(interval);
          navigate('/nexus/overview');
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, plan.color]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050b16 0%, #0c1b33 100%)',
      fontFamily: 'Inter, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(193,154,107,0.3)',
        borderRadius: 28, padding: '56px 48px', maxWidth: 520, width: '100%',
        textAlign: 'center', backdropFilter: 'blur(20px)',
        boxShadow: '0 0 60px rgba(193,154,107,0.1)',
      }}>
        {/* Icône succès */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #c19a6b, #a07850)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 36, color: '#050b16', fontWeight: 700,
        }}>
          ✓
        </div>

        <h1 style={{ color: '#c19a6b', fontFamily: 'Georgia, serif', fontSize: 32, margin: '0 0 8px', fontWeight: 400 }}>
          Abonnement activé !
        </h1>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.06)', border: `1px solid ${plan.color}40`,
          borderRadius: 12, padding: '10px 20px', margin: '16px 0',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: plan.color }} />
          <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 16 }}>Plan {plan.name}</span>
        </div>

        <p style={{ color: '#64748b', fontSize: 15, margin: '16px 0 32px', lineHeight: 1.7 }}>
          Toutes les fonctionnalités du plan{' '}
          <strong style={{ color: '#c19a6b' }}>{plan.name}</strong> sont maintenant disponibles.
        </p>

        <div style={{
          background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 32, textAlign: 'left',
        }}>
          <p style={{ color: '#10b981', fontSize: 12, fontWeight: 700, marginBottom: 10, letterSpacing: 1, margin: '0 0 10px' }}>
            FONCTIONNALITÉS DÉBLOQUÉES
          </p>
          {plan.features.slice(0, 4).map((f: string, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
              <span style={{ color: '#10b981', fontSize: 14, flexShrink: 0 }}>✓</span>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>{f}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/nexus/overview')}
          style={{
            width: '100%', padding: '16px',
            background: 'linear-gradient(135deg, #c19a6b, #a07850)',
            border: 'none', borderRadius: 14, color: '#050b16',
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
            letterSpacing: 0.5,
          }}
        >
          Accéder au tableau de bord →
        </button>

        <p style={{ color: '#334155', fontSize: 12, marginTop: 16 }}>
          Redirection automatique dans <strong style={{ color: '#64748b' }}>{count}s</strong>
        </p>
      </div>
    </div>
  );
}
