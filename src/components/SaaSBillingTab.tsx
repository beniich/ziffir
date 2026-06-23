import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  Download, 
  HelpCircle, 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Film, 
  Cpu, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  CheckCircle,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SaaSBillingTabProps {
  addAuditLog?: (action: string, reason: string, status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT', role?: string) => void;
  themeMode?: 'dark' | 'light';
}

// Pricing Plans based on STRIPE_PLANS rules
const STRIPE_PLANS = {
  TRIAL: {
    id: 'TRIAL',
    name: 'Trial Access',
    price: 0,
    limits: { rooms: 5, staff: 2, apiCalls: 1000, storage: 1 },
    features: ['Standard Dashboard', 'Room Service (limited)', 'Email Support (48h)', '1 Asset Generation Render'],
  },
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    price: 99,
    limits: { rooms: 20, staff: 5, apiCalls: 10000, storage: 5 },
    features: ['Automated Room Service', 'Basic Cloud Vault (5 docs)', 'Email Support (24h)', '5 Asset Renders / Week'],
    stripePriceId: 'price_starter_123',
  },
  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: 'Professional',
    price: 299,
    limits: { rooms: 100, staff: 25, apiCalls: 100000, storage: 50 },
    features: ['AI Suite Control & Analytics', 'Biometric Cryptographic Vault', 'Priority 24/7 Support', 'Unlimited HD Assets', 'AI Cinema Video Loops'],
    stripePriceId: 'price_pro_456',
    popular: true,
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 999,
    limits: { rooms: -1, staff: -1, apiCalls: -1, storage: 500 },
    features: ['Multi-Region Live Cluster Sync', 'SLA 99.99% Guaranteed', 'Dedicated Sovereign Account Director', 'Cinematic 8K Video Rendering', 'Full White-label Domain'],
    stripePriceId: 'price_enterprise_789',
  },
};

type PlanKey = keyof typeof STRIPE_PLANS;

