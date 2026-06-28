// @ts-nocheck
// src/pages/SelectPlanPage.tsx
// ─────────────────────────────────────────────────────────────
// Étape post-inscription : le client choisit son abonnement.
// Redirige vers /nexus/overview après sélection (ou en mode demo).
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PLANS, PUBLIC_PLANS, type PlanKey, getPlanPrice, getAnnualSavings } from '../config/plans';
import { useAuth } from '../auth/useAuth';

const CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function SelectPlanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [selecting, setSelecting] = useState<PlanKey | null>(null);

  const handleSelectPlan = async (planKey: PlanKey) => {
    setSelecting(planKey);
    try {
      const token = localStorage.getItem('zafir_auth_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/subscription/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: planKey, interval: billing }),
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }
      
      const data = await res.json();
      if (data.data?.url) {
        window.location.href = data.data.url;
      } else {
        throw new Error('URL de session manquante');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setSelecting(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050b16 0%, #0c1b33 100%)',
      fontFamily: 'Inter, sans-serif',
      padding: '40px 20px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🏰</div>
        <h1 style={{ color: '#c19a6b', fontFamily: 'Georgia, serif', fontSize: 32, margin: '0 0 8px', fontWeight: 400 }}>
          Choisissez votre formule
        </h1>
        <p style={{ color: '#64748b', fontSize: 16, margin: 0 }}>
          Bienvenue{user?.displayName ? `, ${user.displayName}` : ''} — commencez par l'offre adaptée à votre établissement.
        </p>

        {/* Toggle mensuel / annuel */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 999, padding: '6px 8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['monthly', 'annual'] as const).map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={{
                padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                background: billing === b ? '#c19a6b' : 'transparent',
                color: billing === b ? '#050b16' : '#94a3b8',
              }}
            >
              {b === 'monthly' ? 'Mensuel' : 'Annuel'}{b === 'annual' && <span style={{ marginLeft: 6, fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 999 }}>-20%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        {PUBLIC_PLANS.map(key => {
          const plan = PLANS[key];
          const price = getPlanPrice(plan, billing);
          const savings = getAnnualSavings(plan);
          const isPopular = plan.popular;
          const isLoading = selecting === key;

          return (
            <div
              key={key}
              style={{
                background: isPopular ? 'rgba(193,154,107,0.08)' : 'rgba(255,255,255,0.03)',
                border: isPopular ? '1px solid rgba(193,154,107,0.5)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20,
                padding: '32px 28px',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {isPopular && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #c19a6b, #a07850)',
                  color: '#050b16', fontSize: 11, fontWeight: 700, letterSpacing: 1,
                  padding: '4px 16px', borderRadius: 999, textTransform: 'uppercase',
                }}>
                  ⭐ Recommandé
                </div>
              )}

              {/* Plan header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: plan.color }} />
                  <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18 }}>{plan.name}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 20px', lineHeight: 1.5 }}>{plan.tagline}</p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ color: '#e2e8f0', fontSize: 42, fontWeight: 800 }}>{price}€</span>
                  <span style={{ color: '#64748b', fontSize: 13 }}>/mois</span>
                </div>
                {billing === 'annual' && savings > 0 && (
                  <p style={{ color: '#10b981', fontSize: 12, margin: '4px 0 0' }}>
                    Économisez {savings}€/an
                  </p>
                )}
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#cbd5e1', fontSize: 13, lineHeight: 1.5 }}>
                    <span style={{ color: '#c19a6b', flexShrink: 0, marginTop: 1 }}>{CHECK_ICON}</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleSelectPlan(key)}
                disabled={!!selecting}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, cursor: selecting ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: 14, letterSpacing: 0.5, transition: 'opacity 0.2s',
                  background: isPopular ? 'linear-gradient(135deg, #c19a6b, #a07850)' : 'rgba(255,255,255,0.06)',
                  color: isPopular ? '#050b16' : '#e2e8f0',
                  opacity: selecting && !isLoading ? 0.5 : 1,
                  border: isPopular ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {isLoading ? 'Chargement...' : `Choisir ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Skip link */}
      <div style={{ textAlign: 'center', marginTop: 36 }}>
        <button
          onClick={() => navigate('/nexus/overview')}
          style={{ background: 'none', border: 'none', color: '#475569', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Continuer avec la version Trial gratuitement →
        </button>
      </div>
    </div>
  );
}
