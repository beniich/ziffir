// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Download,
  Sparkles,
  Video,
  Image as ImageIcon,
  Film,
  Cpu,
  Lock,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  HelpCircle,
  Database,
  TrendingUp,
  X,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { loadStripe } from '@stripe/stripe-js';
import { PLANS, ALL_PLANS, getPlanPrice, getAnnualSavings, type PlanKey } from '../../../config/plans';

// Initialisation de Stripe — clé publique via variable d'environnement
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface SaaSBillingTabProps {
  addAuditLog?: (action: string, reason: string, status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT', role?: string) => void;
  themeMode?: 'dark' | 'light';
  initialPlan?: PlanKey;
  refresh?: () => Promise<void>;
}

// ─── UsageBar Sub-component ───────────────────────────────────────────────────
const UsageBar: React.FC<{
  label: string;
  current: number;
  limit: number;
  unit: string;
  index: number;
}> = ({ label, current, limit, unit, index }) => {
  const pct = limit === -1 ? 15 : Math.min(100, Math.round((current / limit) * 100));
  const isUnlimited = limit === -1;
  const isWarning = pct >= 75 && !isUnlimited;
  const colors = ['#c19a6b', '#3b82f6', '#10b981', '#7c3aed'];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-600 uppercase">
        <span>{label}</span>
        <span className={isUnlimited ? 'text-emerald-500' : isWarning ? 'text-amber-600' : 'text-slate-500'}>
          {isUnlimited ? '∞ Illimité' : `${current.toLocaleString()} / ${limit.toLocaleString()} ${unit}`}
        </span>
      </div>
      <div className="h-2 bg-slate-200/70 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            backgroundColor: isWarning ? '#f59e0b' : colors[index % colors.length],
          }}
        />
      </div>
      {isWarning && (
        <p className="text-[9px] font-mono text-amber-600 font-bold">⚠ Approche de la limite — envisagez une montée en gamme</p>
      )}
    </div>
  );
};