export const SaaSBillingTab: React.FC<SaaSBillingTabProps> = ({ addAuditLog, themeMode }) => {
  // Billing States
  const [currentPlan, setCurrentPlan] = useState<PlanKey>('TRIAL');
  const [subStatus, setSubStatus] = useState<'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED'>('ACTIVE');
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState<boolean>(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [selectedPlanToCheckout, setSelectedPlanToCheckout] = useState<PlanKey | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<'plan' | 'card' | 'success'>('plan');
  
  // Custom Card Input State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  
  // Simulated Invoices
  const [invoices, setInvoices] = useState([
    { id: 'INV-1094', date: '2026-06-01', amount: 99.00, status: 'PAID', pdfUrl: '#', plan: 'STARTER' },
    { id: 'INV-0982', date: '2026-05-01', amount: 99.00, status: 'PAID', pdfUrl: '#', plan: 'STARTER' },
    { id: 'INV-0871', date: '2026-04-01', amount: 99.00, status: 'PAID', pdfUrl: '#', plan: 'STARTER' },
  ]);

  // Active sub-tab inside Billing: "billing" or "generator"
  const [subTab, setSubTab] = useState<'dashboard' | 'marketing-studio'>('dashboard');

  // AI Media Generator States
  const [mediaType, setMediaType] = useState<'image' | 'video'>('video');
  const [selectedScene, setSelectedScene] = useState<'suite' | 'lounge' | 'cyber'>('suite');
  const [generationPrompt, setGenerationPrompt] = useState('Cinematic architectural pan of a quiet luxury guest chamber, high floor panoramic views, warm golden dusk shadows.');
  const [isCurationMuted, setIsCurationMuted] = useState(true);
  
  // Render Pipeline States
  const [rendering, setRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderStepText, setRenderStepText] = useState<string>('');
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string>('/src/assets/images/zafir_luxury_suite_1782137797843.jpg');
  const [renderedSuccess, setRenderedSuccess] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Asset counts remaining for limits check simulation
  const [assetRendersRemaining, setAssetRendersRemaining] = useState<number>(3);

  // Pre-mapped scenes images
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

  // Sync state whenever scene option changes
  useEffect(() => {
    setGenerationPrompt(SCENE_ASSETS[selectedScene].prompt);
  }, [selectedScene]);

  // Handle Stripe Mock checkout flow initiation
  const handleStartCheckout = (planId: PlanKey) => {
    setSelectedPlanToCheckout(planId);
    setCheckoutStep('card');
    setCheckoutModalOpen(true);
  };

  // Simulate Stripe secure card charge
  const executePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutLoading(true);
    
    // Simulate payment response latency
    setTimeout(() => {
      setCheckoutLoading(false);
      if (selectedPlanToCheckout) {
        setCurrentPlan(selectedPlanToCheckout);
        setSubStatus('ACTIVE');
        setCancelAtPeriodEnd(false);
        setCheckoutStep('success');
        
        // Add invoice entry
        const invId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
        const planPrice = STRIPE_PLANS[selectedPlanToCheckout].price;
        setInvoices(prev => [
          {
            id: invId,
            date: new Date().toISOString().split('T')[0],
            amount: planPrice,
            status: 'PAID',
            pdfUrl: '#',
            plan: selectedPlanToCheckout
          },
          ...prev
        ]);

        if (addAuditLog) {
          addAuditLog(
            'STRIPE_SAAS_PAYMENT_SUCCESS',
            `Stripe secure ledger charged: ${planPrice} EUR for "${STRIPE_PLANS[selectedPlanToCheckout].name}" plan. Token reference synchronized.`,
            'AUTHORIZED',
            'MANAGER'
          );
        }

        confetti({ particleCount: 50, spread: 60, colors: ['#c19a6b', '#1e293b'] });
      }
    }, 1800);
  };

  // Toggle cancellation schedule
  const handleToggleCancel = () => {
    const nextVal = !cancelAtPeriodEnd;
    setCancelAtPeriodEnd(nextVal);
    
    if (addAuditLog) {
      addAuditLog(
        nextVal ? 'SUBSCRIPTION_CANCEL_SCHEDULED' : 'SUBSCRIPTION_RESUMED',
        nextVal 
          ? `SaaS Subscription scheduled for termination on next rollover date. Future plan set to Trial.`
          : `Terminated plan status salvaged. Automatic renewal reactivated within Stripe billing schedule.`,
        'AUTHORIZED',
        'MANAGER'
      );
    }
  };

  // Trigger generator simulation pipeline with beautiful stages
  const startAssetGeneration = () => {
    // Limits check simulation
    if (currentPlan === 'TRIAL' && assetRendersRemaining <= 0) {
      if (addAuditLog) {
        addAuditLog(
          'AI_CREATIVE_LIMIT_EXCEEDED',
          `Attempted AI asset compilation blocked: Trial asset allocation depleted. Premium SaaS upgrade suggested.`,
          'RESTRICTED_ATTEMPT',
          'OPERATOR'
        );
      }
      alert('LIMIT EXCEEDED: Trial plan limits reached. Upgrade to STARTER or PROFESSIONAL to render more assets!');
      return;
    }

    setRendering(true);
    setRenderedSuccess(false);
    setRenderProgress(0);
    
    const steps = [
      { prg: 10, msg: 'Initializing Neural Renderer Engine v2.4...' },
      { prg: 25, msg: 'Acquiring premium prompt tokens & processing style vectors...' },
      { prg: 45, msg: 'Synthesizing pixel distributions on GPU cluster #9...' },
      { prg: 65, msg: 'Injecting high-dynamic-range golden ratios & shading filters...' },
      { prg: 85, msg: 'Generating cinematic pan-rotation vectors (60 FPS interpolation)...' },
      { prg: 95, msg: 'Finalizing 4K ProRes color grading & cryptographic watermark...' },
      { prg: 100, msg: 'Compilation complete!' },
    ];

    let currentStepIdx = 0;
    
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setRenderProgress(steps[currentStepIdx].prg);
        setRenderStepText(steps[currentStepIdx].msg);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setRendering(false);
        setRenderedSuccess(true);
        setGeneratedMediaUrl(SCENE_ASSETS[selectedScene].image);
        
        // Decrement simulated counters
        if (currentPlan === 'TRIAL') {
          setAssetRendersRemaining(p => Math.max(0, p - 1));
        }

        if (addAuditLog) {
          addAuditLog(
            'SaaS_AI_ASSET_GENERATION',
            `AI Asset Compiled successfully: Type=${mediaType}, Scene=${selectedScene}, Quality=${currentPlan === 'ENTERPRISE' ? '8K ProRes' : '4K Quad-HD'}. Local token used.`,
            'AUTHORIZED',
            'OPERATOR'
          );
        }

        confetti({ particleCount: 30, spread: 35, colors: ['#c19a6b', '#db2777'] });
      }
    }, 700);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="saas-billing-system">
      
      {/* Upper Navigation Selector */}
      <div className="flex border-b border-stone-200/50 pb-2 gap-2">
        <button
          onClick={() => setSubTab('dashboard')}
          className={`px-4 py-2 text-xs font-mono tracking-wider font-bold uppercase rounded-lg transition-all ${
            subTab === 'dashboard'
              ? 'bg-[#c19a6b] text-white shadow'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
          }`}
          id="billing-sub-tab"
        >
          💳 Subscriptions & Billing SaaS
        </button>
        <button
          onClick={() => setSubTab('marketing-studio')}
          className={`px-4 py-2 text-xs font-mono tracking-wider font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 ${
            subTab === 'marketing-studio'
              ? 'bg-[#c19a6b] text-white shadow'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
          }`}
          id="studio-sub-tab"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#c19a6b] group-hover:text-white" />
          AI Promo Media Studio {currentPlan === 'TRIAL' && <span className="text-[10px] bg-red-500/20 text-red-600 px-1 py-0.2 rounded font-bold font-mono">LIMIT</span>}
        </button>
      </div>

      {subTab === 'dashboard' ? (
        <div className="space-y-6">
          
          {/* Active Subscription Overview Card */}
          <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-stone-900/5 via-white/40 to-stone-900/5 border border-white/60 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">ACTIVE TENANT CONTRACT</span>
                {cancelAtPeriodEnd && (
                  <span className="text-[9px] bg-red-100 text-red-700 font-bold font-mono px-2 py-0.5 rounded-full border border-red-200">
                    PENDING TERMINATION / ROLLBACK
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-serif-luxury text-stone-800 font-bold flex items-center gap-2">
                Zafir System Service :{' '}
                <span className="font-mono text-[#7c5a30] tracking-tight bg-[#c19a6b]/10 border border-[#c19a6b]/30 px-3 py-0.5 rounded-xl text-xl">
                  {STRIPE_PLANS[currentPlan].name}
                </span>
              </h3>
              
              <div className="text-xs text-slate-500 font-mono space-y-1">
                <p>Status: <span className="text-emerald-600 font-bold">● {subStatus}</span> via Stripe Subscription</p>
                <p>Billing Rollover: {cancelAtPeriodEnd ? 'Terminates on ' : 'Next Invoice date: '} <strong>July 01, 2026</strong> ({STRIPE_PLANS[currentPlan].price} EUR/mo)</p>
                {currentPlan === 'TRIAL' && (
                  <p className="text-red-600 font-semibold uppercase">Trial Limit: {assetRendersRemaining} asset renders remaining</p>
                )}
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2 shrink-0">
              <button
                onClick={() => setCheckoutModalOpen(true)}
                className="px-4 py-2.5 bg-[#c19a6b] hover:bg-[#7c5a30] text-white font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                id="upgrade-plan-btn"
              >
                <CreditCard className="w-3.5 h-3.5" /> Manage / Upgrade
              </button>
              
              {currentPlan !== 'TRIAL' && (
                <button
                  onClick={handleToggleCancel}
                  className={`px-4 py-2 border font-mono text-[10px] uppercase font-bold rounded-xl transition-all ${
                    cancelAtPeriodEnd
                      ? 'border-[#c19a6b] bg-[#c19a6b]/10 text-[#7c5a30]'
                      : 'border-red-200 hover:border-red-500 text-red-600 hover:bg-red-500/10'
                  }`}
                  id="cancel-sub-btn"
                >
                  {cancelAtPeriodEnd ? 'Re-activate Auto Renew' : 'Cancel Auto Renew'}
                </button>
              )}
            </div>
          </div>

          {/* TELEMETRY LIMITS ENFORCEMENT MATRIX */}
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl space-y-5">
            <div>
              <h4 className="text-sm font-mono font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#c19a6b]" /> Core SaaS Limits & Current Usage Meters
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Current operational volumes matched against limits enforced by your {STRIPE_PLANS[currentPlan].name} plan tier.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <UsageBar 
                label="Suites Configured" 
                current={12} 
                limit={STRIPE_PLANS[currentPlan].limits.rooms} 
                unit="rooms" 
                themeMode={themeMode}
                index={0}
              />
              <UsageBar 
                label="Staff Members active" 
                current={4} 
                limit={STRIPE_PLANS[currentPlan].limits.staff} 
                unit="members" 
                themeMode={themeMode}
                index={1}
              />
              <UsageBar 
                label="API Synchronizations" 
                current={4820} 
                limit={STRIPE_PLANS[currentPlan].limits.apiCalls} 
                unit="calls" 
                themeMode={themeMode}
                index={2}
              />
              <UsageBar 
                label="Document Storage (Vault)" 
                current={2.4} 
                limit={STRIPE_PLANS[currentPlan].limits.storage} 
                unit="GB" 
                themeMode={themeMode}
                index={3}
              />
            </div>
          </div>

          {/* PRICING COMPILATION ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(Object.values(STRIPE_PLANS) as any[]).map((plan, index) => {
              const isActive = currentPlan === plan.id;
              return (
                <div 
                  key={plan.id}
                  className={`glass-panel p-5 rounded-2xl flex flex-col justify-between border relative cursor-pointer hover:border-[#c19a6b]/65 transition-all duration-300 bg-white/55 shadow ${
                    isActive 
                      ? 'border-[#c19a6b]/80 bg-[#c19a6b]/5 ring-1 ring-[#c19a6b]/30' 
                      : 'border-white/60'
                  }`}
                  onClick={() => {
                    if (!isActive) handleStartCheckout(plan.id);
                  }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c19a6b] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <h5 className="text-sm font-mono font-bold text-slate-800">{plan.name}</h5>
                    <div className="my-2.5 flex items-baseline gap-1">
                      <span className="text-3xl font-mono font-bold text-slate-900">{plan.price}€</span>
                      <span className="text-slate-500 font-mono text-[10px]">/month</span>
                    </div>

                    <ul className="space-y-1.5 py-4 border-t border-slate-200/50 text-[11px] text-slate-600 font-sans">
                      {plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3 h-3 text-[#c19a6b] shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    disabled={isActive}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isActive) handleStartCheckout(plan.id);
                    }}
                    className={`w-full py-2 text-center text-xs font-mono font-bold uppercase rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#c19a6b]/20 text-[#7c5a30] cursor-default border border-[#c19a6b]/40'
                        : 'bg-white hover:bg-stone-50 text-slate-700 border border-slate-350 hover:border-[#c19a6b]'
                    }`}
                    style={
                      themeMode === 'dark'
                        ? index === 0
                          ? { backgroundColor: '#c19a6b', borderColor: '#c4bfbf', color: '#15385c' }
                          : { backgroundColor: '#c19a6b', color: '#15385c' }
                        : {}
                    }
                  >
                    {isActive ? 'Current Plan' : `Choose ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* HISTORIC INVOICES SYSTEM */}
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl space-y-4">
            <h4 className="text-sm font-mono font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#c19a6b]" /> Historical Invoices & Receipts (Stripe Ledger)
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-widest text-[9px] pb-2">
                    <th className="py-2.5">Invoice ID</th>
                    <th className="py-2.5">Billing Date</th>
                    <th className="py-2.5">Plan Level</th>
                    <th className="py-2.5">Total Paid</th>
                    <th className="py-2.5">Status Check</th>
                    <th className="py-2.5 text-right">PDF receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-stone-200/40 hover:bg-white/30 text-stone-700 font-medium">
                      <td className="py-3 font-bold text-slate-900">#{inv.id}</td>
                      <td className="py-3">{inv.date}</td>
                      <td className="py-3">
                        <span 
                          className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border border-stone-200"
                          style={themeMode === 'dark' ? { backgroundColor: '#c19a6b', color: '#ffffff', borderColor: '#c19a6b' } : {}}
                        >
                          {inv.plan}
                        </span>
                      </td>
                      <td className="py-3 text-slate-900 font-bold">{inv.amount.toFixed(2)} EUR</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                          ✓ {inv.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => alert(`Generating printable receipt for Invoice #${inv.id} on ${inv.plan} plan...`)}
                          className="p-1 px-2.5 bg-white border border-stone-350 hover:border-[#c19a6b] rounded-lg text-[10px] transition-all flex items-center gap-1 ml-auto"
                          style={themeMode === 'dark' ? { backgroundColor: '#c19a6b', color: '#ffffff', borderColor: '#c19a6b' } : {}}
                        >
                          <Download className="w-3 h-3" /> Download
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
        <div className="space-y-6">
          
          {/* AI Creative Promo Hub Main Screen */}
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Creator Configuration Board */}
            <section className="lg:col-span-4 space-y-5">
              <div>
                <h4 className="text-sm font-mono font-bold text-slate-850 uppercase tracking-widest flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#c19a6b] animate-spin-slow" /> Media Pipeline Generator
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Design promotional branding cinematic materials for high-net-worth customer engagement models.
                </p>
              </div>

              {/* Generator settings */}
              <div className="space-y-3.5 text-xs">
                
                {/* Media output selector */}
                <div className="space-y-1">
                  <label className="font-mono font-bold text-[#7c5a30] uppercase block">Asset Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMediaType('image')}
                      className={`p-2.5 rounded-xl border font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                        mediaType === 'image'
                          ? 'bg-[#c19a6b]/20 border-[#c19a6b] text-[#7c5a30]'
                          : 'border-slate-350/50 bg-white hover:border-[#c19a6b]/50'
                      }`}
                      style={{ backgroundColor: '#c19a6b' }}
                    >
                      <ImageIcon className="w-4 h-4" /> Image Render
                    </button>
                    <button
                      onClick={() => {
                        if (['TRIAL', 'STARTER'].includes(currentPlan)) {
                          alert(`PRO FEATURE REQUIRED: Cinematic Video Panoramas require the PROFESSIONAL or ENTERPRISE contract plans.`);
                          return;
                        }
                        setMediaType('video');
                      }}
                      className={`p-2.5 rounded-xl border font-mono font-bold flex items-center justify-center gap-1.5 transition-all relative ${
                        mediaType === 'video'
                          ? 'bg-[#c19a6b]/20 border-[#c19a6b] text-[#7c5a30]'
                          : 'border-slate-350/50 bg-white hover:border-[#c19a6b]/50'
                      }`}
                    >
                      <Video className="w-4 h-4" /> B-Roll Video
                      {['TRIAL', 'STARTER'].includes(currentPlan) && (
                        <Lock className="w-3 h-3 text-stone-400 absolute top-1.5 right-1.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Predefined Scene Templates */}
                <div className="space-y-1">
                  <label className="font-mono font-bold text-[#7c5a30] uppercase block">Target Visual Template</label>
                  <div className="space-y-1.5">
                    {[
                      { key: 'suite', label: '⚜ Quiet Luxury Penthouse Suite', tier: 'All Plans' },
                      { key: 'lounge', label: '🍸 Sovereign Executive Cocktail Lounge', tier: 'Starter+' },
                      { key: 'cyber', label: '⚡ Cyber Smart Interface Suite', tier: 'Pro+' }
                    ].map((sceneOpt, idx) => {
                      const isLocked = (sceneOpt.key === 'lounge' && currentPlan === 'TRIAL') || 
                                      (sceneOpt.key === 'cyber' && ['TRIAL', 'STARTER'].includes(currentPlan));
                      return (
                        <button
                          key={sceneOpt.key}
                          disabled={isLocked}
                          onClick={() => setSelectedScene(sceneOpt.key as any)}
                          className={`w-full p-2.5 text-left border rounded-xl font-mono flex items-center justify-between transition-all ${
                            isLocked 
                              ? 'bg-stone-50 border-stone-200 text-stone-450 opacity-45 cursor-not-allowed'
                              : selectedScene === sceneOpt.key
                                ? 'bg-gradient-to-r from-[#c19a6b]/15 to-white border-[#c19a6b] text-[#7c5a30] font-bold'
                                : 'border-slate-350/50 bg-white hover:border-[#c19a6b]/35 text-slate-700'
                          }`}
                          style={
                            idx === 1
                              ? { backgroundColor: '#c19a6b' }
                              : idx === 2
                                ? { backgroundColor: '#c19a6b', color: '#0d0a0a', borderColor: '#090909' }
                                : {}
                          }
                        >
                          <span className="truncate">{sceneOpt.label}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                            isLocked 
                              ? 'bg-stone-200 text-stone-500' 
                              : selectedScene === sceneOpt.key
                                ? 'bg-[#c19a6b]/20 text-[#7c5a30]'
                                : 'bg-slate-100 text-slate-500'
                          }`}>
                            {isLocked ? '🔒 Locked' : sceneOpt.tier}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Prompt Customization */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-[#7c5a30] uppercase">Creative prompt tokens</span>
                    {currentPlan === 'TRIAL' && (
                      <span className="text-[10px] text-[#7c5a30] font-mono">({assetRendersRemaining} left)</span>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    className="w-full p-3 bg-white border border-stone-350 focus:border-[#c19a6b] hover:border-[#c19a6b]/50 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-[#c19a6b]/50"
                    style={{ backgroundColor: '#c19a6b', width: '277.333px', height: '87.3333px' }}
                  />
                </div>

                {/* Generate Button with telemetry */}
                <div className="pt-2">
                  <button
                    onClick={startAssetGeneration}
                    disabled={rendering}
                    className={`w-full py-3 bg-[#c19a6b] hover:bg-[#7c5a30] text-white font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                      rendering ? 'opacity-70 cursor-wait' : ''
                    }`}
                  >
                    {rendering ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Rendering Matrix... {renderProgress}%
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                        Assemble AI Promotion Asset
                      </>
                    )}
                  </button>
                </div>

              </div>
            </section>

            {/* Right Column: Immersive 4K Render Stage */}
            <section className="lg:col-span-8 flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-widest flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Ultra 4K Luxury Asset Studio Visualizer
                  </span>
                  
                  {/* Status checklist */}
                  <div className="flex items-center gap-2 font-mono text-[9px]">
                    <span 
                      className="bg-stone-100 text-stone-500 border border-stone-200 px-1.5 py-0.2 rounded font-bold uppercase"
                      style={{ backgroundColor: '#c19a6b', width: '102.4583px', height: '20.8333px' }}
                    >
                      Codecs: ProRes LT
                    </span>
                    <span 
                      className="bg-stone-100 text-stone-500 border border-stone-200 px-1.5 py-0.2 rounded font-bold uppercase"
                      style={{ width: '70.8333px', height: '20.8333px', backgroundColor: '#c19a6b' }}
                    >
                      FPS: {mediaType === 'video' ? '60fps' : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Main Render Board (Stage screen) */}
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black border border-stone-300 shadow-inner flex items-center justify-center overflow-hidden group">
                  
                  {rendering ? (
                    <div className="absolute inset-0 px-6 flex flex-col items-center justify-center bg-black/90 text-center gap-4 z-20 font-mono">
                      <div className="space-y-1 text-[#c19a6b]">
                        <Cpu className="w-10 h-10 animate-spin mx-auto text-[#c19a6b] opacity-80" />
                        <span className="text-xs font-bold uppercase tracking-widest animate-pulse font-mono block">AI COMPILER RENDERING</span>
                      </div>
                      
                      <div className="w-64 h-1.5 bg-stone-800 rounded-full overflow-hidden mx-auto border border-stone-700/60">
                        <div 
                          className="h-full bg-[#c19a6b] transition-all duration-300"
                          style={{ width: `${renderProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-stone-400 font-sans max-w-sm px-4">{renderStepText}</p>
                    </div>
                  ) : null}

                  {/* Panoramic Cinematic Pan Effect (Simulates real high-end B-roll movement!) */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden bg-stone-950 z-0 select-none">
                    <img 
                      src={generatedMediaUrl} 
                      alt="Promotional Render Outcome" 
                      className={`w-full h-full object-cover transition-all duration-1000 ${
                        mediaType === 'video' && isPlaying && renderedSuccess
                          ? 'scale-110 translate-x-2 translate-y-1 animate-pulse-slow' // Custom slow subtle pan action
                          : ''
                      }`}
                      style={{
                        animation: mediaType === 'video' && isPlaying && renderedSuccess 
                          ? 'kenburns 15s infinite alternate ease-in-out' 
                          : 'none',
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none z-10" />

                  {/* Overlaid telemetry lines */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-lg border border-white/10 text-[9px] font-mono font-bold text-[#c19a6b] tracking-wider z-10 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" />
                    <span>ZAFIR_AI_RENDER_NODE: {selectedScene.toUpperCase()}_v1.4</span>
                    <span className="text-white opacity-40">|</span>
                    <span className="text-white">LIVE FEED</span>
                  </div>

                  {/* Audio curation control toggle */}
                  {mediaType === 'video' && renderedSuccess && (
                    <button
                      onClick={() => setIsCurationMuted(!isCurationMuted)}
                      className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md hover:bg-black/80 p-2 rounded-full border border-white/15 text-white z-10 transition-all shadow"
                    >
                      {isCurationMuted ? <VolumeX className="w-3.5 h-3.5 text-stone-300" /> : <Volume2 className="w-3.5 h-3.5 text-[#c19a6b] animate-bounce" />}
                    </button>
                  )}

                  {/* Video Player Bottom bar controls (play / pause actions) */}
                  {mediaType === 'video' && renderedSuccess && (
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-white z-10 font-mono text-[9px] flex items-center gap-3">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="text-[#c19a6b] hover:text-white transition-all flex items-center justify-center"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <span>00:04 / 00:15 Sec</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-emerald-500 font-bold block animate-pulse">RENDER COMPLETE</span>
                    </div>
                  )}

                  {!renderedSuccess && !rendering && (
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10 space-y-2">
                      <HelpCircle className="w-12 h-12 text-[#c19a6b] shrink-0" />
                      <h5 className="text-sm font-mono font-bold text-white uppercase">Ready to compile promo asset</h5>
                      <p className="text-xs text-stone-200 max-w-sm">
                        Select a template and parameters from the panel and click the generate button to compile a realistic 4K visual asset.
                      </p>
                    </div>
                  )}
                </div>

                {/* Cinematic Pan Style Animation injected */}
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes kenburns {
                    0% { transform: scale(1.02) translate(0px, 0px); }
                    100% { transform: scale(1.15) translate(-4px, -2px); }
                  }
                  .animate-spin-slow {
                    animation: spin 8s linear infinite;
                  }
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}} />

                {/* Rendered Asset Details & Downloads */}
                {renderedSuccess && (
                  <div className="p-4 bg-stone-900/5 rounded-2xl border border-stone-200 text-xs font-mono flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <h6 className="font-bold text-slate-800">✅ PROMETHEUS RENDER METADATA IDENTIFIED</h6>
                      <p className="text-[10px] text-slate-500 max-w-xl font-sans">
                        Compiled on GPU pool. Enforced with cryptographic signature. Synchronized with elite customer-engagement registries matching the {STRIPE_PLANS[currentPlan].name} tier.
                      </p>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          alert(`Downloading raw visual asset... File size: ${mediaType === 'video' ? '82.4 MB (ProRes)' : '4.2 MB (JPEG HDR)'}`);
                        }}
                        className="p-2 bg-white hover:bg-stone-55 border border-stone-350 hover:border-[#c19a6b] font-bold text-[10px] uppercase rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 w-full sm:w-auto"
                      >
                        <Download className="w-3 h-3" /> Download Source
                      </button>
                      <button
                        onClick={() => {
                          alert(`Cryptographic receipt synchronised! Asset saved permanently inside Level 5 Secure Vault Tab.`);
                        }}
                        className="p-2 bg-[#c19a6b] hover:bg-[#7c5a30] font-bold text-[10px] uppercase text-white rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 w-full sm:w-auto"
                      >
                        <Lock className="w-3 h-3" /> Sync to Vault
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </section>

          </div>

        </div>
      )}

      {/* STRIPE SECURE CHECKOUT FLOW MODAL */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div 
            className="bg-white rounded-3xl border border-stone-300 w-full max-w-md overflow-hidden shadow-2xl flex flex-col justify-between font-sans"
            style={themeMode === 'dark' ? { backgroundColor: '#9e7800' } : {}}
          >
            
            {/* Modal Header */}
            <header className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-900/5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#c19a6b]" />
                <h4 className="text-sm font-mono font-bold text-slate-800 uppercase tracking-widest">
                  Secure Checkout powered by Stripe
                </h4>
              </div>
              <button 
                onClick={() => {
                  setCheckoutModalOpen(false);
                  setCheckoutStep('plan');
                }} 
                className="text-stone-500 hover:text-black font-semibold text-lg"
              >
                &times;
              </button>
            </header>

            {/* Modal Body */}
            <div className="p-6">
              
              {checkoutStep === 'card' && selectedPlanToCheckout ? (
                <form onSubmit={executePayment} className="space-y-4 text-xs font-mono">
                  
                  {/* Summary row */}
                  <div 
                    className="p-3 bg-stone-50 rounded-xl border border-stone-250 flex justify-between items-center"
                    style={themeMode === 'dark' ? { backgroundColor: '#167a27' } : {}}
                  >
                    <div>
                      <p className="font-bold text-slate-800 uppercase font-mono">{STRIPE_PLANS[selectedPlanToCheckout].name}</p>
                      <p className="font-sans text-[10px] text-stone-500 text-slate-500">Includes advanced AI asset capabilities</p>
                    </div>
                    <span className="text-xl font-bold font-mono text-slate-900">{STRIPE_PLANS[selectedPlanToCheckout].price}€/mo</span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] uppercase font-bold text-[#7c5a30]">Card Number</label>
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        className="w-full p-2.5 rounded-xl border border-slate-350 bg-stone-50 font-mono text-xs focus:outline-none focus:border-[#c19a6b]"
                        style={themeMode === 'dark' ? { backgroundColor: '#167a27' } : {}}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] uppercase font-bold text-[#7c5a30]">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          required
                          className="w-full p-2.5 rounded-xl border border-slate-350 bg-stone-50 font-mono text-xs focus:outline-none"
                          style={themeMode === 'dark' ? { backgroundColor: '#167a27' } : {}}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] uppercase font-bold text-[#7c5a30]">CVC code</label>
                        <input
                          type="text"
                          placeholder="CVV"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          required
                          maxLength={3}
                          className="w-full p-2.5 rounded-xl border border-slate-350 bg-stone-50 font-mono text-xs focus:outline-none"
                          style={themeMode === 'dark' ? { backgroundColor: '#167a27' } : {}}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="py-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-sans">
                    <span 
                      className="flex items-center gap-1 text-[#c19a6b]"
                      style={themeMode === 'dark' ? { borderColor: '#000000', color: '#ffffff' } : {}}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> PCI-DSS Compliant Connection
                    </span>
                    <span
                      style={themeMode === 'dark' ? { color: '#ffffff' } : {}}
                    >
                      No physical logging
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={checkoutLoading}
                    className="w-full py-3 bg-[#c19a6b] hover:bg-[#7c5a30] text-white font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {checkoutLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Charging Secured Card...
                      </>
                    ) : (
                      <>Securely Subscribe with Card</>
                    )}
                  </button>
                </form>
              ) : null}

              {checkoutStep === 'success' && selectedPlanToCheckout ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-base font-bold text-slate-900">Subscription Completed!</h5>
                    <p className="text-xs text-slate-500 font-sans px-4">
                      Your Zafir tenant profile has successfully been elevated to the{' '}
                      <strong>{STRIPE_PLANS[selectedPlanToCheckout].name}</strong> tier via secure Stripe webhook processing.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setCheckoutModalOpen(false);
                      setCheckoutStep('plan');
                    }}
                    className="w-full py-2.5 bg-[#c19a6b] hover:bg-[#7c5a30] text-white font-mono font-bold text-xs uppercase rounded-xl transition-all"
                  >
                    Return to Dashboard
                  </button>
                </div>
              ) : null}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Internal sub-component: Limits Usage progress bar helper
interface UsageBarProps {
  label: string;
  current: number;
  limit: number;
  unit: string;
  themeMode?: 'dark' | 'light';
  index?: number;
}

const UsageBar: React.FC<UsageBarProps> = ({ label, current, limit, unit, themeMode, index }) => {
  const isUnlimited = limit === -1;
  const percent = isUnlimited ? 0 : Math.min(100, (current / limit) * 100);
  
  let color = 'bg-[#c19a6b]';
  if (percent > 90) color = 'bg-red-500';
  else if (percent > 70) color = 'bg-amber-500';

  const isDark = themeMode === 'dark';
  const customStyle: React.CSSProperties = isDark
    ? index === 0
      ? { backgroundColor: '#0c0c0c', borderColor: '#e7e5e4', color: '#003757' }
      : { backgroundColor: '#000000', color: '#003757' }
    : {};

  return (
    <div 
      className={`p-4 rounded-2xl flex flex-col justify-between h-fit gap-2 shadow-xs border ${
        isDark ? '' : 'bg-white border-stone-200/50'
      }`}
      style={customStyle}
    >
      <div className="flex justify-between items-start text-xs">
        <span 
          className={`font-sans font-bold ${isDark ? '' : 'text-slate-707'}`}
          style={isDark ? { color: '#9292ea' } : {}}
        >
          {label}
        </span>
        <span 
          className={`font-mono font-bold ${isDark ? '' : 'text-slate-808'}`}
          style={isDark ? { color: '#9292ea' } : {}}
        >
          {current} / {isUnlimited ? '∞' : `${limit} ${unit}`}
        </span>
      </div>

      {!isUnlimited && (
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-300`} 
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
      
      <span className="text-[9px] font-mono font-semibold uppercase text-slate-500">
        {isUnlimited ? 'Unlimited metrics allowed' : `${(100 - percent).toFixed(0)}% safety padding free`}
      </span>
    </div>
  );
};
