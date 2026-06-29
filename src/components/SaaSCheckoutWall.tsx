import React, { useState } from 'react';
import { CreditCard, Check, ShieldCheck, RefreshCw, ChevronLeft, Sparkles, Building, Globe, Flame, Unlock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SaaSCheckoutWallProps {
  onPaymentSuccess: (chosenPlan: string) => void;
  onBackToWebsite: () => void;
  themeMode: 'dark' | 'light';
  language: 'EN' | 'FR' | 'RU';
}

const LOCALIZATION = {
  EN: {
    title: "Secure Checkout Gateway",
    subtitle: "Authorize a premier subscription tier to access your Sapphir Academy administration cockpit.",
    billingPeriod: "Billing Period",
    monthly: "Monthly",
    yearly: "Annual (20% Off)",
    mostPopular: "Most Popular",
    starterDesc: "For emerging boutique hosts",
    proDesc: "Complete operational & AI suite",
    entDesc: "Enterprise grade, full SLA sync",
    cardInfo: "Secured Credit Card Details",
    cardNumber: "Card Number",
    expiryDate: "Expiry Date",
    cvc: "CVC Code",
    cardHolder: "Cardholder Name",
    paySecurely: "Authorize Subscription & Unlock Dashboard",
    processing: "Processing Stripe Encrypted Payload...",
    verified: "PCI-DSS Cryptographically Encrypted Connection",
    noPhysicalLogs: "Zero-Knowledge token storage. No raw data is ever retained.",
    backToWeb: "Back to Public Showcase",
    enterpriseBadge: "Elite Sovereignty",
    step1: "Verifying client tenant keys...",
    step2: "Initializing encrypted Stripe ledger tunnels...",
    step3: "Validating biometric token clearance...",
    step4: "Capturing invoice amount and processing webhooks...",
    step5: "Elevation complete! Preparing your luxury cockpit...",
    cardHolderPlaceholder: "e.g. Elena Petrova",
    freeAccessBtn: "Instant Free Demo Access",
    freeAccessDesc: "Skip payment simulator and explore all core rubrics & AI suites immediately.",
  },
  FR: {
    title: "Passerelle de Paiement Sécurisée",
    subtitle: "Autorisez un abonnement premium pour accéder à votre cockpit d'administration de la Sapphir Academy.",
    billingPeriod: "Période de Facturation",
    monthly: "Mensuel",
    yearly: "Annuel (-20%)",
    mostPopular: "Le Plus Populaire",
    starterDesc: "Pour les établissements de charme émergents",
    proDesc: "Suite opérationnelle et IA complète",
    entDesc: "Niveau entreprise, synchronisation SLA complète",
    cardInfo: "Détails de la Carte de Crédit Sécurisée",
    cardNumber: "Numéro de Carte",
    expiryDate: "Date d'Expiration",
    cvc: "Code CVC",
    cardHolder: "Nom du Titulaire",
    paySecurely: "Autoriser l'Abonnement et Déverrouiller",
    processing: "Traitement du flux chiffré Stripe...",
    verified: "Connexion Chiffrée Cryptographiquement PCI-DSS",
    noPhysicalLogs: "Stockage de jetons à divulgation nulle de connaissance. Aucune donnée brute n'est conservée.",
    backToWeb: "Retour au Site Public",
    enterpriseBadge: "Souveraineté Élite",
    step1: "Vérification des clés de locataire client...",
    step2: "Initialisation des tunnels de registre chiffrés Stripe...",
    step3: "Validation de la détection biométrique...",
    step4: "Prélèvement de la facture et traitement des webhooks...",
    step5: "Élévation réussie ! Préparation de votre cockpit de luxe...",
    cardHolderPlaceholder: "ex. Elena Petrova",
    freeAccessBtn: "Accès Démo Gratuit Instantané",
    freeAccessDesc: "Passez le simulateur de paiement et explorez toutes les rubriques & suites IA immédiatement.",
  },
  RU: {
    title: "Безопасный Шлюз Оплаты",
    subtitle: "Активируйте премиум-подписку для доступа к административной панели управления Sapphir Academy.",
    billingPeriod: "Период Оплаты",
    monthly: "Ежемесячно",
    yearly: "Ежегодно (-20%)",
    mostPopular: "Самый Популярный",
    starterDesc: "Для развивающихся бутик-отелей",
    proDesc: "Полный пакет аналитики и ИИ-услуг",
    entDesc: "Корпоративный уровень с полной поддержкой SLA",
    cardInfo: "Данные защищенной банковской карты",
    cardNumber: "Номер карты",
    expiryDate: "Срок действия",
    cvc: "Код CVC",
    cardHolder: "Имя держателя карты",
    paySecurely: "Оплатить подписку и открыть доступ",
    processing: "Обработка зашифрованного запроса Stripe...",
    verified: "Шифрованное соединение стандарта PCI-DSS",
    noPhysicalLogs: "Криптографические токены с нулевым разглашением. Сырые данные не сохраняются.",
    backToWeb: "Назад на главный сайт",
    enterpriseBadge: "Элитный Статус",
    step1: "Проверка ключей арендатора клиента...",
    step2: "Инициализация защищенных туннелей Stripe...",
    step3: "Проверка биометрических токенов...",
    step4: "Списание средств по инвойсу и запуск вебхуков...",
    step5: "Авторизация пройдена! Подготовка вашего кокпита...",
    cardHolderPlaceholder: "напр. Elena Petrova",
    freeAccessBtn: "Мгновенный бесплатный демо-доступ",
    freeAccessDesc: "Пропустите симулятор оплаты и сразу же изучите все ключевые разделы панели.",
  }
};

const CHEKOUT_PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    monthlyPrice: 99,
    yearlyPrice: 79,
    icon: Building,
    features: {
      EN: ['Automated Room Service', 'Basic Cloud Vault (5 docs)', 'Email Support (24h)', '5 Asset Renders / Week'],
      FR: ['Service de chambre automatisé', 'Coffre-fort Cloud de base (5 docs)', 'Support email (24h)', '5 rendus d\'actifs / semaine'],
      RU: ['Автоматизированный рум-сервис', 'Базовое облачное хранилище (5 док)', 'Поддержка по email (24ч)', '5 генераций ресурсов в неделю']
    },
    color: 'text-amber-500'
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    monthlyPrice: 299,
    yearlyPrice: 239,
    popular: true,
    icon: Sparkles,
    features: {
      EN: ['AI Suite Control & Analytics', 'Biometric Cryptographic Vault', 'Priority 24/7 Support', 'Unlimited HD Assets', 'AI Cinema Video Loops'],
      FR: ['Contrôle et analyses de la suite IA', 'Coffre-fort biométrique crypté', 'Support prioritaire 24/7', 'Actifs HD illimités', 'Boucles vidéo cinéma IA'],
      RU: ['Управление ИИ-пакетом и аналитика', 'Биометрическое шифрованное хранилище', 'Приоритетная поддержка 24/7', 'Безлимитные HD ресурсы', 'Кинематографические видеопетли ИИ']
    },
    color: 'text-[#c19a6b]'
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    monthlyPrice: 999,
    yearlyPrice: 799,
    icon: Globe,
    features: {
      EN: ['Multi-Region Live Cluster Sync', 'SLA 99.99% Guaranteed', 'Dedicated Sovereign Director', 'Cinematic 8K Video Rendering', 'Full White-label Domain'],
      FR: ['Synchro de cluster en direct multi-régions', 'Garantie SLA de 99,99%', 'Directeur de compte souverain dédié', 'Rendus vidéo de qualité cinéma 8K', 'Nom de domaine en marque blanche'],
      RU: ['Мультирегиональная синхронизация кластеров', 'Гарантированный SLA 99.99%', 'Выделенный директор по обслуживанию', 'Рендеринг кинематографического видео 8K', 'Полный брендинг (White-label)']
    },
    color: 'text-emerald-500'
  }
];