// ─── Checkout Modal Sub-component (Stripe Redirect) ───────────────────────────
const BillingCheckoutModal: React.FC<{
  planKey: PlanKey;
  billing: 'monthly' | 'annual';
  onClose: () => void;
}> = ({ planKey, billing, onClose }) => {
  const plan = PLANS[planKey];
  const price = getPlanPrice(plan, billing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStripeCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const currentUrl = window.location.origin;
      const token = localStorage.getItem('zafir_auth_token');

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/billing/checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planKey,
          billing,
          successUrl: `${currentUrl}/checkout/success?plan=${planKey}`,
          cancelUrl: `${currentUrl}/checkout/cancel`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur serveur Stripe');
      }

      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('URL de session Stripe manquante');
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Passerelle Stripe Sécurisée</p>
            <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
              <span style={{ color: plan.color }}>⬡</span> {plan.name}
            </h3>
            <p className="text-[#c19a6b] font-mono font-bold text-lg mt-1">
              {price}€<span className="text-xs text-slate-400 font-normal"> /mois{billing === 'annual' ? ' · facturé annuellement' : ''}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-6">
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-left">
            <p className="text-xs text-slate-600 font-bold mb-3 border-b pb-2">Récapitulatif :</p>
            {plan.features.slice(0, 3).map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                <Check className="w-3.5 h-3.5 shrink-0" style={{ color: plan.color }} />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-slate-600">
            Vous allez être redirigé vers le portail de paiement sécurisé Stripe pour finaliser votre abonnement.
          </p>

          {error && (
            <p className="text-xs font-mono font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
              Erreur: {error}
            </p>
          )}

          <button
            onClick={handleStripeCheckout}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-mono font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-lg"
            style={{ backgroundColor: plan.color }}
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Redirection Stripe en cours…</>
            ) : (
              <><Lock className="w-4 h-4" /> Continuer vers le paiement sécurisé</>
            )}
          </button>
          
          <div className="flex justify-center pt-2">
            <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">
              Powered by Stripe Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const SaaSBillingTab: React.FC<SaaSBillingTabProps> = ({
  addAuditLog,
  initialPlan,
  refresh,
}) => {
  const [currentPlan, setCurrentPlan] = useState<PlanKey>(initialPlan || 'TRIAL');
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [subStatus] = useState<'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED'>('ACTIVE');
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanKey | null>(null);
  const [subTab, setSubTab] = useState<'dashboard' | 'marketing-studio'>('dashboard');

  // Invoices
  const [invoices, setInvoices] = useState([
    { id: 'INV-1094', date: '2026-06-01', amount: 99, status: 'PAID', plan: 'STARTER' },
    { id: 'INV-0982', date: '2026-05-01', amount: 99, status: 'PAID', plan: 'STARTER' },
    { id: 'INV-0871', date: '2026-04-01', amount: 99, status: 'PAID', plan: 'STARTER' },
  ]);

  // AI Media Generator
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [selectedScene, setSelectedScene] = useState<'suite' | 'lounge' | 'cyber'>('suite');
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [isCurationMuted, setIsCurationMuted] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStepText, setRenderStepText] = useState('');
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState('/src/assets/images/zafir_luxury_suite_1782137797843.jpg');
  const [renderedSuccess, setRenderedSuccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [assetRendersRemaining, setAssetRendersRemaining] = useState(3);

  const SCENE_ASSETS = {
    suite: {
      image: '/src/assets/images/zafir_luxury_suite_1782137797843.jpg',
      prompt: 'Cinematic architectural pan of a quiet luxury guest chamber, high floor panoramic views, warm golden dusk shadows.',
    },
    lounge: {
      image: '/src/assets/images/zafir_hotel_lounge_1782137813828.jpg',
      prompt: 'Sophisticated boutique hotel club lobby bar, ambient lighting, beautiful dark velvet booths, minimal brass finishes.',
    },
    cyber: {
      image: '/src/assets/images/zafir_cyber_room_control_1782137831330.jpg',
      prompt: 'Neon cyber-deck hotel space, holographic consoles glowing with real-time operations, ultra HD cyberpunk luxury suite.',
    },
  };

  useEffect(() => {
    setGenerationPrompt(SCENE_ASSETS[selectedScene].prompt);
  }, [selectedScene]);

  const handleCheckoutSuccess = (planKey: PlanKey) => {
    const plan = PLANS[planKey];
    const price = getPlanPrice(plan, billing);
    setCurrentPlan(planKey);
    setCancelAtPeriodEnd(false);
    const invId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    setInvoices(prev => [
      { id: invId, date: new Date().toISOString().split('T')[0], amount: price, status: 'PAID', plan: planKey },
      ...prev,
    ]);
    if (addAuditLog) addAuditLog(`Abonnement ${plan.name} activé (Stripe)`, `Facturé ${billing}`, 'AUTHORIZED');
  };

  useEffect(() => {
    // Vérification du retour de Stripe Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get('checkout_success')) {
      const planFromUrl = query.get('plan') as PlanKey;
      if (planFromUrl && PLANS[planFromUrl]) {
        handleCheckoutSuccess(planFromUrl);
        confetti({ particleCount: 100, spread: 70, colors: ['#c19a6b', '#fff', PLANS[planFromUrl].color] });
        if (refresh) {
          refresh().catch(err => console.error('Refresh session failed:', err));
        }
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [refresh]);

  const handleToggleCancel = () => {
    const next = !cancelAtPeriodEnd;
    setCancelAtPeriodEnd(next);
    if (addAuditLog) {
      addAuditLog(
        next ? 'SUBSCRIPTION_CANCEL_SCHEDULED' : 'SUBSCRIPTION_RESUMED',
        next
          ? 'Abonnement programmé pour résiliation à la prochaine date de renouvellement.'
          : 'Renouvellement automatique réactivé dans le calendrier de facturation Stripe.',
        'AUTHORIZED',
        'MANAGER'
      );
    }
  };

  const startAssetGeneration = () => {
    if (currentPlan === 'TRIAL' && assetRendersRemaining <= 0) {
      alert('LIMITE ATTEINTE : Vos rendus Trial sont épuisés. Passez au plan Starter ou Professional.');
      return;
    }
    setRendering(true);
    setRenderedSuccess(false);
    setRenderProgress(0);
    const steps = [
      { prg: 12, msg: 'Initialisation du moteur de rendu neuronal v2.4…' },
      { prg: 28, msg: 'Acquisition des tokens de prompt & vecteurs de style…' },
      { prg: 48, msg: 'Synthèse des distributions pixel sur GPU cluster #9…' },
      { prg: 68, msg: 'Injection des ratios dorés HDR & filtres de nuances…' },
      { prg: 86, msg: 'Génération des vecteurs de rotation cinématique (60 FPS)…' },
      { prg: 96, msg: 'Étalonnage couleur ProRes 4K & filigrane cryptographique…' },
      { prg: 100, msg: 'Compilation terminée !' },
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < steps.length) {
        setRenderProgress(steps[idx].prg);
        setRenderStepText(steps[idx].msg);
        idx++;
      } else {
        clearInterval(interval);
        setRendering(false);
        setRenderedSuccess(true);
        setGeneratedMediaUrl(SCENE_ASSETS[selectedScene].image);
        if (currentPlan === 'TRIAL') setAssetRendersRemaining(p => Math.max(0, p - 1));
        if (addAuditLog) {
          addAuditLog(
            'AI_ASSET_GENERATION',
            `Asset IA compilé : type=${mediaType}, scène=${selectedScene}, qualité=${currentPlan === 'ENTERPRISE' ? '8K ProRes' : '4K HD'}.`,
            'AUTHORIZED',
            'OPERATOR'
          );
        }
        confetti({ particleCount: 35, spread: 40, colors: ['#c19a6b', '#db2777'] });
      }
    }, 650);
  };

  const plan = PLANS[currentPlan];
  const annualSavings = getAnnualSavings(plan);

  return (
    <div className="space-y-6 animate-fade-in" id="saas-billing-system">

      {/* Checkout Modal */}
      {checkoutPlan && (
        <BillingCheckoutModal
          planKey={checkoutPlan}
          billing={billing}
          onClose={() => setCheckoutPlan(null)}
        />
      )}

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-stone-200/50 pb-2 gap-2">
        <button
          onClick={() => setSubTab('dashboard')}
          id="billing-sub-tab"
          className={`px-4 py-2 text-xs font-mono tracking-wider font-bold uppercase rounded-lg transition-all ${
            subTab === 'dashboard'
              ? 'bg-[#c19a6b] text-white shadow'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
          }`}
        >
          💳 Contrats & Facturation
        </button>
        <button
          onClick={() => setSubTab('marketing-studio')}
          id="studio-sub-tab"
          className={`px-4 py-2 text-xs font-mono tracking-wider font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 ${
            subTab === 'marketing-studio'
              ? 'bg-[#c19a6b] text-white shadow'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Studio Média IA
          {currentPlan === 'TRIAL' && (
            <span className="text-[9px] bg-red-500/20 text-red-600 px-1.5 py-0.5 rounded font-bold">
              {assetRendersRemaining} restants
            </span>
          )}
        </button>
      </div>

      {subTab === 'dashboard' ? (
        <div className="space-y-6">

          {/* Bannière annuelle si plan mensuel actif et payant */}
          {currentPlan !== 'TRIAL' && billing === 'monthly' && annualSavings > 0 && (
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-400/30 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-800">
                    Économisez <strong>{annualSavings}€/an</strong> en passant à la facturation annuelle
                  </p>
                  <p className="text-xs text-amber-700 font-mono">
                    Plan {plan.name} annuel : {plan.annualPrice}€/mois au lieu de {plan.monthlyPrice}€ — soit −20%
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBilling('annual')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold text-xs rounded-xl transition shrink-0"
              >
                Passer à l'annuel
              </button>
            </div>
          )}

          {/* Active Subscription Overview */}
          <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-stone-900/5 via-white/40 to-stone-900/5 border border-white/60 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                  CONTRAT ACTIF
                </span>
                {cancelAtPeriodEnd && (
                  <span className="text-[9px] bg-red-100 text-red-700 font-bold font-mono px-2 py-0.5 rounded-full border border-red-200">
                    RÉSILIATION PROGRAMMÉE
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-serif-luxury text-stone-800 font-bold flex items-center gap-2">
                Zafir Platform :{' '}
                <span
                  className="font-mono tracking-tight px-3 py-0.5 rounded-xl text-xl text-white"
                  style={{ backgroundColor: plan.color }}
                >
                  {plan.name}
                </span>
              </h3>
              <div className="text-xs text-slate-500 font-mono space-y-1">
                <p>
                  Statut : <span className="text-emerald-600 font-bold">● {subStatus}</span> · Stripe Subscription
                </p>
                <p>
                  {cancelAtPeriodEnd ? 'Résiliation le ' : 'Prochain renouvellement : '}
                  <strong>01 juillet 2026</strong>
                  {' '}({getPlanPrice(plan, billing)}€/mois · facturation {billing === 'annual' ? 'annuelle' : 'mensuelle'})
                </p>
                {currentPlan === 'TRIAL' && (
                  <p className="text-red-600 font-semibold">
                    Trial : {assetRendersRemaining} rendu(s) IA restant(s)
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2 shrink-0">
              <button
                onClick={() => setCheckoutPlan('PROFESSIONAL')}
                id="upgrade-plan-btn"
                className="px-4 py-2.5 bg-[#c19a6b] hover:bg-[#7c5a30] text-white font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" /> Gérer / Upgrader
              </button>
              {currentPlan !== 'TRIAL' && (
                <button
                  onClick={handleToggleCancel}
                  id="cancel-sub-btn"
                  className={`px-4 py-2 border font-mono text-[10px] uppercase font-bold rounded-xl transition-all ${
                    cancelAtPeriodEnd
                      ? 'border-[#c19a6b] bg-[#c19a6b]/10 text-[#7c5a30]'
                      : 'border-red-200 hover:border-red-500 text-red-600 hover:bg-red-500/10'
                  }`}
                >
                  {cancelAtPeriodEnd ? 'Réactiver le renouvellement' : 'Annuler le renouvellement'}
                </button>
              )}
            </div>
          </div>

          {/* Usage Meters */}
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl space-y-5">
            <div>
              <h4 className="text-sm font-mono font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#c19a6b]" /> Métriques d'utilisation & Limites du plan
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Volumes opérationnels actuels comparés aux limites du plan{' '}
                <strong>{plan.name}</strong>.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <UsageBar label="Suites configurées" current={12} limit={plan.limits.rooms} unit="suites" index={0} />
              <UsageBar label="Membres du staff" current={4} limit={plan.limits.staff} unit="membres" index={1} />
              <UsageBar label="Appels API / mois" current={4820} limit={plan.limits.apiCalls} unit="appels" index={2} />
              <UsageBar label="Stockage Vault" current={2.4} limit={plan.limits.storage} unit="GB" index={3} />
            </div>
          </div>

          {/* Toggle Mensuel / Annuel */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-mono font-bold text-slate-700 uppercase tracking-widest">
              Plans disponibles
            </h4>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                  billing === 'monthly' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBilling('annual')}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1 ${
                  billing === 'annual' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Annuel
                <span className="text-[9px] bg-emerald-500 text-white px-1 rounded font-bold">−20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {ALL_PLANS.map((planKey) => {
              const p = PLANS[planKey];
              const isActive = currentPlan === planKey;
              const price = getPlanPrice(p, billing);
              const savings = getAnnualSavings(p);

              return (
                <div
                  key={planKey}
                  onClick={() => !isActive && planKey !== 'TRIAL' && setCheckoutPlan(planKey)}
                  className={`glass-panel p-5 rounded-2xl flex flex-col justify-between border relative transition-all duration-300 bg-white/55 shadow ${
                    isActive
                      ? 'ring-2 border-transparent shadow-lg'
                      : planKey !== 'TRIAL'
                      ? 'border-white/60 hover:border-opacity-60 hover:shadow-lg cursor-pointer'
                      : 'border-white/60 opacity-75'
                  }`}
                  style={isActive ? { outline: `2px solid ${p.color}`, borderColor: p.color + '40' } : {}}
                >
                  {p.popular && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[9px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ backgroundColor: p.color }}
                    >
                      ★ Recommandé
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <h5 className="text-sm font-mono font-bold text-slate-800">{p.name}</h5>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">{p.tagline}</p>

                    <div className="mb-1 flex items-baseline gap-1">
                      <span className="text-3xl font-mono font-bold text-slate-900">{price}€</span>
                      <span className="text-slate-500 font-mono text-[10px]">/mois</span>
                    </div>
                    {billing === 'annual' && savings > 0 && (
                      <p className="text-[10px] font-mono text-emerald-600 font-bold mb-3">
                        Économie : {savings}€/an
                      </p>
                    )}

                    <ul className="space-y-1.5 py-4 border-t border-slate-200/50 text-[11px] text-slate-600">
                      {p.features.slice(0, 5).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3 h-3 shrink-0 mt-0.5" style={{ color: p.color }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    disabled={isActive || planKey === 'TRIAL'}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isActive && planKey !== 'TRIAL') setCheckoutPlan(planKey);
                    }}
                    className={`w-full py-2.5 text-center text-xs font-mono font-bold uppercase rounded-xl transition-all border ${
                      isActive
                        ? 'cursor-default text-white border-transparent'
                        : planKey === 'TRIAL'
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                        : 'bg-white hover:text-white text-slate-700 border-slate-300 hover:border-transparent'
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: p.color }
                        : planKey !== 'TRIAL'
                        ? undefined
                        : {}
                    }
                    onMouseEnter={(e) => {
                      if (!isActive && planKey !== 'TRIAL')
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = p.color;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive && planKey !== 'TRIAL')
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = '';
                    }}
                  >
                    {isActive ? '✓ Plan actuel' : planKey === 'TRIAL' ? 'Plan gratuit' : `Choisir ${p.name}`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Invoice History */}
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl space-y-4">
            <h4 className="text-sm font-mono font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#c19a6b]" /> Historique des factures & Reçus
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-widest text-[9px]">
                    <th className="py-2.5">Facture</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Plan</th>
                    <th className="py-2.5">Montant</th>
                    <th className="py-2.5">Statut</th>
                    <th className="py-2.5 text-right">Reçu PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-stone-200/40 hover:bg-white/30 text-stone-700 font-medium">
                      <td className="py-3 font-bold text-slate-900">#{inv.id}</td>
                      <td className="py-3">{inv.date}</td>
                      <td className="py-3">
                        <span className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border border-stone-200">
                          {inv.plan}
                        </span>
                      </td>
                      <td className="py-3 text-slate-900 font-bold">{inv.amount.toFixed(2)} EUR</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                          <CheckCircle className="w-2.5 h-2.5" /> {inv.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => alert(`Génération du reçu #${inv.id} en cours…`)}
                          className="p-1 px-2.5 bg-white border border-stone-300 hover:border-[#c19a6b] rounded-lg text-[10px] transition-all flex items-center gap-1 ml-auto"
                        >
                          <Download className="w-3 h-3" /> Télécharger
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* ─── AI Media Studio Tab ─────────────────────────────────────────── */
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Config Panel */}
            <section className="lg:col-span-4 space-y-5">
              <div>
                <h4 className="text-sm font-mono font-bold text-slate-850 uppercase tracking-widest flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#c19a6b]" style={{ animation: 'spin 8s linear infinite' }} />
                  Générateur de Médias IA
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Créez des contenus promotionnels cinématiques pour vos supports de communication haut de gamme.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Format */}
                <div className="space-y-1">
                  <label className="font-mono font-bold text-[#7c5a30] uppercase block">Format du rendu</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMediaType('image')}
                      className={`p-2.5 rounded-xl border font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                        mediaType === 'image'
                          ? 'bg-[#c19a6b]/20 border-[#c19a6b] text-[#7c5a30]'
                          : 'border-slate-200 bg-white hover:border-[#c19a6b]/50 text-slate-700'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" /> Image HD
                    </button>
                    <button
                      onClick={() => {
                        if (['TRIAL', 'STARTER'].includes(currentPlan)) {
                          alert('Fonctionnalité PRO : La vidéo cinématique nécessite le plan Professional ou Enterprise.');
                          return;
                        }
                        setMediaType('video');
                      }}
                      className={`p-2.5 rounded-xl border font-mono font-bold flex items-center justify-center gap-1.5 relative transition-all ${
                        mediaType === 'video'
                          ? 'bg-[#c19a6b]/20 border-[#c19a6b] text-[#7c5a30]'
                          : 'border-slate-200 bg-white hover:border-[#c19a6b]/50 text-slate-700'
                      }`}
                    >
                      <Video className="w-4 h-4" /> B-Roll Vidéo
                      {['TRIAL', 'STARTER'].includes(currentPlan) && (
                        <Lock className="w-3 h-3 text-slate-400 absolute top-1.5 right-1.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Scene */}
                <div className="space-y-1">
                  <label className="font-mono font-bold text-[#7c5a30] uppercase block">Scène template</label>
                  <div className="space-y-1.5">
                    {[
                      { key: 'suite', label: '⚜ Suite Penthouse Luxe', tier: 'Tous plans' },
                      { key: 'lounge', label: '🍸 Lounge Cocktail Exécutif', tier: 'Starter+' },
                      { key: 'cyber', label: '⚡ Interface Cyber Smart', tier: 'Pro+' },
                    ].map((s) => {
                      const locked =
                        (s.key === 'lounge' && currentPlan === 'TRIAL') ||
                        (s.key === 'cyber' && ['TRIAL', 'STARTER'].includes(currentPlan));
                      return (
                        <button
                          key={s.key}
                          disabled={locked}
                          onClick={() => setSelectedScene(s.key as any)}
                          className={`w-full p-2.5 text-left border rounded-xl font-mono flex items-center justify-between transition-all ${
                            locked
                              ? 'bg-stone-50 border-stone-200 text-stone-400 opacity-50 cursor-not-allowed'
                              : selectedScene === s.key
                              ? 'bg-gradient-to-r from-[#c19a6b]/15 to-white border-[#c19a6b] text-[#7c5a30] font-bold'
                              : 'border-slate-200 bg-white hover:border-[#c19a6b]/35 text-slate-700'
                          }`}
                        >
                          <span className="truncate">{s.label}</span>
                          <span className={`text-[8px] font-bold px-1.5 rounded shrink-0 ${
                            locked ? 'bg-stone-200 text-stone-500' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {locked ? '🔒' : s.tier}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Prompt */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-[#7c5a30] uppercase">Prompt créatif</span>
                    {currentPlan === 'TRIAL' && (
                      <span className="text-[10px] text-[#7c5a30] font-mono">({assetRendersRemaining} restants)</span>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 focus:border-[#c19a6b] rounded-xl font-mono text-[11px] focus:outline-none resize-none"
                  />
                </div>

                <button
                  onClick={startAssetGeneration}
                  disabled={rendering}
                  className={`w-full py-3 bg-[#c19a6b] hover:bg-[#7c5a30] text-white font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                    rendering ? 'opacity-70 cursor-wait' : ''
                  }`}
                >
                  {rendering ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Rendu en cours… {renderProgress}%</>
                  ) : (
                    <><Sparkles className="w-4 h-4 animate-pulse" /> Générer l'asset IA</>
                  )}
                </button>
              </div>
            </section>

            {/* Render Stage */}
            <section className="lg:col-span-8 flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-widest flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Studio Visualiseur 4K Ultra HD
                </span>
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold">
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded uppercase">
                    Codecs: ProRes LT
                  </span>
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded uppercase">
                    {mediaType === 'video' ? '60 FPS' : 'JPEG HDR'}
                  </span>
                </div>
              </div>

              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black border border-stone-300 shadow-inner group">
                {rendering && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 font-mono text-center gap-4 px-6">
                    <Cpu className="w-10 h-10 text-[#c19a6b] opacity-80" style={{ animation: 'spin 2s linear infinite' }} />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#c19a6b] animate-pulse">
                      RENDU IA EN COURS
                    </span>
                    <div className="w-64 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#c19a6b] transition-all duration-300" style={{ width: `${renderProgress}%` }} />
                    </div>
                    <p className="text-[10px] text-stone-400 max-w-sm">{renderStepText}</p>
                  </div>
                )}

                <div className="absolute inset-0 z-0 bg-stone-950">
                  <img
                    src={generatedMediaUrl}
                    alt="Rendu promotionnel"
                    className="w-full h-full object-cover"
                    style={{
                      animation: mediaType === 'video' && isPlaying && renderedSuccess
                        ? 'kenburns 15s infinite alternate ease-in-out'
                        : 'none',
                    }}
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />

                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-lg border border-white/10 text-[9px] font-mono font-bold text-[#c19a6b] tracking-wider z-10 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" />
                  ZAFIR_AI_NODE: {selectedScene.toUpperCase()}_v1.4
                  <span className="text-white opacity-40">|</span>
                  <span className="text-white">LIVE</span>
                </div>

                {mediaType === 'video' && renderedSuccess && (
                  <>
                    <button
                      onClick={() => setIsCurationMuted(!isCurationMuted)}
                      className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md hover:bg-black/80 p-2 rounded-full border border-white/15 text-white z-10 transition-all"
                    >
                      {isCurationMuted ? <VolumeX className="w-3.5 h-3.5 text-stone-300" /> : <Volume2 className="w-3.5 h-3.5 text-[#c19a6b] animate-bounce" />}
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-white z-10 font-mono text-[9px] flex items-center gap-3">
                      <button onClick={() => setIsPlaying(!isPlaying)} className="text-[#c19a6b] hover:text-white">
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <span>00:04 / 00:15</span>
                      <span className="text-emerald-500 font-bold animate-pulse">RENDU COMPLET</span>
                    </div>
                  </>
                )}

                {!renderedSuccess && !rendering && (
                  <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 space-y-2">
                    <HelpCircle className="w-12 h-12 text-[#c19a6b]" />
                    <h5 className="text-sm font-mono font-bold text-white uppercase">Prêt à compiler</h5>
                    <p className="text-xs text-stone-200 max-w-sm">
                      Sélectionnez un template et cliquez sur "Générer" pour compiler votre asset promotionnel 4K.
                    </p>
                  </div>
                )}
              </div>

              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes kenburns {
                  0% { transform: scale(1.02) translate(0px, 0px); }
                  100% { transform: scale(1.15) translate(-4px, -2px); }
                }
              ` }} />

              {renderedSuccess && (
                <div className="p-4 bg-stone-900/5 rounded-2xl border border-stone-200 text-xs font-mono flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h6 className="font-bold text-slate-800">✅ MÉTADONNÉES DU RENDU</h6>
                    <p className="text-[10px] text-slate-500 font-sans mt-1">
                      Compilé sur pool GPU. Signé cryptographiquement. Plan {plan.name}.
                    </p>
                  </div>
                  <button
                    onClick={() => alert(`Téléchargement de l'asset… Taille : ${mediaType === 'video' ? '82.4 MB (ProRes)' : '4.2 MB (JPEG HDR)'}`)}
                    className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-300 hover:border-[#c19a6b] font-bold text-[10px] uppercase rounded-xl transition-all flex items-center gap-1 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-[#c19a6b]" /> Télécharger l'asset
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
