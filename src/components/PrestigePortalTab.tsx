import React, { useState } from 'react';
import { 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  Calculator, 
  ArrowRight, 
  ShieldAlert, 
  Layers, 
  Key,
  Waves,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PrestigePortalTabProps {
  language: 'EN' | 'FR' | 'RU';
}

export const PrestigePortalTab: React.FC<PrestigePortalTabProps> = ({
  language
}) => {
  // Sub-navigation inside the Prestige Portal
  const [subTab, setSubTab] = useState<'hero' | 'about' | 'pricing' | 'security'>('hero');

  // Pricing calculator state
  const [selectedSuite, setSelectedSuite] = useState<'presidential' | 'royal' | 'penthouse'>('royal');
  const [nightsCount, setNightsCount] = useState(3);
  const [includeCaviar, setIncludeCaviar] = useState(true);
  const [includeHeliport, setIncludeHeliport] = useState(false);
  const [assignedButler, setAssignedButler] = useState(true);

  // Translations
  const trans = {
    EN: {
      navHero: "Prestige Accueil",
      navAbout: "Genesis & Heritage",
      navPricing: "Luxury Tariffs",
      navSecurity: "Sovereign Shield",
      heroBadge: "Epitome of Quiet Luxury",
      heroTitle: "Sovereign Sanctuary & Academic High Council",
      heroSubtitle: "Experience a pristine landscape crafted with custom cryptographic architecture, bespoke gastronomical services, and majestic mountain vistas.",
      reserveSuite: "Explore Imperial Suites",
      aboutTitle: "The Craftsmanship Behind Sovereign Luxury",
      aboutDesc1: "Founded on the high sands of the French Riviera, Zafir Academy is the world's most exclusive trust for high-end hospitality ethics, quantum architecture design, and elite spatial gastronomy.",
      aboutDesc2: "We combine historic French elegance with advanced tech-cybernetic defense protocols, giving each member a fully sovereign sanctuary untouched by global instability.",
      pricingTitle: "Exclusive Suite Accoutrements & Estimates",
      pricingSubtitle: "Model your perfect sitting. Our bespoke pricing estimator accounts for dynamic butler clearance, caviar reserves, and heliport logons.",
      suitePres: "Presidential Amber Suite",
      suiteRoyal: "Royal Embassy Chambers",
      suitePent: "Executive Light Penthouse",
      calcTitle: "Dynamic Rate Simulation",
      calcNights: "Duration of Residence (Nights)",
      addonCaviar: "24/7 Imperial Beluga Caviar Setup",
      addonHeliport: "Private Helipad Transponder Liaison",
      addonButler: "Level 5 Personal Butler Clearances",
      calcTotalVal: "Calculated Estate Allocation",
      calcBook: "Lock Sovereign Residence",
      securityTitle: "Automated Cryptographic Security Shield",
      securitySubtitle: "How the Zafir Archon Firewall stabilizes your suite, secures private ledgers, and authenticates administrative credentials.",
      secNode: "Sovereign SHA-256 Ledger Parity",
      secNodeDesc: "Every room order, keycard authorization, and cash audit is compiled into an immutable SHA-256 ledger block, validated by distributed admin nodes.",
      secCard: "Acoustic Bio-Signature Firewalls",
      secCardDesc: "Traditional physical keycards are replaced with quantum certificate tokens linked directly to guest biometric hashes.",
      secRbac: "Clearance Level Verification",
      secRbacDesc: "Rigid Role-Based Access controls restrict high-risk operations (climate override, safe access) exclusively to L5 managers."
    },
    FR: {
      navHero: "Accueil Prestige",
      navAbout: "Genèse & Édifice",
      navPricing: "Tarifs d’Exception",
      navSecurity: "Bouclier Souverain",
      heroBadge: "L'Apothéose de l'Élégance Discrète",
      heroTitle: "Sanctuaire Souverain & Institut des Hautes Études",
      heroSubtitle: "Découvrez un havre immaculé, façonné par une architecture cryptographique souveraine, une haute oenologie et une douceur de vivre impériale.",
      reserveSuite: "Explorer les Suites",
      aboutTitle: "L'art de l'hospitalité secrète et royale",
      aboutDesc1: "Né sur les falaises escarpées dominant une mer d'azur, l'Institut Zafir est le plus exclusif des établissements d'enseignement de l'éthique hôtelière de luxe, de la gastronomie d'élite et de la sécurité souveraine.",
      aboutDesc2: "Nous marions l'élégance historique avec des protocoles technologiques cybernétiques avancés pour garantir à chaque membre un sanctuaire sans égal.",
      pricingTitle: "Inclusions de Suites & Services Sur-Mesure",
      pricingSubtitle: "Estimez le coût de votre séjour de prestige. Notre simulateur intègre les accès hélicoptère, la réserve exclusive de caviar Beluga et les majordomes L5.",
      suitePres: "Suite Présidentielle Ambre",
      suiteRoyal: "Chambres de l'Ambassade Royale",
      suitePent: "Penthouse de Lumière Esthétique",
      calcTitle: "Simulation de Tarif en Temps Réel",
      calcNights: "Durée du Séjour (Nuits)",
      addonCaviar: "Service Caviar Beluga Impérial 24/7",
      addonHeliport: "Liaison Héliport Privé & Transpondeur",
      addonButler: "Majordome Dédié avec Habilitation L5",
      calcTotalVal: "Allocation Budgétaire Estimée",
      calcBook: "Bloquer la Résidence",
      securityTitle: "Sécurité Cryptographique & Technologie de Pointe",
      securitySubtitle: "Comment le pare-feu archon du système Zafir stabilise vos espaces de vie, assure vos de l'intégrité et valide vos clés d'accès.",
      secNode: "Parité de Registre SHA-256 Souveraine",
      secNodeDesc: "Toutes les commandes, accès aux suites et audits de coffres sont inscrits dans un registre cryptographique immuable validé par signature.",
      secCard: "Pare-Feu Acoustique & Biométrique",
      secCardDesc: "Les clés magnétiques standards sont remplacées par des jetons de certificat quantique liés aux signatures biométriques des invités.",
      secRbac: "Contrôles d'Accès d'Équipe Rigides",
      secRbacDesc: "Le système de rôles garantit que les actions sensibles (déverrouillage de coffre, tarifs) sont restreintes aux gestionnaires habilités."
    },
    RU: {
      navHero: "Главная Портал",
      navAbout: "История и Истоки",
      navPricing: "Премиум Тарифы",
      navSecurity: "Щит Биометрии",
      heroBadge: "Воплощение изысканной роскоши",
      heroTitle: "Суверенное Святилище и Академия Высокого Сервиса",
      heroSubtitle: "Исследуйте безупречные пространства, защищенные криптографической структурой, дополненные изысканным кейтерингом и великолепными видами.",
      reserveSuite: "Перейти к Апартаментам",
      aboutTitle: "Философия Золотого Стандарта Zafir",
      aboutDesc1: "Основанная на живописном побережье Французской Ривьеры, Академия Zafir является мировым оплотом суверенного гостеприимства, квантового дизайна и элитной гастрономии.",
      aboutDesc2: "Мы объединяем классическую европейскую роскошь с передовыми протоколами кибербезопасности, предлагая каждому члену клуба безопасность.",
      pricingTitle: "Расчет стоимости проживания",
      pricingSubtitle: "Настройте параметры своего пребывания. Интерактивный калькулятор учитывает расходы на черную икру, вертолетный трансфер и услуги мажордома.",
      suitePres: "Президентский Янтарный Люкс",
      suiteRoyal: "Королевские Посольские Покои",
      suitePent: "Апрельский Световой Пентхаус",
      calcTitle: "Симулятор расчета стоимости",
      calcNights: "Количество ночей в резиденции",
      addonCaviar: "Круглосуточная подача Черной Икры",
      addonHeliport: "Приоритетная вертолетная площадка",
      addonButler: "Личный мажордом высшего уровня доступа (L5)",
      calcTotalVal: "Расчетная сумма проживания",
      calcBook: "Забронировать покои",
      securityTitle: "Автоматизированный Криптографический Щит",
      securitySubtitle: "Как защитный сетевой экран Zafir гарантирует спокойствие, защищает ваши данные и проверяет допуски персонала.",
      secNode: "Суверенный хэш-реестр SHA-256",
      secNodeDesc: "Каждая операция в отеле, автовыпуск ключ-карт и изменения сейфа кодируются в цепочки блоков SHA-256.",
      secCard: "Акустический биометрический барьер",
      secCardDesc: "Стандартные ключи заменены квантовыми токенами, привязанными к биометрическим отпечаткам гостей.",
      secRbac: "Жесткое разграничение полномочий",
      secRbacDesc: "Строгий ролевой доступ не допускает персонал низшего звена к управлению климатом, сейфами или тарифами."
    }
  }[language];

  // Pricing constants (USD / EUR per night)
  const SUITE_RATES = {
    presidential: { name: trans.suitePres, rate: 3800 },
    royal: { name: trans.suiteRoyal, rate: 2500 },
    penthouse: { name: trans.suitePent, rate: 1800 }
  };

  const handleCalculateRate = () => {
    let base = SUITE_RATES[selectedSuite].rate * nightsCount;
    if (includeCaviar) base += 500 * nightsCount;
    if (includeHeliport) base += 1500;
    if (assignedButler) base += 750 * nightsCount;
    return base;
  };

  const handleLockIn = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#c19a6b', '#ffd700', '#fcfaf2']
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* LUXURY INNER TAB CONTROLS */}
      <div className="flex justify-center border-b border-black/5 pb-4">
        <div className="bg-slate-100/80 backdrop-blur-sm p-1 rounded-2xl flex flex-wrap justify-center gap-1 border border-slate-200 max-w-full">
          {(['hero', 'about', 'pricing', 'security'] as const).map((tab) => {
            const isActive = subTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#c19a6b] text-white shadow-md scale-102' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                {tab === 'hero' && <Globe className="w-3.5 h-3.5" />}
                {tab === 'about' && <Compass className="w-3.5 h-3.5" />}
                {tab === 'pricing' && <Calculator className="w-3.5 h-3.5" />}
                {tab === 'security' && <ShieldCheck className="w-3.5 h-3.5" />}
                {tab === 'hero' && trans.navHero}
                {tab === 'about' && trans.navAbout}
                {tab === 'pricing' && trans.navPricing}
                {tab === 'security' && trans.navSecurity}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-PAGES RENDERING */}
      {subTab === 'hero' && (
        <div className="space-y-12">
          
          {/* MAJESTIC HERO WELCOME BLOCK */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-black/5 min-h-[440px] flex items-center p-8 md:p-12">
            
            {/* Elegant luxury backdrop */}
            <div 
              className="absolute inset-0 bg-cover bg-center brightness-[0.45] saturate-[0.8] contrast-[1.1]" 
              style={{ 
                backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80')" 
              }} 
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#040914] via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-6 text-white text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-mono tracking-widest uppercase text-[#c19a6b] font-bold border border-white/20">
                <Sparkles className="w-3 h-3 text-[#c19a6b]" />
                {trans.heroBadge}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif-luxury font-bold tracking-tight leading-tight">
                {trans.heroTitle}
              </h1>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
                {trans.heroSubtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => setSubTab('pricing')}
                  className="bg-[#c19a6b] hover:bg-[#7c5a30] text-white px-6 py-3 rounded-xl font-mono text-xs uppercase font-bold tracking-widest transition shadow-lg flex items-center justify-center gap-2"
                >
                  {trans.reserveSuite}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setSubTab('about')}
                  className="bg-white/15 hover:bg-white/25 border border-white/30 text-white px-6 py-3 rounded-xl font-mono text-xs uppercase font-bold tracking-widest transition"
                >
                  {trans.navAbout}
                </button>
              </div>
            </div>
          </div>

          {/* TWO DECORATIVE RESORT GRID CALLOUTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="p-3 bg-[#c19a6b]/20 text-[#7c5a30] rounded-xl inline-block mb-4">
                  <Waves className="w-5 h-5" />
                </span>
                <h3 className="text-base font-serif-luxury font-bold text-slate-800">Imperial Spa & Waterway</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Purified crystalline thermal springs cascading with premium mineral treatments over dynamic glowing lights.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#7c5a30] tracking-wider mt-4 block">LEVEL 4 CLEARANCE ACCESS</span>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="p-3 bg-[#c19a6b]/20 text-[#7c5a30] rounded-xl inline-block mb-4">
                  <Globe className="w-5 h-5" />
                </span>
                <h3 className="text-base font-serif-luxury font-bold text-slate-800">Sovereign Heliport Liaison</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Fast executive transit with orbital flight transponders bypass links directly supporting air terminal coordinates.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 tracking-wider mt-4 block">VIP PREVENTATIVE TRANSPORT</span>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="p-3 bg-[#c19a6b]/20 text-[#7c5a30] rounded-xl inline-block mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h3 className="text-base font-serif-luxury font-bold text-slate-800">Quantum Vault Storage</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Triple-layer cryptographic document protection using high density physical containment blocks in an offline bunker.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-red-500 tracking-wider mt-4 block">LEVEL 5 ABSOLUTE INTEGRITY</span>
            </div>

          </div>

        </div>
      )}

      {subTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-7 space-y-6 text-left">
            <span className="text-[10px] uppercase font-mono font-bold text-[#c19a6b] tracking-widest">ABOUT THE ARCHITECTURE</span>
            <h2 className="text-2xl md:text-4xl font-serif-luxury font-bold text-slate-800 leading-tight">
              {trans.aboutTitle}
            </h2>
            <div className="space-y-4 text-xs md:text-sm text-slate-600 leading-relaxed font-light">
              <p>{trans.aboutDesc1}</p>
              <p>{trans.aboutDesc2}</p>
            </div>

            {/* Core credentials checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-black/5 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">✓</span>
                <span className="font-semibold text-slate-700">Verified Michelin Elite Cuisine</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">✓</span>
                <span className="font-semibold text-slate-700">Sovereign Financial Trust</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">✓</span>
                <span className="font-semibold text-slate-700">Military-Grade Cybernetic Defense</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">✓</span>
                <span className="font-semibold text-slate-700">Discrete Bio-Signature Nodes</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80" 
                alt="Zafir architecture" 
                className="w-full object-cover h-80 brightness-[0.8] grayscale-[0.1]"
              />
            </div>
            
            {/* Ambient badge overlay */}
            <div className="absolute -bottom-4 -left-4 bg-slate-900 border border-slate-800 text-[#c19a6b] p-4 rounded-2xl shadow-xl max-w-xs text-left font-mono">
              <p className="text-[9px] uppercase font-bold tracking-wider">Historical Trust Citation</p>
              <p className="text-[11px] text-white mt-1">"Established 1924, re-cleared as high-frequency sovereign territory in 2024 with zero data disclosure pacts."</p>
            </div>
          </div>

        </div>
      )}

      {subTab === 'pricing' && (
        <div className="space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#c19a6b] tracking-widest uppercase">TARIFICATION & MODELING</span>
            <h2 className="text-3xl font-serif-luxury font-bold text-slate-800">{trans.pricingTitle}</h2>
            <p className="text-xs text-slate-500 leading-relaxed">{trans.pricingSubtitle}</p>
          </div>

          {/* Pricing Selector & Calculator Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Pricing Options Cards (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Pres Card */}
              <div 
                onClick={() => setSelectedSuite('presidential')}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between text-left ${
                  selectedSuite === 'presidential'
                    ? 'bg-[#c19a6b]/20 border-[#c19a6b]/60 shadow-md ring-1 ring-[#c19a6b]'
                    : 'bg-white/60 border-slate-200 hover:border-[#c19a6b]/40'
                }`}
              >
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-[#c19a6b]">Imperial Top</span>
                  <h3 className="font-serif-luxury font-bold text-slate-800 text-sm mt-1">{SUITE_RATES.presidential.name}</h3>
                  <p className="text-xs text-slate-500 mt-2">Private helicopter link access, supreme caviar reserves.</p>
                </div>
                <div className="mt-6 border-t border-black/5 pt-3">
                  <p className="text-xl font-mono font-bold text-slate-800">${SUITE_RATES.presidential.rate}</p>
                  <p className="text-[9px] text-slate-500 font-mono">/ night standard tier</p>
                </div>
              </div>

              {/* Royal Card */}
              <div 
                onClick={() => setSelectedSuite('royal')}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between text-left ${
                  selectedSuite === 'royal'
                    ? 'bg-[#c19a6b]/20 border-[#c19a6b]/60 shadow-md ring-1 ring-[#c19a6b]'
                    : 'bg-white/60 border-slate-200 hover:border-[#c19a6b]/40'
                }`}
              >
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-indigo-600">VIP Choice</span>
                  <h3 className="font-serif-luxury font-bold text-slate-800 text-sm mt-1">{SUITE_RATES.royal.name}</h3>
                  <p className="text-xs text-slate-500 mt-2">Personal L5 butler, custom climate calibrations.</p>
                </div>
                <div className="mt-6 border-t border-black/5 pt-3">
                  <p className="text-xl font-mono font-bold text-slate-800">${SUITE_RATES.royal.rate}</p>
                  <p className="text-[9px] text-slate-500 font-mono">/ night standard tier</p>
                </div>
              </div>

              {/* Penthouse Card */}
              <div 
                onClick={() => setSelectedSuite('penthouse')}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between text-left ${
                  selectedSuite === 'penthouse'
                    ? 'bg-[#c19a6b]/20 border-[#c19a6b]/60 shadow-md ring-1 ring-[#c19a6b]'
                    : 'bg-white/60 border-slate-200 hover:border-[#c19a6b]/40'
                }`}
              >
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-teal-600">Discreet</span>
                  <h3 className="font-serif-luxury font-bold text-slate-800 text-sm mt-1">{SUITE_RATES.penthouse.name}</h3>
                  <p className="text-xs text-slate-500 mt-2">Stunning glowing vistas, high scale security.</p>
                </div>
                <div className="mt-6 border-t border-black/5 pt-3">
                  <p className="text-xl font-mono font-bold text-slate-800">${SUITE_RATES.penthouse.rate}</p>
                  <p className="text-[9px] text-slate-500 font-mono">/ night standard tier</p>
                </div>
              </div>

            </div>

            {/* Interactive Calculator Section (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 text-left space-y-6">
              
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#c19a6b] animate-bounce" />
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-[#c19a6b]">{trans.calcTitle}</h3>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400">{trans.calcNights}</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="1" 
                      max="14" 
                      value={nightsCount}
                      onChange={(e) => setNightsCount(Number(e.target.value))}
                      className="w-full text-[#c19a6b]"
                    />
                    <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded border border-slate-700 w-10 text-center">{nightsCount}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-3">
                  
                  {/* Caviar Package add-on */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition">
                    <span className="text-slate-300">{trans.addonCaviar} (+ $500/night)</span>
                    <input 
                      type="checkbox" 
                      checked={includeCaviar}
                      onChange={(e) => setIncludeCaviar(e.target.checked)}
                      className="w-4 h-4 rounded text-[#c19a6b]"
                    />
                  </label>

                  {/* Heliport Liaison transponder */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition">
                    <span className="text-slate-300">{trans.addonHeliport} (+ $1500 one-way)</span>
                    <input 
                      type="checkbox" 
                      checked={includeHeliport}
                      onChange={(e) => setIncludeHeliport(e.target.checked)}
                      className="w-4 h-4 rounded text-[#c19a6b]"
                    />
                  </label>

                  {/* Level 5 Personal Butler Clearances */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition">
                    <span className="text-slate-300">{trans.addonButler} (+ $750/night)</span>
                    <input 
                      type="checkbox" 
                      checked={assignedButler}
                      onChange={(e) => setAssignedButler(e.target.checked)}
                      className="w-4 h-4 rounded text-[#c19a6b]"
                    />
                  </label>

                </div>

              </div>

              {/* Total output representation with big gold values */}
              <div className="border-t border-slate-800/80 pt-4">
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block">{trans.calcTotalVal}</span>
                <p className="text-3xl md:text-4xl font-mono font-bold text-[#c19a6b] mt-1">${handleCalculateRate().toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Calculated based on active sovereign tariff formulas</p>
              </div>

              <button 
                onClick={handleLockIn}
                className="w-full bg-[#c19a6b] hover:bg-[#a98150] text-slate-950 font-mono font-bold text-[11px] uppercase tracking-widest p-3 rounded-xl transition duration-150 shadow-md text-center"
              >
                {trans.calcBook}
              </button>

            </div>

          </div>

        </div>
      )}

      {subTab === 'security' && (
        <div className="space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono font-bold text-red-500 tracking-widest uppercase">SOVEREIGN ARCHON INTEGRITY</span>
            <h2 className="text-3xl font-serif-luxury font-bold text-slate-800">{trans.securityTitle}</h2>
            <p className="text-xs text-slate-500 leading-relaxed">{trans.securitySubtitle}</p>
          </div>

          {/* Three Grid Security Layers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-left space-y-4">
              <span className="p-3 bg-red-950 text-red-500 border border-red-900/40 rounded-xl inline-block">
                <Layers className="w-5 h-5 animate-pulse" />
              </span>
              <h3 className="text-base font-serif-luxury font-bold text-red-100">{trans.secNode}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {trans.secNodeDesc}
              </p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-left space-y-4">
              <span className="p-3 bg-indigo-950 text-indigo-400 border border-indigo-900/40 rounded-xl inline-block">
                <Key className="w-5 h-5" />
              </span>
              <h3 className="text-base font-serif-luxury font-bold text-indigo-100">{trans.secCard}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {trans.secCardDesc}
              </p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-left space-y-4">
              <span className="p-3 bg-amber-950 text-[#c19a6b] border border-amber-900/40 rounded-xl inline-block">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h3 className="text-base font-serif-luxury font-bold text-amber-100">{trans.secRbac}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {trans.secRbacDesc}
              </p>
            </div>

          </div>

          {/* Forensic Visual audit console */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-left relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-[#c19a6b] tracking-wider">Dynamic Parity Verification</span>
              <h4 className="text-base font-serif-luxury font-bold text-slate-800">Verify Ledger Signatures</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Our cryptographic ledger ensures non-repudiation. Every event is mapped to SHA-256 blocks that you can review in real-time on our Forensic Consoles.
              </p>
            </div>
            
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-mono p-4 rounded-xl shadow">
              STATUS // EN_COMPLIANT
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