export const SaaSCheckoutWall: React.FC<SaaSCheckoutWallProps> = ({
  onPaymentSuccess,
  onBackToWebsite,
  themeMode,
  language
}) => {
  const t = LOCALIZATION[language] || LOCALIZATION.EN;
  const isDark = themeMode === 'dark';

  const [selectedPlan, setSelectedPlan] = useState<string>('PROFESSIONAL');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  // Form states
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');

  const activePlanDetails = CHEKOUT_PLANS.find(p => p.id === selectedPlan) || CHEKOUT_PLANS[1];
  const activePrice = billingPeriod === 'yearly' ? activePlanDetails.yearlyPrice : activePlanDetails.monthlyPrice;

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setProgressStep(1);

    // Run premium workflow simulation
    const stepsIntervals = [1200, 2400, 3600, 4800, 6000];
    
    stepsIntervals.forEach((time, index) => {
      setTimeout(() => {
        setProgressStep(index + 1);
        if (index === stepsIntervals.length - 1) {
          // Success triggered
          setLoading(false);
          setPaymentSuccess(true);
          
          // Trigger glorious luxury gold and slate confetti explosion
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#c19a6b', '#9e7800', '#1e293b', '#ffd700', '#ffffff']
          });

          // Unlocking delayed slightly to let them enjoy the completed screen and confetti
          setTimeout(() => {
            localStorage.setItem('sapphir_has_active_subscription', 'true');
            localStorage.setItem('sapphir_current_plan', selectedPlan);
            onPaymentSuccess(selectedPlan);
          }, 2400);
        }
      }, time);
    });
  };

  const getProgressText = () => {
    switch (progressStep) {
      case 1: return t.step1;
      case 2: return t.step2;
      case 3: return t.step3;
      case 4: return t.step4;
      case 5: return t.step5;
      default: return t.processing;
    }
  };

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center z-10 transition-colors duration-300 relative ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-stone-50 text-slate-900'
    }`}>
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#c19a6b_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

      <div className="w-full max-w-5xl space-y-8 relative z-10">
        
        {/* Top bar with back option */}
        <div className="flex justify-between items-center pb-2 border-b border-stone-800/10 dark:border-slate-800/30">
          <button
            onClick={onBackToWebsite}
            className={`flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> {t.backToWeb}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c19a6b] animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase text-[#c19a6b] tracking-widest">
              Stripe Secure Sandbox Active
            </span>
          </div>
        </div>

        {/* Header Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-serif font-light tracking-tight text-slate-900 dark:text-white">
            {t.title}
          </h2>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm font-sans text-stone-500 dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>

        {paymentSuccess ? (
          // Success State
          <div className={`p-8 sm:p-12 rounded-3xl border text-center space-y-6 max-w-xl mx-auto transition-all ${
            isDark ? 'bg-slate-900/60 border-emerald-500/30' : 'bg-white border-emerald-500/20'
          }`}>
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-emerald-500 font-mono">AUTHORIZED SECURELY</h3>
              <p className="text-xs text-stone-500 dark:text-slate-400 font-sans leading-relaxed">
                Thank you! Your transaction completed successfully. Your account has been elevated to the{' '}
                <strong className="text-[#c19a6b]">{activePlanDetails.name}</strong> tier. Enjoy premium dashboard cockpit access.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 py-1 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] uppercase font-bold rounded-lg border border-emerald-500/20 max-w-xs mx-auto animate-pulse">
              <ShieldCheck className="w-4 h-4" /> SECURE HANDSHAKE VERIFIED
            </div>
          </div>
        ) : (
          // Checkout Form State
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Plan Selectors */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Toggle Billing Period */}
              <div className={`p-1.5 rounded-2xl flex items-center justify-between border ${
                isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-stone-100 border-stone-200'
              }`}>
                <span className="text-xs font-mono font-bold uppercase tracking-wide px-3 text-[#c19a6b]">
                  {t.billingPeriod}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBillingPeriod('monthly')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      billingPeriod === 'monthly'
                        ? isDark ? 'bg-[#c19a6b] text-slate-950 shadow-md' : 'bg-[#c19a6b] text-white shadow-sm'
                        : isDark ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {t.monthly}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingPeriod('yearly')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer relative ${
                      billingPeriod === 'yearly'
                        ? isDark ? 'bg-[#c19a6b] text-slate-950 shadow-md' : 'bg-[#c19a6b] text-white shadow-sm'
                        : isDark ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {t.yearly}
                    <span className="absolute -top-1.5 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Plans list */}
              <div className="space-y-4">
                {CHEKOUT_PLANS.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  const priceVal = billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
                  const PlanIcon = plan.icon;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => !loading && setSelectedPlan(plan.id)}
                      className={`p-5 rounded-2xl border transition-all duration-300 relative cursor-pointer ${
                        isSelected
                          ? 'border-[#c19a6b] bg-[#c19a6b]/5 ring-1 ring-[#c19a6b]/30'
                          : isDark
                            ? 'border-slate-850 bg-slate-900/20 hover:bg-slate-900/40'
                            : 'border-stone-200 bg-white hover:bg-stone-50/50'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2.5 right-6 bg-[#c19a6b] text-slate-950 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Flame className="w-3 h-3 text-slate-950 fill-current" /> {t.mostPopular}
                        </span>
                      )}

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${isDark ? 'bg-slate-950/80 border border-slate-800' : 'bg-stone-100'}`}>
                            <PlanIcon className={`w-5 h-5 ${plan.color}`} />
                          </div>
                          <div>
                            <h4 className={`text-base font-serif font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {plan.name}
                            </h4>
                            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              {plan.id === 'STARTER' ? t.starterDesc : plan.id === 'PROFESSIONAL' ? t.proDesc : t.entDesc}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-baseline justify-end gap-1">
                            <span className={`text-2xl font-mono font-bold ${isDark ? 'text-[#c19a6b]' : 'text-slate-900'}`}>
                              {priceVal}€
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">/mo</span>
                          </div>
                          {billingPeriod === 'yearly' && (
                            <span className="text-[9px] font-mono text-emerald-500 font-bold block uppercase">
                              Billed Annually
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Plan features grid */}
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-4 mt-4 border-t border-stone-800/10 dark:border-slate-800/30 text-[11px] text-slate-600 dark:text-slate-300 font-sans">
                        {(plan.features[language] || plan.features.EN).map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3 h-3 text-[#c19a6b] shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Simulated Card Payment Fields */}
            <div className="lg:col-span-5">
              <form 
                onSubmit={handlePaymentSubmit}
                className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between font-sans ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-300'
                }`}
              >
                <div className="space-y-4">
                  
                  {/* Summary of chosen plan */}
                  <div className={`p-3.5 rounded-xl border flex justify-between items-center ${
                    isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div>
                      <p className={`font-bold uppercase font-mono text-xs ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        {activePlanDetails.name} Tier
                      </p>
                      <p className="text-[9px] font-sans text-slate-500 uppercase tracking-widest">
                        Selected Service Level
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-bold font-mono ${isDark ? 'text-[#c19a6b]' : 'text-slate-900'}`}>
                        {activePrice}€
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">/mo</span>
                    </div>
                  </div>

                  {/* Fields container */}
                  <div className="space-y-3.5">
                    
                    {/* Cardholder name */}
                    <div className="space-y-1">
                      <label className={`font-mono text-[9px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-400' : 'text-[#7c5a30]'}`}>
                        {t.cardHolder}
                      </label>
                      <input
                        type="text"
                        placeholder={t.cardHolderPlaceholder}
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                        disabled={loading}
                        className={`w-full p-2.5 rounded-xl border font-mono text-xs focus:outline-none focus:border-[#c19a6b] transition-colors ${
                          isDark 
                            ? 'border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-600 focus:bg-slate-900/60' 
                            : 'border-slate-350 bg-stone-50 text-slate-900 placeholder-slate-400 focus:bg-white'
                        }`}
                      />
                    </div>

                    {/* Card number */}
                    <div className="space-y-1">
                      <label className={`font-mono text-[9px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-400' : 'text-[#7c5a30]'}`}>
                        {t.cardNumber}
                      </label>
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                          setCardNumber(val);
                        }}
                        required
                        disabled={loading}
                        className={`w-full p-2.5 rounded-xl border font-mono text-xs focus:outline-none focus:border-[#c19a6b] transition-colors ${
                          isDark 
                            ? 'border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-600 focus:bg-slate-900/60' 
                            : 'border-slate-350 bg-stone-50 text-slate-900 placeholder-slate-400 focus:bg-white'
                        }`}
                      />
                    </div>

                    {/* Expiry and CVV grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className={`font-mono text-[9px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-400' : 'text-[#7c5a30]'}`}>
                          {t.expiryDate}
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length > 2) {
                              val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                            }
                            setCardExpiry(val);
                          }}
                          required
                          disabled={loading}
                          className={`w-full p-2.5 rounded-xl border font-mono text-xs focus:outline-none focus:border-[#c19a6b] transition-colors ${
                            isDark 
                              ? 'border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-600 focus:bg-slate-900/60' 
                              : 'border-slate-350 bg-stone-50 text-slate-900 placeholder-slate-400 focus:bg-white'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={`font-mono text-[9px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-400' : 'text-[#7c5a30]'}`}>
                          {t.cvc}
                        </label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={3}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                          required
                          disabled={loading}
                          className={`w-full p-2.5 rounded-xl border font-mono text-xs focus:outline-none focus:border-[#c19a6b] transition-colors ${
                            isDark 
                              ? 'border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-600 focus:bg-slate-900/60' 
                              : 'border-slate-350 bg-stone-50 text-slate-900 placeholder-slate-400 focus:bg-white'
                          }`}
                        />
                      </div>
                    </div>

                  </div>

                  {/* PCI Compliant labels */}
                  <div className={`pt-3 border-t flex flex-col gap-1 text-[9px] font-sans ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <span className="flex items-center gap-1 text-[#c19a6b] font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" /> {t.verified}
                    </span>
                    <span>
                      {t.noPhysicalLogs}
                    </span>
                  </div>

                </div>

                {/* Submitting animation and action trigger */}
                <div className="mt-6 space-y-4">
                  {loading && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#c19a6b] uppercase animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin text-[#c19a6b]" />
                        {getProgressText()}
                      </div>
                      {/* Premium progress bar */}
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-stone-100'}`}>
                        <div 
                          className="h-full bg-[#c19a6b] transition-all duration-300 rounded-full"
                          style={{ width: `${(progressStep / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 bg-[#c19a6b] hover:bg-[#a67d4e] text-slate-950 font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        {t.processing}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-slate-950" />
                        {t.paySecurely}
                      </>
                    )}
                  </button>

                  {/* Free Demo Access Bypass Button */}
                  <div className={`mt-4 pt-4 border-t text-center ${isDark ? 'border-slate-800' : 'border-stone-100'}`}>
                    <p className={`text-[10px] font-sans mb-2.5 leading-normal ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                      {t.freeAccessDesc}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        confetti({
                          particleCount: 120,
                          spread: 70,
                          colors: ['#c19a6b', '#10b981', '#3b82f6', '#ffffff']
                        });
                        localStorage.setItem('sapphir_has_active_subscription', 'true');
                        localStorage.setItem('sapphir_current_plan', selectedPlan);
                        onPaymentSuccess(selectedPlan);
                      }}
                      className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 hover:text-emerald-400 font-mono font-bold text-xs uppercase rounded-xl transition-all border border-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Unlock className="w-4.5 h-4.5" />
                      {t.freeAccessBtn}
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
