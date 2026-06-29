import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Crown, 
  ShieldCheck, 
  Send, 
  ChevronRight, 
  CheckCircle, 
  Sliders, 
  Coffee, 
  Activity, 
  User, 
  Building, 
  Mail, 
  ArrowUpRight, 
  Wine, 
  Key,
  Lock,
  Globe,
  TrendingUp,
  Anchor,
  Layers,
  CreditCard,
  SlidersHorizontal,
  Zap,
  ShieldAlert,
  Calendar,
  Car,
  Wrench,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { firestoreService } from '../firebase';
import confetti from 'canvas-confetti';

interface MarketingWebsiteProps {
  onEnterDashboard: () => void;
  language: 'EN' | 'FR' | 'RU';
}

export const MarketingWebsite: React.FC<MarketingWebsiteProps> = ({ 
  onEnterDashboard,
  language 
}) => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Navigation active section state (simulated single-page scrolling/filtering)
  const [activeSection, setActiveSection] = useState<'accueil' | 'plateforme' | 'solutions' | 'clients' | 'apropos' | 'contact'>('accueil');

  // Interactive Live Showcase Cockpit State (The 14 screenshots!)
  const [activeCockpit, setActiveCockpit] = useState<
    'suite' | 'pricing' | 'cyber' | 'testimonials' | 'cms' | 'business' | 'yachting' | 'heatmap' | 'cards' | 'energy' | 'emergency' | 'wellness' | 'fleet' | 'predictive'
  >('suite');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Contact/Demo form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    hotel: '',
    plan: 'PRO',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // 1. Suite domotics states
  const [suiteTemp, setSuiteTemp] = useState(21.5);
  const [suiteGlass, setSuiteGlass] = useState(40);
  const [suiteLight, setSuiteLight] = useState<'AMBIENT' | 'READING' | 'RELAX'>('AMBIENT');
  const [suiteActiveId, setSuiteActiveId] = useState('201');

  // 5. CMS States
  const [cmsPalette, setCmsPalette] = useState<'navy' | 'gold' | 'charcoal'>('gold');
  const [cmsSerif, setCmsSerif] = useState(true);
  const [cmsSliders, setCmsSliders] = useState(65);
  const [cmsUpendions, setCmsUpendions] = useState(80);

  // 8. Heatmap states
  const [selectedHeatmapZone, setSelectedHeatmapZone] = useState<'suite' | 'lobby' | 'spa'>('suite');

  // 9. Membership configurator states
  const [platinumConcierge, setPlatinumConcierge] = useState(true);

  // 15. Solutions Calculator States
  const [solutionsRoomsCount, setSolutionsRoomsCount] = useState(45);
  const [solutionsTier, setSolutionsTier] = useState<'PALACE' | 'CLUB' | 'CHALET'>('PALACE');

  // 16. Clients section states
  const [selectedClientCategory, setSelectedClientCategory] = useState<'ALL' | 'PALACE' | 'CLUB' | 'FLEET'>('ALL');
  const [clientSearchNode, setClientSearchNode] = useState('NODE-COURCHEVEL');
  const [clientNodeStatus, setClientNodeStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [clientNodeOutput, setClientNodeOutput] = useState<string[]>([]);

  // 17. Contact Appointment/Date States
  const [contactDemoDate, setContactDemoDate] = useState('2026-07-15');
  const [contactDemoTime, setContactDemoTime] = useState('14:00');
  const [contactDemoLang, setContactDemoLang] = useState('FR');
  const [contactInvitationCode, setContactInvitationCode] = useState('');
  const [activeAboutYear, setActiveAboutYear] = useState<2024 | 2025 | 2026>(2024);
  const [platinumSpa, setPlatinumSpa] = useState(true);
  const [platinumHost, setPlatinumHost] = useState(true);
  const [goldConcierge, setGoldConcierge] = useState(true);
  const [goldSpa, setGoldSpa] = useState(false);
  const [goldHost, setGoldHost] = useState(true);
  const [onyxConcierge, setOnyxConcierge] = useState(true);
  const [onyxSpa, setOnyxSpa] = useState(true);
  const [onyxHost, setOnyxHost] = useState(true);

  const [platinumFee, setPlatinumFee] = useState('50000');
  const [goldFee, setGoldFee] = useState('25000');
  const [onyxFee, setOnyxFee] = useState('10000');

  // 10. Energy States
  const [energyReportOpen, setEnergyReportOpen] = useState(false);
  const [energyHvacLoad, setEnergyHvacLoad] = useState(75);
  const [energyWaterUsage, setEnergyWaterUsage] = useState(1200);
  const [energyProduction, setEnergyProduction] = useState(4500);

  // 11. Emergency / Crisis States
  const [lockdownTimer, setLockdownTimer] = useState("00:02:30");
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [connectedResponders, setConnectedResponders] = useState<string[]>([]);

  // 12. Wellness Scheduler States
  const [selectedWellnessSlot, setSelectedWellnessSlot] = useState<string>('facial');
  
  // 13. Fleet / Transport States
  const [selectedFleetVehicle, setSelectedFleetVehicle] = useState<string>('sedan');

  // 14. Predictive Maintenance States
  const [activeMaintenanceTask, setActiveMaintenanceTask] = useState<string | null>(null);

  // Additional Interactive states for new tabs (to prevent mock/phantom features)
  const [wellnessSlots, setWellnessSlots] = useState([
    { id: 'facial', name: 'VIP Gold-Leaf Facial', guest: 'Mrs. Dubois', time: '10:00 AM', room: 'Treatment Room 1', therapist: 'Sofia', notes: 'Anniversary Treatment. Prefer high pressure and lavender aromatherapy.', status: 'Confirmed' },
    { id: 'massage', name: 'Deep Tissue Massage', guest: 'Mr. Lee', time: '11:30 AM', room: 'Treatment Room 2', therapist: 'Marco', notes: 'Sports recovery focus. No aromatherapy.', status: 'In Progress' },
    { id: 'consultation', name: 'Wellness Consultation', guest: 'Ms. Al-Fayed', time: '02:00 PM', room: 'Therapist A Room', therapist: 'Sofia', notes: 'First-time consultation. Dietary profile overview requested.', status: 'Pending' }
  ]);
  const [newWellnessName, setNewWellnessName] = useState('Imperial Scented Ritual');
  const [newWellnessGuest, setNewWellnessGuest] = useState('Prince Al-Waleed');
  const [newWellnessTime, setNewWellnessTime] = useState('04:00 PM');
  const [newWellnessRoom, setNewWellnessRoom] = useState('Treatment Room 1');
  const [newWellnessTherapist, setNewWellnessTherapist] = useState('Sofia');
  const [bookingFormOpen, setBookingFormOpen] = useState(false);

  // Fleet Dispatch coordinates
  const [fleetCars, setFleetCars] = useState([
    { id: 'sedan', name: 'Phantom Class Sedan', driver: 'Jean L.', status: 'On Duty', location: 'Grand Lobby Entrance', x: 45, y: 35, speed: 0, image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80' },
    { id: 'suv', name: 'Luxury Cullinan SUV', driver: 'Elena P.', status: 'On Duty', location: 'Monaco Heliport', x: 75, y: 65, speed: 42, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80' },
    { id: 'spyder', name: 'Performance Spyder', driver: 'Kasna P.', status: 'Standby', location: 'Nice Private Terminal', x: 20, y: 75, speed: 0, image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=600&q=80' }
  ]);

  // Predictive Maintenance Logs
  const [maintenanceTasks, setMaintenanceTasks] = useState([
    { id: 'task1', title: 'AC Filter Check', location: 'Room 204 (Predictive)', priority: 'Predictive', date: 'Due June 23, 2026', roomNum: '204', appliance: 'AC unit', status: 'Pending' },
    { id: 'task2', title: 'Mini-bar Compressor Alert', location: 'Suite 101 (Warning)', priority: 'Warning', date: 'Due June 25, 2026', roomNum: '101', appliance: 'Mini-bar', status: 'Pending' },
    { id: 'task3', title: 'Smart Lock Battery Swap', location: 'Club Lounge (Warning)', priority: 'Warning', date: 'Due June 28, 2026', roomNum: 'Lobby', appliance: 'Smart Lock', status: 'Pending' },
    { id: 'task4', title: 'Water Leak Detection Sensor', location: 'Spa Wellness Area (Predictive)', priority: 'Predictive', date: 'Due July 02, 2026', roomNum: 'Spa', appliance: 'Water Sensor', status: 'Pending' }
  ]);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsOutput, setDiagnosticsOutput] = useState<string[]>([]);

  // Ticking countdown effect for emergency protocol
  React.useEffect(() => {
    let seconds = 150; // 2 mins 30 secs
    const interval = setInterval(() => {
      if (seconds > 0) {
        seconds--;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        setLockdownTimer(
          `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
      } else {
        seconds = 150; // loop it
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Multi-lingual translations
  const trans = {
    FR: {
      tagline: "L'art de l'hospitalité de luxe, piloté en temps réel",
      subtagline: "Zaphir: Le centre de commandement ultime pour les hôtels, palaces et clubs privés d'exception.",
      ctaDemo: "Demander une démo privée",
      ctaDashboard: "Accéder au Dashboard",
      discover: "Découvrir la Suite Interactive",
      navPlatform: "Plateforme",
      navSolutions: "Solutions",
      navClients: "Clients",
      navAbout: "À Propos",
      navContact: "Contact",
      formName: "Votre Nom complet",
      formEmail: "Adresse e-mail professionnelle",
      formHotel: "Nom de l'établissement / Resort",
      formPlan: "Formule d'intérêt",
      formNotes: "Notes de personnalisation & demandes spécifiques",
      formSubmit: "Transmettre la demande confidentielle",
      formSuccessTitle: "Demande enregistrée avec succès !",
      formSuccessText: "Notre concierge technologique vous contactera sous 24h pour organiser votre démonstration privée."
    },
    EN: {
      tagline: "The art of luxury hospitality, steered in real time",
      subtagline: "Zaphir: The ultimate command center for exceptional hotels, palaces, and private clubs.",
      ctaDemo: "Request a private demo",
      ctaDashboard: "Access Dashboard",
      discover: "Discover Interactive Suite",
      navPlatform: "Platform",
      navSolutions: "Solutions",
      navClients: "Clients",
      navAbout: "About Us",
      navContact: "Contact",
      formName: "Your Full Name",
      formEmail: "Professional email address",
      formHotel: "Hotel Name / Resort",
      formPlan: "Plan of Interest",
      formNotes: "Personalization notes & specific requirements",
      formSubmit: "Submit confidential request",
      formSuccessTitle: "Request recorded successfully !",
      formSuccessText: "Our technological concierge will contact you within 24 hours to organize your private demonstration."
    },
    RU: {
      tagline: "Искусство роскошного сервиса, управляемое в реальном времени",
      subtagline: "Zaphir: Ультимативный командный центр для исключительных отелей, дворцов и частных клубов.",
      ctaDemo: "Запросить частную демо-версию",
      ctaDashboard: "Войти в Панель",
      discover: "Показать интерактивную панель",
      navPlatform: "Платформа",
      navSolutions: "Решения",
      navClients: "Клиенты",
      navAbout: "О нас",
      navContact: "Контакты",
      formName: "Ваше имя",
      formEmail: "Рабочий e-mail",
      formHotel: "Название отеля / курорта",
      formPlan: "Интересующий тариф",
      formNotes: "Особые пожелания и примечания",
      formSubmit: "Отправить конфиденциальный запрос",
      formSuccessTitle: "Запрос успешно зарегистрирован!",
      formSuccessText: "Наш технологический консьерж свяжется с вами в течение 24 часов."
    }
  }[language] || {
    tagline: "L'art de l'hospitalité de luxe, piloté en temps réel",
    subtagline: "Zaphir: Le centre de commandement ultime pour les hôtels, palaces et clubs privés d'exception.",
    ctaDemo: "Demander une démo privée",
    ctaDashboard: "Accéder au Dashboard",
    discover: "Découvrir la Suite Interactive",
    navPlatform: "Plateforme",
    navSolutions: "Solutions",
    navClients: "Clients",
    navAbout: "À Propos",
    navContact: "Contact",
    formName: "Votre Nom complet",
    formEmail: "Adresse e-mail professionnelle",
    formHotel: "Nom de l'établissement / Resort",
    formPlan: "Formule d'intérêt",
    formNotes: "Notes de personnalisation & demandes spécifiques",
    formSubmit: "Transmettre la demande confidentielle",
    formSuccessTitle: "Demande enregistrée avec succès !",
    formSuccessText: "Notre concierge technologique vous contactera sous 24h pour organiser votre démonstration privée."
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Veuillez remplir au moins votre nom et email.");
      return;
    }
    setSubmitting(true);
    try {
      const code = `ZPHR-${Math.floor(1000 + Math.random() * 9000)}-${formData.plan}-${Math.floor(10 + Math.random() * 89)}`;
      setContactInvitationCode(code);
      
      await firestoreService.saveDemoRequest({
        name: formData.name,
        email: formData.email,
        hotel: formData.hotel,
        plan: formData.plan,
        notes: `[Demo scheduled on ${contactDemoDate} at ${contactDemoTime} in ${contactDemoLang}] [Pass: ${code}] ${formData.notes}`
      });
      setSuccess(true);
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#c19a6b', '#dfb175', '#ffffff', '#000000']
      });
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'envoi de la demande. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#03050a] text-slate-200 min-h-screen relative font-sans selection:bg-[#c19a6b]/30 selection:text-[#c19a6b] overflow-x-hidden">
      
      {/* Luxury texture backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#c19a6b_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#0a0f1d] via-transparent to-transparent pointer-events-none z-0" />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5 bg-[#03050a]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveSection('accueil'); setMobileMenuOpen(false); }}>
            <div className="relative">
              <span className="font-serif text-2xl tracking-widest font-extrabold text-[#c19a6b] uppercase">ZAPHIR</span>
              <Crown className="w-3.5 h-3.5 text-[#c19a6b] absolute -top-2.5 right-0 rotate-12" />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest uppercase text-slate-400">
            {[
              { id: 'plateforme', label: trans.navPlatform },
              { id: 'solutions', label: trans.navSolutions },
              { id: 'clients', label: trans.navClients },
              { id: 'apropos', label: trans.navAbout },
              { id: 'contact', label: trans.navContact }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as any);
                  const el = document.getElementById(item.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`hover:text-[#c19a6b] transition-all relative py-1 ${
                  activeSection === item.id ? 'text-[#c19a6b] font-bold border-b border-[#c19a6b]' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setActiveSection('contact');
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden lg:inline-block border border-[#c19a6b]/30 hover:border-[#c19a6b] text-slate-300 hover:text-white px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all duration-300"
            >
              {trans.ctaDemo}
            </button>
            <button
              onClick={onEnterDashboard}
              className="bg-gradient-to-r from-[#c19a6b] to-[#a37c4c] hover:brightness-110 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg font-mono text-[9px] sm:text-[10px] uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(193,154,107,0.3)] hover:shadow-[0_0_20px_rgba(193,154,107,0.5)] transition-all duration-300 flex items-center gap-1 shrink-0"
            >
              <span className="hidden xs:inline">{trans.ctaDashboard}</span>
              <span className="xs:hidden">Console</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile menu hamburger toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 transition-all"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV OVERLAY */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-20 z-40 bg-[#03050a]/95 backdrop-blur-2xl border-b border-white/5 p-6 animate-fade-in space-y-4 shadow-2xl">
          <nav className="flex flex-col gap-4 text-xs font-mono tracking-widest uppercase text-slate-400">
            {[
              { id: 'plateforme', label: trans.navPlatform },
              { id: 'solutions', label: trans.navSolutions },
              { id: 'clients', label: trans.navClients },
              { id: 'apropos', label: trans.navAbout },
              { id: 'contact', label: trans.navContact }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as any);
                  setMobileMenuOpen(false);
                  const el = document.getElementById(item.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`text-left py-2 border-b border-white/5 hover:text-[#c19a6b] transition-all ${
                  activeSection === item.id ? 'text-[#c19a6b] font-bold pl-2 border-l border-[#c19a6b]' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveSection('contact');
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-center border border-[#c19a6b]/30 hover:border-[#c19a6b] text-slate-300 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all duration-300"
            >
              {trans.ctaDemo}
            </button>
          </div>
        </div>
      )}

      {/* CORE WRAPPER */}
      <div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 space-y-24"
        style={{ paddingTop: '10px' }}
      >
        
        {/* HERO */}
        <section 
          id="accueil" 
          className="pt-8 md:pt-16 space-y-10 text-center max-w-4xl mx-auto"
          style={{ paddingTop: '10px', marginLeft: isLargeScreen ? '160.667px' : 'auto' }}
        >
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#c19a6b]/10 backdrop-blur-md rounded-full text-[9px] font-mono tracking-[0.25em] uppercase text-[#c19a6b] font-bold border border-[#c19a6b]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#c19a6b]" />
            <span>{language === 'FR' ? 'EXCELLENCE OPÉRATIONNELLE' : 'OPERATIONAL EXCELLENCE'}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-slate-100 font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto">
            {trans.tagline.split(',')[0]},
            <span className="block bg-gradient-to-r from-[#e1bf93] via-[#c19a6b] to-[#997341] bg-clip-text text-transparent">
              {trans.tagline.split(',')[1]}
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
            {trans.subtagline}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={() => {
                setActiveSection('contact');
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#c19a6b] via-[#dfb175] to-[#c19a6b] text-slate-950 rounded-xl font-mono text-xs uppercase font-extrabold tracking-widest transition-all duration-300 shadow-[0_0_25px_rgba(193,154,107,0.4)] hover:shadow-[0_0_35px_rgba(193,154,107,0.65)] hover:scale-102"
            >
              {trans.ctaDemo}
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('cockpit-playground');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white rounded-xl font-mono text-xs uppercase font-bold tracking-widest transition border border-white/15 hover:border-[#c19a6b]/40 flex items-center justify-center gap-2"
            >
              <span>{trans.discover}</span>
              <ChevronRight className="w-4 h-4 text-[#c19a6b]" />
            </button>
          </div>
        </section>

        {/* 9-IN-1 INTERACTIVE COCKPIT PLAYGROUND */}
        <section 
          id="cockpit-playground" 
          className="pt-4 space-y-8 scroll-mt-24"
          style={{ paddingTop: '8px' }}
        >
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-[#c19a6b] text-[10px] font-mono tracking-[0.2em] uppercase font-bold">
              ★ DEMO INTERACTIVE EN TEMPS RÉEL ★
            </span>
            <h2 className="text-3xl font-serif font-bold text-slate-100 tracking-tight">
              Cockpits de l'Excellence Opérationnelle
            </h2>
            <p className="text-xs text-slate-400 font-light max-w-xl mx-auto">
              Cliquez sur les onglets ci-dessous pour explorer en temps réel les 9 interfaces authentiques de la suite de luxe Zaphir.
            </p>
          </div>

          {/* Tab Selector buttons */}
          <div className="flex overflow-x-auto pb-2 mb-2 lg:pb-1.5 lg:mb-0 lg:grid lg:grid-cols-7 gap-1.5 p-1.5 bg-[#0e111a] border border-white/5 rounded-2xl max-w-6xl mx-auto scrollbar-none">
            {[
              { id: 'suite', label: 'Suite VIP', icon: <Sliders className="w-3.5 h-3.5" /> },
              { id: 'pricing', label: 'Plans & Tarifs', icon: <CreditCard className="w-3.5 h-3.5" /> },
              { id: 'cyber', label: 'Cybersécurité', icon: <Lock className="w-3.5 h-3.5" /> },
              { id: 'testimonials', label: 'Témoignages', icon: <Crown className="w-3.5 h-3.5" /> },
              { id: 'cms', label: 'Atmosphère CMS', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
              { id: 'business', label: 'Pôle Business', icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { id: 'yachting', label: 'Yachting Ed.', icon: <Anchor className="w-3.5 h-3.5" /> },
              { id: 'heatmap', label: 'Flux & Heatmap', icon: <Activity className="w-3.5 h-3.5" /> },
              { id: 'cards', label: 'Cartes Métal', icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'energy', label: 'Énergie', icon: <Zap className="w-3.5 h-3.5" /> },
              { id: 'emergency', label: 'Sécurité', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
              { id: 'wellness', label: 'Spa Wellness', icon: <Calendar className="w-3.5 h-3.5" /> },
              { id: 'fleet', label: 'Chauffeurs', icon: <Car className="w-3.5 h-3.5" /> },
              { id: 'predictive', label: 'Maint. IA', icon: <Wrench className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCockpit(tab.id as any)}
                className={`py-2.5 px-3 lg:px-1 text-[9px] font-mono rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 shrink-0 min-w-[110px] lg:min-w-0 lg:w-auto cursor-pointer ${
                  activeCockpit === tab.id
                    ? 'bg-gradient-to-b from-[#c19a6b]/20 to-[#a37c4c]/5 border-[#c19a6b] text-[#c19a6b] font-bold shadow-[0_0_15px_rgba(193,154,107,0.15)]'
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* MAIN CONTAINER RENDERING THE ACTIVE SUB-SCREEN */}
          <div className="max-w-6xl mx-auto bg-slate-950 border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_60px_rgba(193,154,107,0.1)] min-h-[480px] flex flex-col">
            
            {/* Top Bar for each screen */}
            <div className="bg-[#0b0e17] border-b border-white/5 px-6 py-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c19a6b] animate-pulse" />
                <span>ZAPHIR SYSTEM CONSOLE v4.2 - LIVE MODE</span>
              </div>
              <div className="flex items-center gap-4">
                <span>TAB_ID: {activeCockpit.toUpperCase()}</span>
                <span>SECURE_TOKEN_AES_256</span>
              </div>
            </div>

            <div className="flex-1">
              
              {/* SCREEN 1: PRESTIGE VIP GUEST PORTAL (Suite control) */}
              {activeCockpit === 'suite' && (
                <div className="p-6 md:p-8 space-y-6 bg-gradient-to-b from-[#0e1017] to-[#04060b]">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-[#c19a6b]" />
                        <h3 className="font-serif text-xl text-[#c19a6b] tracking-wider uppercase">PRESTIGE VIP GUEST PORTAL</h3>
                      </div>
                      <p className="text-xs text-slate-400 font-light mt-1">
                        Welcome, Mr. Alexandre Beaumont. Room {suiteActiveId}, The Penthouse.
                      </p>
                    </div>
                    
                    {/* Suite Selector Toggle */}
                    <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                      {['101', '201', '301'].map((id) => (
                        <button
                          key={id}
                          onClick={() => setSuiteActiveId(id)}
                          className={`px-3 py-1 text-[10px] font-mono rounded-lg transition ${
                            suiteActiveId === id ? 'bg-[#c19a6b] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Suite {id}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Domotic Cockpit */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* 1. Climate control */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-between space-y-6">
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">CLIMATE CONTROL</span>
                      
                      {/* Thermostat Wheel Representation */}
                      <div className="relative w-40 h-40 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#c19a6b]/20 animate-spin-slow" />
                        <div className="absolute inset-2 rounded-full border-4 border-[#c19a6b] shadow-[0_0_20px_rgba(193,154,107,0.3)] flex flex-col items-center justify-center bg-[#0d0f16]">
                          <span className="text-2xl font-mono font-extrabold text-slate-100">{suiteTemp.toFixed(1)}°C</span>
                          <span className="text-[9px] font-mono text-[#c19a6b]/70 tracking-widest uppercase">Set Goal</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex gap-3 w-full">
                        <button 
                          onClick={() => setSuiteTemp(t => Math.max(16, t - 0.5))}
                          className="flex-1 py-2 bg-white/5 border border-white/10 hover:border-[#c19a6b]/40 rounded-xl text-lg font-mono font-bold transition"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => setSuiteTemp(t => Math.min(30, t + 0.5))}
                          className="flex-1 py-2 bg-white/5 border border-white/10 hover:border-[#c19a6b]/40 rounded-xl text-lg font-mono font-bold transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* 2. Lighting moods */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4">
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block text-center">LIGHTING MOODS</span>
                      
                      {[
                        { id: 'AMBIENT', label: 'AMBIENT MOOD', desc: 'Soft glow, perfect for resting', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
                        { id: 'READING', label: 'READING FOCUS', desc: 'Targeted high contrast white rays', icon: <BookIcon className="w-4 h-4 text-sky-400" /> },
                        { id: 'RELAX', label: 'ROYAL RELAX', desc: 'Warm candle simulation setup', icon: <Coffee className="w-4 h-4 text-[#c19a6b]" /> }
                      ].map((mood) => (
                        <button
                          key={mood.id}
                          onClick={() => setSuiteLight(mood.id as any)}
                          className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all duration-300 ${
                            suiteLight === mood.id 
                              ? 'bg-[#c19a6b]/10 border-[#c19a6b] text-[#c19a6b]' 
                              : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono uppercase font-bold tracking-wider block">{mood.label}</span>
                            <span className="text-[9px] text-slate-500 font-light block">{mood.desc}</span>
                          </div>
                          {mood.icon}
                        </button>
                      ))}
                    </div>

                    {/* 3. Smart Wine Cellar & Services */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest text-center block">PRIVATE SERVICES</span>
                      
                      {/* Glass opacity state */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>SMART GLASS OPACITY</span>
                          <span className="text-[#c19a6b] font-bold">{suiteGlass}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={suiteGlass}
                          onChange={(e) => setSuiteGlass(Number(e.target.value))}
                          className="w-full accent-[#c19a6b] bg-slate-800 h-1.5 rounded-lg"
                        />
                      </div>

                      {/* VIP Wine sommelier block */}
                      <div className="p-3.5 bg-[#c19a6b]/5 border border-[#c19a6b]/20 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-[#c19a6b] font-bold uppercase tracking-wider">SOMMELIER ACTIVE Pairing</span>
                          <Wine className="w-4 h-4 text-[#c19a6b]" />
                        </div>
                        <p className="text-[10px] text-slate-300 font-light">
                          Our active pairing engine recommends **Château Margaux 2015** with your upcoming dinner menu.
                        </p>
                      </div>

                      <button 
                        onClick={() => {
                          confetti({ particleCount: 50, spread: 60 });
                          alert("A private steward has been assigned to Suite " + suiteActiveId + ". Expected arrival: 4 mins.");
                        }}
                        className="w-full py-3 bg-gradient-to-r from-[#c19a6b] to-[#a37c4c] text-white rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest hover:brightness-110 transition shadow-lg shadow-[#c19a6b]/10"
                      >
                        🔔 Concierge On-Demand
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* SCREEN 2: SUBSCRIPTION TIERS AND PRICING (Elegant light background) */}
              {activeCockpit === 'pricing' && (
                <div className="bg-[#f9f6f0] text-slate-900 p-8 md:p-12 space-y-8 relative overflow-hidden">
                  
                  {/* Classical architectural background pillars simulation */}
                  <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex justify-between px-12">
                    <div className="border-r border-slate-900 h-full w-24 border-double" />
                    <div className="border-r border-slate-900 h-full w-24 border-double" />
                    <div className="border-r border-slate-900 h-full w-24 border-double" />
                  </div>

                  <div className="text-center space-y-3 max-w-xl mx-auto relative z-10">
                    <span className="text-[#c19a6b] text-[10px] font-mono tracking-widest uppercase font-bold">ZAPHIR PRICING PLATFORM</span>
                    <h3 className="text-3xl font-serif font-extrabold text-slate-900 tracking-tight">Subscription Tiers and Pricing</h3>
                    <p className="text-xs text-slate-600 font-light">
                      Choose the right plan for your luxury hotel, estate, superyacht, or private club.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative z-10">
                    
                    {/* PLAN 1: STARTER */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
                      <div className="bg-[#101e35] text-white p-5 text-center">
                        <span className="font-mono text-xs uppercase tracking-widest font-extrabold">STARTER</span>
                      </div>
                      <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4 text-center">
                          <div className="text-4xl font-serif font-bold text-slate-900">
                            €399<span className="text-xs font-mono font-normal text-slate-500">/month</span>
                          </div>
                          <div className="h-[1px] bg-slate-100" />
                          <div className="space-y-3.5 text-left">
                            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">Basic features</span>
                            <div className="space-y-2.5 text-xs text-slate-600">
                              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> <span>5 User Accounts</span></div>
                              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> <span>Basic Live Analytics</span></div>
                              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> <span>Email support priority L1</span></div>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => alert("Starter plan selected. Our operations team is initializing your cloud node.")}
                          className="w-full py-3 border border-[#101e35] text-[#101e35] font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl hover:bg-[#101e35] hover:text-white transition"
                        >
                          Initialize Starter
                        </button>
                      </div>
                    </div>

                    {/* PLAN 2: PRO (RECOMMENDED - GOLD PLATED) */}
                    <div className="bg-white rounded-2xl border-2 border-[#c19a6b] shadow-lg flex flex-col justify-between overflow-hidden relative scale-102">
                      <div className="absolute top-2 right-2 bg-[#c19a6b]/20 text-[#7c5a30] text-[8px] font-mono font-bold px-2 py-0.5 rounded border border-[#c19a6b]/30">
                        RECOMMENDED
                      </div>
                      <div className="bg-gradient-to-r from-[#c19a6b] to-[#a37c4c] text-white p-5 text-center">
                        <span className="font-mono text-xs uppercase tracking-widest font-extrabold">PRO SYSTEM</span>
                      </div>
                      <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4 text-center">
                          <div className="text-4xl font-serif font-bold text-slate-900">
                            €799<span className="text-xs font-mono font-normal text-slate-500">/month</span>
                          </div>
                          <div className="h-[1px] bg-slate-100" />
                          <div className="space-y-3.5 text-left">
                            <span className="text-[10px] font-mono uppercase text-[#c19a6b] tracking-wider block">Advanced features</span>
                            <div className="space-y-2.5 text-xs text-slate-600">
                              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#c19a6b]" /> <span>Unlimited Users & Devices</span></div>
                              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#c19a6b]" /> <span>Real-time 3D Analytics Cockpit</span></div>
                              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#c19a6b]" /> <span>Dedicated Account Manager</span></div>
                              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#c19a6b]" /> <span>Full Core Integration API</span></div>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => alert("Pro Plan requested. Opening secure node configuration.")}
                          className="w-full py-3 bg-gradient-to-r from-[#c19a6b] to-[#a37c4c] text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl hover:brightness-110 transition shadow-md shadow-[#c19a6b]/20"
                        >
                          Launch Pro Cockpit
                        </button>
                      </div>
                    </div>

                    {/* PLAN 3: ENTERPRISE */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
                      <div className="bg-[#101e35] text-white p-5 text-center">
                        <span className="font-mono text-xs uppercase tracking-widest font-extrabold">ENTERPRISE</span>
                      </div>
                      <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4 text-center">
                          <div className="text-4xl font-serif font-bold text-slate-900">
                            Custom
                          </div>
                          <div className="h-[1px] bg-slate-100" />
                          <div className="space-y-3.5 text-left">
                            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">Exclusive features</span>
                            <div className="space-y-2.5 text-xs text-slate-600">
                              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#101e35]" /> <span>Custom Sovereign Cloud Relays</span></div>
                              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#101e35]" /> <span>Complete White Labeling Option</span></div>
                              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#101e35]" /> <span>24/7 Priority Emergency Steward</span></div>
                              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#101e35]" /> <span>On-site cryptographic training</span></div>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            setActiveSection('contact');
                            const el = document.getElementById('contact');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full py-3 bg-[#c19a6b] hover:bg-[#7c5a30] text-slate-950 font-mono text-[10px] uppercase font-extrabold tracking-wider rounded-xl transition"
                        >
                          Contact Sales
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* SCREEN 3: CYBERSECURITY & COMPLIANCE (Deep Blue/Black node mesh style) */}
              {activeCockpit === 'cyber' && (
                <div className="bg-gradient-to-b from-[#060b18] via-[#02050e] to-[#010207] p-8 md:p-12 space-y-10 relative overflow-hidden">
                  
                  {/* Tech circuit lines graphic */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <line x1="10%" y1="20%" x2="90%" y2="20%" stroke="#3b82f6" strokeWidth="2" />
                      <line x1="30%" y1="10%" x2="30%" y2="80%" stroke="#3b82f6" strokeWidth="2" />
                      <circle cx="30%" cy="20%" r="6" fill="#3b82f6" />
                      <circle cx="70%" cy="20%" r="6" fill="#3b82f6" />
                    </svg>
                  </div>

                  <div className="text-center space-y-3 relative z-10">
                    <span className="text-blue-500 font-mono text-[10px] tracking-widest uppercase font-extrabold block">
                      SECURE HARDWARE LEDGER & CRYPTO VAULT
                    </span>
                    <h3 className="text-3xl font-serif font-bold text-slate-100 tracking-tight">
                      Cybersecurity & Compliance Standards
                    </h3>
                    <p className="text-xs text-slate-400 font-light max-w-2xl mx-auto">
                      Uncompromising security for the world's most exclusive destinations. Your data, protected.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative z-10">
                    
                    {/* Feature 1: E2EE */}
                    <div className="bg-blue-950/20 border border-blue-900/30 p-6 rounded-2xl text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                        <Lock className="w-5 h-5 animate-pulse" />
                      </div>
                      <h4 className="font-serif font-bold text-slate-200">End-to-End Encryption (E2EE)</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                        All communications and data transfers are secured with military-grade 256-bit AES encryption, ensuring complete confidentiality.
                      </p>
                    </div>

                    {/* Feature 2: GDPR */}
                    <div className="bg-blue-950/20 border border-blue-900/30 p-6 rounded-2xl text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-[#c19a6b]">
                        <Crown className="w-5 h-5" />
                      </div>
                      <h4 className="font-serif font-bold text-slate-200">GDPR Compliance & Privacy</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                        Fully compliant with General Data Protection Regulation, giving you complete control and transparency over guest data.
                      </p>
                    </div>

                    {/* Feature 3: Data Sovereignty */}
                    <div className="bg-blue-950/20 border border-blue-900/30 p-6 rounded-2xl text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-emerald-400">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h4 className="font-serif font-bold text-slate-200">Data Sovereignty & Residency</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                        Data is stored in sovereign, redundant data centers aligned with your operational jurisdiction, avoiding external audits.
                      </p>
                    </div>

                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 relative z-10">
                    <button 
                      onClick={() => alert("Downloading secure whitepaper... SHA-256 Checksum: 0x8f2d...")}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-[10px] uppercase font-bold py-3 px-6 rounded-xl transition"
                    >
                      Request Security Whitepaper
                    </button>
                    <button 
                      onClick={() => {
                        setActiveSection('contact');
                        const el = document.getElementById('contact');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="border border-white/20 hover:border-white/40 text-slate-300 hover:text-white font-mono text-[10px] uppercase font-bold py-3 px-6 rounded-xl transition"
                    >
                      Schedule Consultation
                    </button>
                  </div>

                </div>
              )}

              {/* SCREEN 4: PRESTIGE CLIENT TESTIMONIALS (With elegant gold profiles and wave chart background) */}
              {activeCockpit === 'testimonials' && (
                <div className="bg-[#04060c] p-8 md:p-12 space-y-10 relative overflow-hidden">
                  
                  {/* Glowing Bezier Grid representation */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      {/* Grid Lines */}
                      <line x1="0%" y1="30%" x2="100%" y2="30%" stroke="#c19a6b" strokeWidth="0.5" strokeDasharray="3,3" />
                      <line x1="0%" y1="70%" x2="100%" y2="70%" stroke="#c19a6b" strokeWidth="0.5" strokeDasharray="3,3" />
                      <line x1="33%" y1="0%" x2="33%" y2="100%" stroke="#c19a6b" strokeWidth="0.5" strokeDasharray="3,3" />
                      <line x1="66%" y1="0%" x2="66%" y2="100%" stroke="#c19a6b" strokeWidth="0.5" strokeDasharray="3,3" />
                      {/* Smooth wave representing guest retention */}
                      <path d="M 0 250 C 150 100, 300 300, 450 150 C 600 50, 750 350, 1000 180" fill="none" stroke="#dfb175" strokeWidth="2.5" />
                      <path d="M 0 300 C 180 200, 350 400, 550 100 C 750 20, 850 280, 1000 220" fill="none" stroke="#2563eb" strokeWidth="1.5" />
                      
                      {/* Glowing points */}
                      <circle cx="330" cy="270" r="5" fill="#dfb175" />
                      <circle cx="650" cy="90" r="5" fill="#dfb175" />
                    </svg>
                  </div>

                  <div className="text-center space-y-3 relative z-10">
                    <span className="text-[#c19a6b] font-mono text-[10px] tracking-widest uppercase font-bold block">
                      ORCHESTRATING SUPREME COMFORT
                    </span>
                    <h3 className="text-3xl font-serif font-bold text-slate-100 tracking-tight">
                      Prestige Client Testimonials
                    </h3>
                    <p className="text-xs text-slate-400 font-light max-w-xl mx-auto">
                      Zaphir: High-end SaaS Command Center for Luxury Hotels and Private Clubs
                    </p>
                  </div>

                  {/* 3 Gold profile cards arranged in timeline format */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 max-w-5xl mx-auto relative z-10">
                    
                    {[
                      {
                        name: 'Alessandro Rossi',
                        role: 'Palace Director, The Grand Venetian Hotel',
                        quote: "Zaphir's seamless integration has revolutionized our guest experience, anticipating needs we never knew existed. It is truly indispensable for our operations.",
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                        stat: '+15% Revenue per Occupied Room'
                      },
                      {
                        name: 'Sophia Chen',
                        role: 'VIP Manager, The Peninsula Hong Kong',
                        quote: "The efficiency gains in our staff coordination have been remarkable. We've seen a +28% increase in wine cellar sales thanks to personalized guest insights.",
                        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
                        stat: '+22% Guest Retention rate registered'
                      },
                      {
                        name: 'Julian Croft',
                        role: 'General Manager, The Mayfair Club, London',
                        quote: "Our private club members expect the highest level of personalized service, and Zaphir delivers. The data-driven insights have enhanced our loyalty programs significantly.",
                        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
                        stat: 'Sovereign Clearance Status L5'
                      }
                    ].map((user, idx) => (
                      <div key={idx} className="bg-[#0b0f19]/80 border border-[#c19a6b]/20 p-6 rounded-2xl space-y-4 relative flex flex-col justify-between">
                        
                        {/* Floating stat tag matching image */}
                        <div className="absolute -top-3.5 left-6 bg-[#c19a6b]/20 text-[#dfb175] text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border border-[#c19a6b]/30">
                          {user.stat}
                        </div>

                        <div className="space-y-4 pt-2">
                          <p className="text-xs text-slate-300 italic font-light leading-relaxed">
                            "{user.quote}"
                          </p>
                        </div>

                        <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                          <div className="relative">
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              className="w-10 h-10 rounded-full border-2 border-[#c19a6b] object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-slate-950 p-0.5 rounded-full">
                              <Crown className="w-2.5 h-2.5 text-[#c19a6b]" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#c19a6b] font-mono">{user.name}</h4>
                            <p className="text-[9px] text-slate-400 font-mono tracking-wide mt-0.5 uppercase">{user.role}</p>
                          </div>
                        </div>

                      </div>
                    ))}

                  </div>
                </div>
              )}

              {/* SCREEN 5: GLOBAL BRAND & ATMOSPHERE CMS (Real-time layout customization) */}
              {activeCockpit === 'cms' && (
                <div className="p-6 md:p-8 bg-gradient-to-b from-[#11131a] to-[#06080d] space-y-6">
                  
                  {/* Simulated real-time preview reflecting user choices! */}
                  <div 
                    className="p-6 rounded-2xl border transition-all duration-300 text-center space-y-4 relative overflow-hidden"
                    style={{
                      borderColor: cmsPalette === 'gold' ? '#c19a6b' : cmsPalette === 'navy' ? '#1e3a8a' : '#4b5563',
                      backgroundColor: cmsPalette === 'gold' ? '#0a0b10' : cmsPalette === 'navy' ? '#050710' : '#0a0d14'
                    }}
                  >
                    {/* Glowing brand watermark */}
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Crown className="w-32 h-32" style={{ color: cmsPalette === 'gold' ? '#c19a6b' : '#3b82f6' }} />
                    </div>

                    <div className="space-y-1 relative z-10">
                      <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-bold" style={{ color: cmsPalette === 'gold' ? '#c19a6b' : '#60a5fa' }}>
                        LIVE CMS RENDER
                      </span>
                      <h4 
                        className="text-2xl font-bold tracking-tight text-slate-100"
                        style={{ fontFamily: cmsSerif ? 'Playfair Display, Georgia, serif' : 'Inter, sans-serif' }}
                      >
                        Global Brand & Atmosphere CMS
                      </h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto font-light">
                        Customize colors, logo formats, and typography settings across all connected guest suites.
                      </p>
                    </div>

                    {/* Logo Variation display */}
                    <div className="flex gap-4 justify-center py-2 relative z-10">
                      <span className="border border-white/5 bg-white/5 py-1 px-4 rounded-xl text-xs font-serif font-bold text-slate-300">
                        ZAPHIR
                      </span>
                      <span className="border border-white/5 bg-white/5 py-1 px-4 rounded-xl text-xs font-sans font-extrabold text-slate-300 tracking-widest">
                        ZAPHIR
                      </span>
                    </div>
                  </div>

                  {/* CMS Control settings board */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Control 1: Color Palettes */}
                    <div className="bg-black/30 border border-white/5 p-5 rounded-xl space-y-3">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Color Palettes</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'gold', label: 'Gold Amber', code: '#c19a6b' },
                          { id: 'navy', label: 'Navy Blue', code: '#1e3a8a' },
                          { id: 'charcoal', label: 'Charcoal', code: '#4b5563' }
                        ].map((pal) => (
                          <button
                            key={pal.id}
                            onClick={() => setCmsPalette(pal.id as any)}
                            className={`p-2.5 rounded-xl border text-center transition ${
                              cmsPalette === pal.id ? 'border-[#c19a6b] bg-white/5' : 'border-white/5'
                            }`}
                          >
                            <div className="w-5 h-5 rounded-full mx-auto mb-1.5" style={{ backgroundColor: pal.code }} />
                            <span className="text-[9px] font-mono text-slate-300">{pal.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Control 2: Typography */}
                    <div className="bg-black/30 border border-white/5 p-5 rounded-xl space-y-4 flex flex-col justify-between">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Custom Typography</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCmsSerif(true)}
                          className={`flex-1 py-3 px-2 rounded-xl border text-center font-serif text-sm transition ${
                            cmsSerif ? 'bg-[#c19a6b]/20 border-[#c19a6b] text-[#c19a6b]' : 'border-white/5 text-slate-400'
                          }`}
                        >
                          Serif (Playfair)
                        </button>
                        <button
                          onClick={() => setCmsSerif(false)}
                          className={`flex-1 py-3 px-2 rounded-xl border text-center font-sans text-sm transition ${
                            !cmsSerif ? 'bg-[#c19a6b]/20 border-[#c19a6b] text-[#c19a6b]' : 'border-white/5 text-slate-400'
                          }`}
                        >
                          Sans-Serif (Inter)
                        </button>
                      </div>
                    </div>

                    {/* Control 3: Sliders */}
                    <div className="bg-black/30 border border-white/5 p-5 rounded-xl space-y-4">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Atmosphere Settings</span>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-mono text-slate-400">
                          <span>AMBIENT DIMMING</span>
                          <span>{cmsSliders}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="100" 
                          value={cmsSliders}
                          onChange={(e) => setCmsSliders(Number(e.target.value))}
                          className="w-full accent-[#c19a6b] bg-slate-800 h-1 rounded"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-mono text-slate-400">
                          <span>HELI-PAD BEACON INTENSITY</span>
                          <span>{cmsUpendions}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={cmsUpendions}
                          onChange={(e) => setCmsUpendions(Number(e.target.value))}
                          className="w-full accent-[#c19a6b] bg-slate-800 h-1 rounded"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* SCREEN 6: EXECUTIVE REVENUE & RevPAR ANALYTICS (Pôle Business) */}
              {activeCockpit === 'business' && (
                <div className="p-6 md:p-8 bg-[#0b0e14] space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-slate-100">
                        Executive Revenue & RevPAR Analytics (Pôle Business)
                      </h3>
                      <p className="text-[11px] text-slate-400 font-light mt-0.5">
                        Operational intelligence, yield estimations, and live financial ledger graphs.
                      </p>
                    </div>
                    <span className="bg-[#c19a6b]/20 text-[#c19a6b] font-mono text-[9px] font-bold px-2.5 py-1 rounded border border-[#c19a6b]/30">
                      SECURE FIRESTORE SYNC
                    </span>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* ADR Card */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                        <span>ADR (Average Daily Rate)</span>
                        <span className="text-emerald-500">+5.2% YTD</span>
                      </div>
                      <div className="text-2xl font-mono font-extrabold text-slate-100">€950.50</div>
                      <div className="h-10 relative overflow-hidden">
                        {/* Static mini wave SVG representation */}
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                          <path d="M 0 35 Q 25 15, 50 25 T 100 10 T 150 30 T 200 5 L 200 40 L 0 40 Z" fill="rgba(193,154,107,0.1)" stroke="#c19a6b" strokeWidth="1.5" />
                        </svg>
                      </div>
                    </div>

                    {/* RevPAR Card */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                        <span>RevPAR</span>
                        <span className="text-emerald-500">+3.8% YTD</span>
                      </div>
                      <div className="text-2xl font-mono font-extrabold text-slate-100">€825.30</div>
                      {/* Interactive yield estimator gauge */}
                      <div className="pt-2">
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-[#c19a6b] to-emerald-500 h-full w-[82%]" />
                        </div>
                        <span className="text-[8px] font-mono text-slate-500 block text-right mt-1">CAPACITY INDEX: 82%</span>
                      </div>
                    </div>

                    {/* VIP Spend Velocity Card */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                        <span>VIP Spend Velocity</span>
                        <span className="text-blue-400">Stable node</span>
                      </div>
                      <div className="text-2xl font-mono font-extrabold text-slate-100">€12,400 <span className="text-xs font-mono font-normal text-slate-500">/ Guest</span></div>
                      <div className="text-[9px] text-slate-400 font-light pt-2 leading-relaxed">
                        Strong dining, luxury cellars, and heli-service upsells are driving consistent premium margins.
                      </div>
                    </div>

                  </div>

                  {/* Big Forecast Chart placeholder */}
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-6 relative">
                    <span className="text-[9px] font-mono text-slate-500 block mb-3 uppercase">Forecast: Upcoming High-Value Bookings</span>
                    <div className="h-40 flex items-end justify-between gap-1 relative z-10">
                      {[
                        { label: 'Jan', val: '€1.2M' },
                        { label: 'Feb', val: '€1.5M' },
                        { label: 'Mar', val: '€2.3M' },
                        { label: 'Apr', val: '€2.8M' },
                        { label: 'May', val: '€4.2M' },
                        { label: 'Jun', val: '€3.9M' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                          <span className="text-[8px] font-mono text-[#c19a6b] opacity-0 group-hover:opacity-100 transition duration-200">
                            {item.val}
                          </span>
                          <div 
                            className="w-full bg-gradient-to-t from-[#c19a6b]/20 to-[#c19a6b]/70 hover:brightness-125 rounded-t transition-all duration-500" 
                            style={{ height: `${(parseFloat(item.val.replace('€', '')) / 5) * 120}px` }}
                          />
                          <span className="text-[9px] font-mono text-slate-500">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 7: YACHTING EDITION (L'art de la navigation de luxe) */}
              {activeCockpit === 'yachting' && (
                <div className="p-6 md:p-8 bg-gradient-to-b from-[#0a1122] to-[#04060c] space-y-6">
                  <div className="text-center space-y-2">
                    <span className="text-[#c19a6b] font-mono text-[10px] tracking-[0.25em] uppercase font-bold block">
                      ZAPHIR YACHTING SYSTEM
                    </span>
                    <h3 className="text-3xl font-serif text-slate-100 font-bold tracking-tight">
                      L'art de la navigation de luxe, piloté en temps réel
                    </h3>
                    <p className="text-xs text-slate-400 font-light max-w-xl mx-auto">
                      Zaphir: Le centre de commandement ultime pour les superyachts et navires privés d'exception.
                    </p>
                  </div>

                  {/* Superyacht custom blueprint mock */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    
                    {/* On-board Inventory */}
                    <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-4 col-span-1">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase border-b border-white/5 pb-1">
                        ON-BOARD INVENTORY
                      </span>
                      {[
                        { item: 'Caviar (Deetra)', qty: '24 tins', val: 'Optimal' },
                        { item: 'Champagne (Vintage)', qty: '48 bottles', val: 'Refill requested' },
                        { item: 'Truffles', qty: '2.5 kg', val: 'Optimal' },
                        { item: 'Fine Wines (Margaux)', qty: '12 bottles', val: 'Critical alert' }
                      ].map((inv, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-slate-300">
                            <span>{inv.item}</span>
                            <span className="text-[#c19a6b] font-bold">{inv.qty}</span>
                          </div>
                          <span className="text-[8px] font-mono text-slate-500 block uppercase">{inv.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Central 3D Map View */}
                    <div className="bg-black/40 border border-white/5 rounded-xl p-4 col-span-2 relative flex flex-col justify-between min-h-[220px]">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Superyacht Path & Nautical Chart</span>
                      
                      {/* World map stylized coordinates */}
                      <div className="my-auto relative h-28 border border-white/5 bg-slate-950/60 rounded-lg flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                        <div className="absolute font-mono text-[8px] text-slate-600 top-2 left-2">LAT: 43.7034° N</div>
                        <div className="absolute font-mono text-[8px] text-slate-600 bottom-2 right-2">LON: 7.2661° E (Nice Port)</div>
                        
                        {/* Stylized Superyacht Line */}
                        <svg className="w-4/5 h-3/4" xmlns="http://www.w3.org/2000/svg">
                          <path d="M 10 70 C 50 20, 120 10, 220 50" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="4,4" />
                          <polygon points="220,50 210,45 215,55" fill="#2563eb" />
                          <circle cx="10" cy="70" r="4" fill="#c19a6b" />
                          <circle cx="220" cy="50" r="4" fill="#10b981" />
                        </svg>
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 pt-2 border-t border-white/5">
                        <span>Speed: 18.4 Knots</span>
                        <span>Sea Temp: 22.8°C</span>
                      </div>
                    </div>

                    {/* Crew Assignment */}
                    <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-4 col-span-1">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase border-b border-white/5 pb-1">
                        CREW ASSIGNMENTS
                      </span>
                      {[
                        { role: 'Captain', name: 'Jean-Marc', status: 'On Duty' },
                        { role: 'Chef', name: 'Greta', status: 'Kitchen Node' },
                        { role: 'Steward', name: 'Lars', status: 'Assigned to Suite 1' },
                        { role: 'Sommelier', name: 'Alexandre', status: 'Private Cellar' }
                      ].map((crew, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] font-mono">
                          <div>
                            <span className="text-[#c19a6b] font-bold block">{crew.role}</span>
                            <span className="text-slate-400 font-light">{crew.name}</span>
                          </div>
                          <span className="text-[9px] bg-[#c19a6b]/10 text-[#c19a6b] border border-[#c19a6b]/20 px-1.5 py-0.5 rounded uppercase">
                            {crew.status}
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}

              {/* SCREEN 8: STAFF MOVEMENT HEATMAP & LOGISTICS */}
              {activeCockpit === 'heatmap' && (
                <div className="p-6 md:p-8 bg-[#04060c] space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="font-serif text-2xl text-slate-100 font-bold">
                      Optimisation en Temps Réel des Flux et de la Logistique du Personnel
                    </h3>
                    <p className="text-xs text-slate-400 font-light">
                      Zaphir: Command Center - Heatmap des Mouvements et Tâches
                    </p>
                  </div>

                  {/* Grid showing heatmap statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                    {/* Efficiency Score widget */}
                    <div className="bg-gradient-to-b from-[#e5c59e]/15 to-[#c19a6b]/5 border border-[#c19a6b]/30 p-5 rounded-2xl text-center space-y-2 shadow-sm">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Efficiency Score</span>
                      <div className="text-3xl font-mono font-extrabold text-[#c19a6b]">94%</div>
                      <p className="text-[9px] text-slate-500 font-light">Staff allocation optimized according to guest requests.</p>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-5 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Tâches en cours</span>
                      <div className="text-2xl font-mono font-bold text-slate-100">124</div>
                      <span className="text-[8px] font-mono text-emerald-500">Normal workload</span>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-5 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Tâches clôturées</span>
                      <div className="text-2xl font-mono font-bold text-slate-100">135</div>
                      <span className="text-[8px] font-mono text-slate-500">Last 24h</span>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-5 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Temps moyen de réponse</span>
                      <div className="text-2xl font-mono font-bold text-slate-100">2.5 min</div>
                      <span className="text-[8px] font-mono text-emerald-500">Perfect range</span>
                    </div>

                  </div>

                  {/* Map grid simulation */}
                  <div className="bg-black/50 border border-white/15 p-4 rounded-2xl relative h-56 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                    <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500">FLOOR 2 - ACTIVE STAFF HEATMAP TRACKING</div>
                    
                    {/* Active blueprint path representation */}
                    <div className="relative w-5/6 h-5/6 border border-white/5 bg-slate-950/80 rounded-xl p-4 flex flex-col justify-between font-mono text-[10px]">
                      <div className="flex justify-between">
                        <div className={`p-2 border rounded-lg transition-all ${selectedHeatmapZone === 'suite' ? 'border-[#c19a6b] bg-[#c19a6b]/10' : 'border-white/5'}`}>
                          <span>Suites Node 👑</span>
                          <span className="text-[8px] block text-emerald-400">4 Staff Active</span>
                        </div>
                        <div className={`p-2 border rounded-lg transition-all ${selectedHeatmapZone === 'lobby' ? 'border-[#c19a6b] bg-[#c19a6b]/10' : 'border-white/5'}`}>
                          <span>Grand Lobby 🏛️</span>
                          <span className="text-[8px] block text-amber-500">2 Staff Active</span>
                        </div>
                      </div>

                      {/* Interactive selector */}
                      <div className="flex gap-2 justify-center py-2">
                        {(['suite', 'lobby', 'spa'] as const).map((zone) => (
                          <button
                            key={zone}
                            onClick={() => setSelectedHeatmapZone(zone)}
                            className={`px-3 py-1 text-[9px] rounded-lg transition ${
                              selectedHeatmapZone === zone ? 'bg-[#c19a6b] text-slate-950 font-bold' : 'bg-white/5 text-slate-400'
                            }`}
                          >
                            Select {zone.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-between text-[8px] text-slate-500">
                        <span>Liaisons: HELIPORT_SYNC</span>
                        <span>Secure Ledger Active</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* SCREEN 9: PREMIUM MEMBERSHIP CONFIGURATOR (Platinum, Gold, Onyx physical card models) */}
              {activeCockpit === 'cards' && (
                <div className="p-6 md:p-8 bg-[#0a0d14] space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="font-serif text-2xl text-slate-100 font-bold">
                      Outil de Configuration des Adhésions Premium
                    </h3>
                    <p className="text-xs text-slate-400 font-light">
                      Concevez et gérez les niveaux d'adhésion exclusifs pour votre établissement.
                    </p>
                  </div>

                  {/* Vertical metal cards layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-4">
                    
                    {/* CARD 1: PLATINUM */}
                    <div className="bg-gradient-to-b from-[#e5e7eb] via-[#9ca3af] to-[#374151] p-6 rounded-2xl border border-slate-300 text-slate-950 space-y-6 shadow-xl flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <Crown className="w-6 h-6 text-slate-900" />
                          <span className="font-mono text-[9px] font-bold uppercase tracking-widest bg-white/40 px-2 py-0.5 rounded border border-white/50">
                            PLATINUM CARD
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="font-serif text-xl font-extrabold tracking-wider">ZAPHIR</div>
                          <div className="font-mono text-[9px] uppercase tracking-widest text-slate-700">EXCLUSIVE MEMBERSHIP</div>
                        </div>
                      </div>

                      <div className="space-y-3.5 border-t border-slate-900/10 pt-4 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px]">Concierge Privée</span>
                          <input 
                            type="checkbox" 
                            checked={platinumConcierge}
                            onChange={(e) => setPlatinumConcierge(e.target.checked)}
                            className="accent-slate-950 cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px]">Accès SPA Illimité</span>
                          <input 
                            type="checkbox" 
                            checked={platinumSpa}
                            onChange={(e) => setPlatinumSpa(e.target.checked)}
                            className="accent-slate-950 cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px]">Accès Hôte Hautement</span>
                          <input 
                            type="checkbox" 
                            checked={platinumHost}
                            onChange={(e) => setPlatinumHost(e.target.checked)}
                            className="accent-slate-950 cursor-pointer"
                          />
                        </div>

                        {/* Annual fee selector */}
                        <div className="pt-2">
                          <label className="text-[9px] font-mono text-slate-800 uppercase block mb-1">FRAIS ANNUELS</label>
                          <select 
                            value={platinumFee}
                            onChange={(e) => setPlatinumFee(e.target.value)}
                            className="w-full bg-white/60 border border-slate-400 rounded p-1 text-[10px] font-mono focus:outline-none"
                          >
                            <option value="50000">€50,000</option>
                            <option value="75000">€75,000</option>
                            <option value="100000">€100,000</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* CARD 2: GOLD */}
                    <div className="bg-gradient-to-b from-[#fcd34d] via-[#d97706] to-[#78350f] p-6 rounded-2xl border border-amber-500 text-slate-950 space-y-6 shadow-xl flex flex-col justify-between scale-102">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <Crown className="w-6 h-6 text-slate-900" />
                          <span className="font-mono text-[9px] font-bold uppercase tracking-widest bg-white/40 px-2 py-0.5 rounded border border-white/50">
                            GOLD CARD
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="font-serif text-xl font-extrabold tracking-wider">ZAPHIR</div>
                          <div className="font-mono text-[9px] uppercase tracking-widest text-amber-950">EXCLUSIVE MEMBERSHIP</div>
                        </div>
                      </div>

                      <div className="space-y-3.5 border-t border-amber-950/10 pt-4 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px]">Concierge Privée</span>
                          <input 
                            type="checkbox" 
                            checked={goldConcierge}
                            onChange={(e) => setGoldConcierge(e.target.checked)}
                            className="accent-amber-950 cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px]">Accès SPA Illimité</span>
                          <input 
                            type="checkbox" 
                            checked={goldSpa}
                            onChange={(e) => setGoldSpa(e.target.checked)}
                            className="accent-amber-950 cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px]">Accès Hôte Hautement</span>
                          <input 
                            type="checkbox" 
                            checked={goldHost}
                            onChange={(e) => setGoldHost(e.target.checked)}
                            className="accent-amber-950 cursor-pointer"
                          />
                        </div>

                        {/* Annual fee selector */}
                        <div className="pt-2">
                          <label className="text-[9px] font-mono text-amber-900 uppercase block mb-1">FRAIS ANNUELS</label>
                          <select 
                            value={goldFee}
                            onChange={(e) => setGoldFee(e.target.value)}
                            className="w-full bg-white/60 border border-amber-600 rounded p-1 text-[10px] font-mono focus:outline-none"
                          >
                            <option value="25000">€25,000</option>
                            <option value="35000">€35,000</option>
                            <option value="45000">€45,000</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* CARD 3: ONYX */}
                    <div className="bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] p-6 rounded-2xl border border-slate-700 text-slate-100 space-y-6 shadow-xl flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <Crown className="w-6 h-6 text-[#c19a6b]" />
                          <span className="font-mono text-[9px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded border border-white/20">
                            ONYX CARD
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="font-serif text-xl font-extrabold tracking-wider text-[#c19a6b]">ZAPHIR</div>
                          <div className="font-mono text-[9px] uppercase tracking-widest text-[#c19a6b]">EXCLUSIVE MEMBERSHIP</div>
                        </div>
                      </div>

                      <div className="space-y-3.5 border-t border-white/5 pt-4 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px]">Concierge Privée</span>
                          <input 
                            type="checkbox" 
                            checked={onyxConcierge}
                            onChange={(e) => setOnyxConcierge(e.target.checked)}
                            className="accent-[#c19a6b] cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px]">Accès SPA Illimité</span>
                          <input 
                            type="checkbox" 
                            checked={onyxSpa}
                            onChange={(e) => setOnyxSpa(e.target.checked)}
                            className="accent-[#c19a6b] cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px]">Accès Hôte Hautement</span>
                          <input 
                            type="checkbox" 
                            checked={onyxHost}
                            onChange={(e) => setOnyxHost(e.target.checked)}
                            className="accent-[#c19a6b] cursor-pointer"
                          />
                        </div>

                        {/* Annual fee selector */}
                        <div className="pt-2">
                          <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">FRAIS ANNUELS</label>
                          <select 
                            value={onyxFee}
                            onChange={(e) => setOnyxFee(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded p-1 text-[10px] font-mono focus:outline-none"
                          >
                            <option value="10000">€10,000</option>
                            <option value="15000">€15,000</option>
                            <option value="20000">€20,000</option>
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Save button matching image */}
                  <div className="text-center pt-4">
                    <button 
                      onClick={() => {
                        confetti({ particleCount: 60, spread: 50 });
                        alert("Configuration saved securely! Active memberships updated in physical card production ledger.");
                      }}
                      className="bg-gradient-to-r from-[#c19a6b] via-[#dfb175] to-[#c19a6b] text-slate-950 font-mono text-xs uppercase font-extrabold tracking-widest py-3.5 px-8 rounded-xl hover:shadow-[0_0_20px_rgba(193,154,107,0.3)] transition"
                    >
                      Sauvegarder la Configuration
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN 10: SMART BUILDING ENERGY MONITOR */}
              {activeCockpit === 'energy' && (
                <div className="p-6 md:p-8 bg-[#04060d] space-y-8 relative overflow-hidden">
                  <div className="text-center space-y-2">
                    <h3 className="font-serif text-2xl text-slate-100 font-bold tracking-tight">
                      Smart Building Energy Monitor
                    </h3>
                    <p className="text-xs text-emerald-500 font-mono">
                      Sustainability Dashboard: Real-time efficiency & carbon footprint.
                    </p>
                  </div>

                  {/* 3 GAUGES BAR */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-2">
                    
                    {/* GAUGE 1: HVAC Load */}
                    <div className="bg-[#0b0e14]/90 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center space-y-3 shadow-lg">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">HVAC Load</span>
                      <div className="relative w-32 h-20 flex items-end justify-center overflow-hidden">
                        {/* Semi-circle Gauge */}
                        <svg className="w-full h-full" viewBox="0 0 100 50">
                          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
                          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#10b981" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(energyHvacLoad / 100) * 125} 125`} />
                          {/* Needle */}
                          <line x1="50" y1="50" x2={50 + 35 * Math.cos((Math.PI * (energyHvacLoad - 100)) / 100)} y2={50 + 35 * Math.sin((Math.PI * (energyHvacLoad - 100)) / 100)} stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="50" cy="50" r="5" fill="#fcd34d" />
                        </svg>
                        <div className="absolute bottom-0 text-center">
                          <span className="text-xl font-mono font-bold text-slate-100">{energyHvacLoad}%</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400">High Efficiency Mode Active</span>
                      <input 
                        type="range" 
                        min="20" 
                        max="100" 
                        value={energyHvacLoad} 
                        onChange={(e) => setEnergyHvacLoad(Number(e.target.value))} 
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10b981] mt-2"
                      />
                    </div>

                    {/* GAUGE 2: Water Usage */}
                    <div className="bg-[#0b0e14]/90 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center space-y-3 shadow-lg">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Water Usage</span>
                      <div className="relative w-32 h-20 flex items-end justify-center overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 100 50">
                          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
                          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#06b6d4" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(energyWaterUsage / 2000) * 125} 125`} />
                          <line x1="50" y1="50" x2={50 + 35 * Math.cos((Math.PI * ((energyWaterUsage/20) - 100)) / 100)} y2={50 + 35 * Math.sin((Math.PI * ((energyWaterUsage/20) - 100)) / 100)} stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="50" cy="50" r="5" fill="#fcd34d" />
                        </svg>
                        <div className="absolute bottom-0 text-center">
                          <span className="text-xl font-mono font-bold text-slate-100">{energyWaterUsage}L</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-cyan-400">Below Target (-15%)</span>
                      <input 
                        type="range" 
                        min="300" 
                        max="2000" 
                        value={energyWaterUsage} 
                        onChange={(e) => setEnergyWaterUsage(Number(e.target.value))} 
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#06b6d4] mt-2"
                      />
                    </div>

                    {/* GAUGE 3: Renewable Production */}
                    <div className="bg-[#0b0e14]/90 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center space-y-3 shadow-lg">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Renewable Production</span>
                      <div className="relative w-32 h-20 flex items-end justify-center overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 100 50">
                          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
                          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#fbbf24" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(energyProduction / 8000) * 125} 125`} />
                          <line x1="50" y1="50" x2={50 + 35 * Math.cos((Math.PI * ((energyProduction/80) - 100)) / 100)} y2={50 + 35 * Math.sin((Math.PI * ((energyProduction/80) - 100)) / 100)} stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="50" cy="50" r="5" fill="#fcd34d" />
                        </svg>
                        <div className="absolute bottom-0 text-center">
                          <span className="text-xl font-mono font-bold text-slate-100">{energyProduction} kWh</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-amber-400">Above Average (+24%)</span>
                      <input 
                        type="range" 
                        min="1000" 
                        max="8000" 
                        value={energyProduction} 
                        onChange={(e) => setEnergyProduction(Number(e.target.value))} 
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#fbbf24] mt-2"
                      />
                    </div>

                  </div>

                  {/* TABLET VIEW SECTION */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center pt-2 max-w-5xl mx-auto">
                    
                    {/* Left stats */}
                    <div className="space-y-4">
                      <div className="bg-[#0b0e14] border border-white/5 p-4 rounded-xl space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Carbon Offset</span>
                        <div className="text-2xl font-mono font-bold text-emerald-400">
                          {Math.round(120 + (energyProduction - 4500)/80 - (energyHvacLoad - 75)/4)} tons
                        </div>
                        <span className="text-[8px] font-mono text-slate-500">Optimized via solar grid</span>
                      </div>

                      <div className="bg-[#0b0e14] border border-white/5 p-4 rounded-xl space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Energy Savings</span>
                        <div className="text-2xl font-mono font-bold text-slate-100">
                          ${(5000 + (energyProduction - 4500)*0.85 + (75 - energyHvacLoad)*65).toLocaleString('en-US', {maximumFractionDigits:0})}
                        </div>
                        <span className="text-[8px] font-mono text-emerald-500">Daily dynamic savings yield</span>
                      </div>
                    </div>

                    {/* Central Tablet with 3D floorplan representation */}
                    <div className="lg:col-span-2 bg-[#090b10] border border-emerald-500/20 rounded-2xl p-4 relative h-72 overflow-hidden flex flex-col justify-between shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-5" />
                      <div className="flex justify-between items-center z-10">
                        <span className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          FLOORPLAN ENERGY DISSIPATION
                        </span>
                        <span className="text-[8px] font-mono text-slate-400">ACTIVE CONTROLS</span>
                      </div>

                      {/* Perspective grid drawing the floorplan */}
                      <div className="relative w-full h-44 flex items-center justify-center">
                        <div className="w-5/6 h-5/6 border border-emerald-500/10 bg-slate-950/90 rounded-xl p-3 flex flex-col justify-between font-mono text-[9px] relative [transform:rotateX(20deg)_rotateY(-10deg)] shadow-2xl">
                          <div className="absolute inset-0 border border-emerald-500/20 rounded-xl pointer-events-none animate-pulse" />
                          <div className="flex justify-between items-start">
                            <div className="border border-emerald-500/30 bg-emerald-950/30 p-2 rounded-lg text-left">
                              <span className="text-[8px] block text-slate-400 uppercase font-bold">VIP Suite Room 101</span>
                              <span className="text-emerald-400 font-mono">HVAC: Active (21.5°C)</span>
                            </div>
                            <div className="border border-emerald-500/10 bg-slate-900/60 p-2 rounded-lg text-left">
                              <span className="text-[8px] block text-slate-400 uppercase font-bold">Wellness Spa Lounge</span>
                              <span className="text-emerald-500 font-mono">Humidity: 55% (Targeted)</span>
                            </div>
                          </div>
                          
                          {/* Pulsing connections */}
                          <div className="flex justify-center my-1">
                            <svg className="w-32 h-12" viewBox="0 0 100 30">
                              <path d="M 10 15 Q 50 -10 90 15" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" className="animate-[dash_10s_linear_infinite]" />
                              <circle cx="10" cy="15" r="3" fill="#10b981" />
                              <circle cx="90" cy="15" r="3" fill="#10b981" />
                              <circle cx="50" cy="3" r="4" fill="#fbbf24" className="animate-ping" />
                            </svg>
                          </div>

                          <div className="flex justify-between items-end text-slate-500 text-[8px]">
                            <span>Solar Battery Status: 85%</span>
                            <span className="text-emerald-400">Z-Grid Node Sync</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 z-10">
                        <span>Liaisons: SOLAR_CELL_V4</span>
                        <span>Grid Status: Sovereign Autonomous</span>
                      </div>
                    </div>

                    {/* Right stats */}
                    <div className="space-y-4">
                      <div className="bg-[#0b0e14] border border-white/5 p-4 rounded-xl space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Solar Output</span>
                        <div className="text-2xl font-mono font-bold text-amber-400">
                          {Math.round(energyProduction / 300)}%
                        </div>
                        <span className="text-[8px] font-mono text-slate-500">Active solar radiation index</span>
                      </div>

                      <button
                        onClick={() => setEnergyReportOpen(!energyReportOpen)}
                        className="w-full bg-gradient-to-r from-emerald-500/10 to-teal-500/5 hover:from-emerald-500/20 hover:to-teal-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] uppercase font-bold tracking-widest py-3.5 px-4 rounded-xl transition"
                      >
                        {energyReportOpen ? "Hide Sustainability Report" : "View Full Report"}
                      </button>
                    </div>

                  </div>

                  {/* REPORT LIGHTBOX / EXPANSION MODAL */}
                  {energyReportOpen && (
                    <div className="mt-6 bg-[#090b11] border border-emerald-500/30 p-6 rounded-2xl space-y-4 max-w-4xl mx-auto text-left animate-fade-in">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-emerald-500" />
                          <h4 className="font-serif text-sm font-bold text-slate-100">SOVEREIGN TECH SENSORS DETAILED METRICS</h4>
                        </div>
                        <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                          ENCRYPTED LEDGER #EN-8849
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                          <span className="text-[8px] text-slate-500 block">GRID AUTONOMY LEVEL</span>
                          <span className="text-slate-200 font-bold">98.4% (Sovereign)</span>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                          <span className="text-[8px] text-slate-500 block">PEAK DEMAND CAP</span>
                          <span className="text-slate-200 font-bold">210 kW (Below Cap)</span>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                          <span className="text-[8px] text-slate-500 block">WIND TURBINES SPEED</span>
                          <span className="text-slate-200 font-bold">12.4 knots (Normal)</span>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                          <span className="text-[8px] text-slate-500 block">THERMAL EXCHANGE RATIO</span>
                          <span className="text-slate-200 font-bold">1:4.2 (Highly Efficient)</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                        Notice: Water sensor node reports average daily consumption has dropped by 15% due to automatic greywater recovery protocols on the east-wing garden sprinkler system. HVAC loads are automatically managed based on active room check-ins.
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* SCREEN 11: CRISIS CENTER & EMERGENCY PROTOCOL */}
              {activeCockpit === 'emergency' && (
                <div className={`p-6 md:p-8 space-y-8 relative overflow-hidden transition-all duration-700 ${emergencyActive ? 'bg-[#180303] border-red-900' : 'bg-[#0d0303]'}`}>
                  
                  {/* Flashing ambient effect if active */}
                  {emergencyActive && (
                    <div className="absolute inset-0 bg-red-950/10 pointer-events-none animate-[pulse_1.5s_infinite]" />
                  )}

                  <div className="text-center space-y-3 relative z-10">
                    <span className="bg-red-500/10 text-red-500 font-mono text-[9px] font-bold px-3 py-1 rounded-full border border-red-500/30 uppercase tracking-widest inline-flex items-center gap-1.5 animate-pulse">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                      CRISIS CENTER & EMERGENCY PROTOCOL
                    </span>
                    <h3 className="font-serif text-3xl text-slate-100 font-extrabold tracking-wide uppercase">
                      LOCKDOWN IMMINENT: <span className="font-mono text-red-500 tracking-widest">{lockdownTimer}</span>
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xl mx-auto font-light">
                      Zaphir: Le centre de commandement ultime pour les hôtels et clubs privés d'exception.
                    </p>
                  </div>

                  {/* ACTIVE EMERGENCY TOGGLE BUTTON */}
                  <div className="text-center relative z-10">
                    <button
                      onClick={() => {
                        setEmergencyActive(!emergencyActive);
                        if (!emergencyActive) {
                          confetti({ particleCount: 30, colors: ['#ff0000', '#7f0000'], spread: 30 });
                        }
                      }}
                      className={`py-4 px-10 rounded-full font-mono text-xs uppercase font-extrabold tracking-widest transition-all duration-300 shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:scale-105 ${
                        emergencyActive 
                          ? 'bg-slate-200 text-red-950 border-2 border-red-500 animate-pulse hover:bg-white'
                          : 'bg-gradient-to-r from-red-600 to-red-900 text-white border border-red-500/30 hover:brightness-110'
                      }`}
                    >
                      {emergencyActive ? "DEACTIVATE SECURITY PROTOCOL (RESET)" : "ACTIVATE SECURITY PROTOCOL"}
                    </button>
                  </div>

                  {/* EMERGENCY WORKSPACE GRID */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch max-w-5xl mx-auto relative z-10 pt-2">
                    
                    {/* First Responders lists */}
                    <div className="lg:col-span-3 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { id: 'police', title: 'Police / Gendarmerie', phone: '+32 236 3770', type: 'POLICE' },
                          { id: 'fire', title: 'Fire Dept / Sapeurs', phone: '+32 285 3760', type: 'FIRE_DEPT' },
                          { id: 'medical', title: 'Medical / Ambulances', phone: '+32 255 5720', type: 'MEDICAL' }
                        ].map((responder) => {
                          const isConnected = connectedResponders.includes(responder.id);
                          return (
                            <div key={responder.id} className="bg-black/60 border border-red-500/10 p-5 rounded-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
                              <div className="space-y-1 text-left">
                                <span className="text-[8px] font-mono text-red-400 block uppercase">FIRST RESPONDER</span>
                                <h4 className="font-serif text-sm font-bold text-slate-100">{responder.title}</h4>
                                <span className="text-[10px] font-mono text-slate-400 block">{responder.phone}</span>
                              </div>

                              <button
                                onClick={() => {
                                  if (isConnected) {
                                    setConnectedResponders(connectedResponders.filter(id => id !== responder.id));
                                  } else {
                                    setConnectedResponders([...connectedResponders, responder.id]);
                                  }
                                }}
                                className={`w-full py-2 rounded-lg font-mono text-[9px] uppercase font-bold tracking-widest transition flex items-center justify-center gap-1.5 ${
                                  isConnected 
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                                    : 'bg-red-950/40 text-slate-200 border border-red-800/30 hover:bg-red-900/30'
                                }`}
                              >
                                {isConnected ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                    <span>CONNECTED</span>
                                  </>
                                ) : (
                                  <span>CONNECT</span>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Tablet floorplan view showing emergency evacuation routes */}
                      <div className="bg-black/80 border border-red-500/20 rounded-2xl p-5 relative h-64 overflow-hidden flex flex-col justify-between">
                        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-mono text-red-500 uppercase tracking-widest">
                            CRITICAL SECURE ROUTE BLUEPRINTS
                          </span>
                          <span className="text-[8px] font-mono text-slate-500">BIOMETRIC ENGAGEMENTS ACTIVE</span>
                        </div>

                        {/* Interactive Blueprint Vector Routes */}
                        <div className="relative w-full h-40 flex items-center justify-center">
                          <div className="w-11/12 h-5/6 border border-red-500/30 bg-black/90 rounded-xl p-4 flex flex-col justify-between font-mono text-[9px] relative shadow-lg">
                            <div className="absolute inset-0 bg-red-950/10 rounded-xl pointer-events-none animate-pulse" />
                            <div className="flex justify-between items-center">
                              <span className="font-serif font-bold text-[#c19a6b]">ZAPHIR PENTHOUSE EMERGENCY NODE</span>
                              <span className="text-red-500 animate-pulse font-mono uppercase text-[8px] tracking-widest bg-red-950/30 border border-red-800/40 px-2 py-0.5 rounded">
                                EVACUATION ROAD ACTIVE
                              </span>
                            </div>

                            {/* Red path drawing */}
                            <div className="flex justify-center my-1">
                              <svg className="w-full h-16" viewBox="0 0 200 40">
                                <path d="M 10 30 Q 80 -10 120 30 T 190 10" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,5" className="animate-[dash_8s_linear_infinite]" />
                                <circle cx="10" cy="30" r="4" fill="#ef4444" />
                                <circle cx="190" cy="10" r="4" fill="#ef4444" />
                                <path d="M 60 20 L 70 20 L 65 10 Z" fill="#fbbf24" className="animate-bounce" />
                                <text x="75" y="15" fill="#fcd34d" fontSize="6">EVACUATION HUB B</text>
                              </svg>
                            </div>

                            <div className="flex justify-between text-slate-500 text-[8px]">
                              <span>Bio-Locks status: FORCED SECURE CLOSURE</span>
                              <span className="text-red-400">Halon Extinguishers: READY</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Alarm triggers on the right */}
                    <div className="bg-black/60 border border-red-500/10 p-5 rounded-2xl flex flex-col justify-between space-y-4 text-left">
                      <div className="space-y-4">
                        <span className="text-[8px] font-mono text-red-400 block uppercase">SECURE PANIC BUTTONS</span>
                        
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              alert("FIRE ALARM DISPATCHED! Smart bio-locks opened in fire escape corridor node.");
                            }}
                            className="w-full p-4 bg-gradient-to-r from-red-950/50 to-red-900/40 hover:from-red-900 hover:to-red-700 text-red-200 border border-red-500/30 rounded-xl font-mono text-[10px] uppercase font-bold tracking-widest transition flex items-center justify-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            FIRE EMERGENCY
                          </button>

                          <button
                            onClick={() => {
                              alert("MEDICAL EMERGENCY BROADCAST! Executive Helicopter dispatch node alerted.");
                            }}
                            className="w-full p-4 bg-gradient-to-r from-red-950/50 to-red-900/40 hover:from-red-900 hover:to-red-700 text-red-200 border border-red-500/30 rounded-xl font-mono text-[10px] uppercase font-bold tracking-widest transition flex items-center justify-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            MEDICAL CRISIS
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-red-950">
                        <span className="text-[7px] font-mono text-slate-500 uppercase block">ACTIVE SIREN NODE</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className={`w-2.5 h-2.5 rounded-full ${emergencyActive ? 'bg-red-500 animate-ping' : 'bg-slate-700'}`} />
                          <span>Outer Perimeter Locked</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* SCREEN 12: SPA & WELLNESS SCHEDULER */}
              {activeCockpit === 'wellness' && (
                <div className="p-6 md:p-8 bg-[#0a0c10] space-y-6 text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                    <div>
                      <h3 className="font-serif text-2xl text-slate-100 font-bold">
                        Zaphir: The Art of Luxury Wellness Scheduling
                      </h3>
                      <p className="text-xs text-[#c19a6b] font-light mt-1 font-sans">
                        Seamlessly manage high-end spa services, therapist availability, and guest profiles.
                      </p>
                    </div>

                    <button
                      onClick={() => setBookingFormOpen(!bookingFormOpen)}
                      className="bg-gradient-to-r from-[#c19a6b] to-[#a37c4c] text-slate-950 font-mono text-[10px] uppercase font-extrabold tracking-widest py-2 px-5 rounded-xl hover:shadow-[0_0_15px_rgba(193,154,107,0.3)] transition"
                    >
                      {bookingFormOpen ? "Close Booking Panel" : "View Spa Availability & Book"}
                    </button>
                  </div>

                  {/* MAIN COCKPIT SECTION */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Scheduler timeline table */}
                    <div className="lg:col-span-3 bg-black/50 border border-white/5 rounded-2xl p-4 overflow-x-auto">
                      <div className="min-w-[600px] text-xs font-mono">
                        {/* Table Header */}
                        <div className="grid grid-cols-5 border-b border-white/10 pb-3 text-slate-400 font-bold">
                          <div>Time</div>
                          <div>Treatment Room 1 (Gold)</div>
                          <div>Treatment Room 2 (Serenity)</div>
                          <div>Therapist A (Sofia)</div>
                          <div>Therapist B (Marco)</div>
                        </div>

                        {/* Timeline slots */}
                        <div className="space-y-2 pt-3">
                          {wellnessSlots.map((slot) => (
                            <div 
                              key={slot.id} 
                              onClick={() => setSelectedWellnessSlot(slot.id)}
                              className={`grid grid-cols-5 py-3 px-2 rounded-xl transition cursor-pointer border ${
                                selectedWellnessSlot === slot.id 
                                  ? 'bg-gradient-to-b from-[#c19a6b]/20 to-[#a37c4c]/5 border-[#c19a6b]/50' 
                                  : 'bg-white/5 border-transparent hover:bg-white/10'
                              }`}
                            >
                              <div className="font-bold text-slate-200">{slot.time}</div>
                              
                              <div className="col-span-4 grid grid-cols-4 gap-2 items-center">
                                <div className="text-[11px] text-[#c19a6b] font-sans font-medium">
                                  {slot.room === 'Treatment Room 1' ? slot.name : '-'}
                                </div>
                                <div className="text-[11px] text-slate-300 font-sans font-medium">
                                  {slot.room === 'Treatment Room 2' ? slot.name : '-'}
                                </div>
                                <div className="text-[11px] text-slate-400 font-sans font-medium">
                                  {slot.therapist === 'Sofia' ? slot.name : '-'}
                                </div>
                                <div className="text-[11px] text-slate-400 font-sans font-medium">
                                  {slot.therapist === 'Marco' ? slot.name : '-'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Guest Wellness Profile sidebar */}
                    <div className="bg-[#0b0f16] border border-white/5 p-5 rounded-2xl space-y-4">
                      {(() => {
                        const activeSlot = wellnessSlots.find(s => s.id === selectedWellnessSlot) || wellnessSlots[0];
                        return (
                          <div className="space-y-4 font-sans">
                            <div className="space-y-1">
                              <span className="text-[8px] font-mono text-[#c19a6b] block uppercase">GUEST WELLNESS PROFILE</span>
                              <h4 className="font-serif text-lg font-bold text-slate-100">{activeSlot.guest}</h4>
                              <span className="text-[10px] font-mono text-slate-400 block">{activeSlot.time} - {activeSlot.room}</span>
                            </div>

                            <div className="space-y-2 border-t border-white/5 pt-3">
                              <span className="text-[9px] font-mono text-[#c19a6b] block uppercase">Active Treatment</span>
                              <p className="text-xs font-bold text-slate-200">{activeSlot.name}</p>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[9px] font-mono text-slate-400 block uppercase">Therapist Assignment</span>
                              <p className="text-xs text-slate-300">Steward: {activeSlot.therapist}</p>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[9px] font-mono text-slate-400 block uppercase">Preferences</span>
                              <div className="flex flex-wrap gap-1">
                                {activeSlot.notes.includes("pressure") && (
                                  <span className="text-[9px] bg-[#c19a6b]/15 text-[#c19a6b] border border-[#c19a6b]/20 px-2 py-0.5 rounded">High Pressure</span>
                                )}
                                {activeSlot.notes.includes("aromatherapy") && (
                                  <span className="text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-800/20 px-2 py-0.5 rounded">Aromatherapy</span>
                                )}
                                <span className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-white/5">Private Lounge</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[9px] font-mono text-slate-400 block uppercase">Notes</span>
                              <p className="text-[10px] text-slate-400 leading-relaxed bg-black/40 p-2.5 rounded border border-white/5">{activeSlot.notes}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                  </div>

                  {/* REAL BOOKING FORM LIGHTBOX */}
                  {bookingFormOpen && (
                    <div className="mt-6 bg-[#0a0f18]/90 border border-[#c19a6b]/30 p-6 rounded-2xl max-w-4xl mx-auto space-y-4 animate-fade-in relative z-20">
                      <h4 className="font-serif text-sm font-bold text-slate-100 uppercase tracking-widest pb-2 border-b border-white/5 text-[#c19a6b]">
                        Reserve Private Spa Treatment Node
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                        <div className="space-y-1.5">
                          <label className="text-slate-400 text-[10px]">TREATMENT NAME</label>
                          <input 
                            type="text" 
                            value={newWellnessName}
                            onChange={(e) => setNewWellnessName(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-[#c19a6b]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-slate-400 text-[10px]">GUEST FULL NAME</label>
                          <input 
                            type="text" 
                            value={newWellnessGuest}
                            onChange={(e) => setNewWellnessGuest(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-[#c19a6b]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-slate-400 text-[10px]">TIME SLOT</label>
                          <select 
                            value={newWellnessTime}
                            onChange={(e) => setNewWellnessTime(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-300 focus:outline-none"
                          >
                            <option value="03:00 PM">03:00 PM</option>
                            <option value="04:00 PM">04:00 PM</option>
                            <option value="05:30 PM">05:30 PM</option>
                            <option value="07:00 PM">07:00 PM</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div className="space-y-1.5">
                          <label className="text-slate-400 text-[10px]">TREATMENT CABIN / ROOM</label>
                          <select 
                            value={newWellnessRoom}
                            onChange={(e) => setNewWellnessRoom(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-300 focus:outline-none"
                          >
                            <option value="Treatment Room 1">Treatment Room 1 (Gold Leaf Suite)</option>
                            <option value="Treatment Room 2">Treatment Room 2 (Serenity Pod)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-slate-400 text-[10px]">THERAPIST STEWARD</label>
                          <select 
                            value={newWellnessTherapist}
                            onChange={(e) => setNewWellnessTherapist(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-300 focus:outline-none"
                          >
                            <option value="Sofia">Sofia (Aromatherapist L5)</option>
                            <option value="Marco">Marco (Sports Massage L5)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!newWellnessName || !newWellnessGuest) {
                            alert("Please fill name and guest name.");
                            return;
                          }
                          const newSlot = {
                            id: `task_${Date.now()}`,
                            name: newWellnessName,
                            guest: newWellnessGuest,
                            time: newWellnessTime,
                            room: newWellnessRoom,
                            therapist: newWellnessTherapist,
                            notes: "Sovereign guest. Custom high pressure and lavender aromatherapy.",
                            status: 'Confirmed'
                          };
                          setWellnessSlots([...wellnessSlots, newSlot]);
                          setSelectedWellnessSlot(newSlot.id);
                          setBookingFormOpen(false);
                          confetti({ particleCount: 30 });
                        }}
                        className="bg-gradient-to-r from-[#c19a6b] to-[#a37c4c] text-slate-950 font-mono text-[10px] uppercase font-bold py-3 px-6 rounded-xl hover:brightness-110 transition w-full"
                      >
                        Confirm Booking & Dispatch Cabin Node
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* SCREEN 13: CONCIERGE FLEET & TRANSPORT MANAGER */}
              {activeCockpit === 'fleet' && (
                <div className="p-6 md:p-8 bg-[#03050a] space-y-6 text-left relative overflow-hidden">
                  
                  <div className="text-center space-y-2">
                    <h3 className="font-serif text-2xl text-slate-100 font-bold">
                      Concierge Fleet & Transport Manager
                    </h3>
                    <p className="text-xs text-[#c19a6b] font-mono">
                      Coordinate private drivers, monitor route metrics, and manage elite luxury vehicles.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch max-w-5xl mx-auto pt-2">
                    
                    {/* Interactive stylized Map representing driver coordinates */}
                    <div className="lg:col-span-2 bg-[#090b10] border border-white/5 rounded-2xl p-4 relative h-80 overflow-hidden flex flex-col justify-between">
                      <div className="absolute inset-0 bg-[radial-gradient(#c19a6b_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
                      
                      <div className="flex justify-between items-center z-10">
                        <span className="text-[8px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">
                          ACTIVE DRIVER COORDINATES
                        </span>
                        <span className="text-[8px] font-mono text-[#c19a6b]">GPS INTEGRITY VERIFIED</span>
                      </div>

                      {/* Map display representation with coordinates */}
                      <div className="relative w-full h-56 flex items-center justify-center">
                        <svg className="w-full h-full border border-white/5 bg-slate-950/80 rounded-xl" viewBox="0 0 200 100">
                          {/* Simulated streets / paths */}
                          <path d="M 10 30 Q 80 10 120 70 T 190 40" fill="none" stroke="#222530" strokeWidth="6" strokeLinecap="round" />
                          <path d="M 30 90 Q 70 50 150 90" fill="none" stroke="#222530" strokeWidth="4" strokeLinecap="round" />
                          <path d="M 10 30 Q 80 10 120 70 T 190 40" fill="none" stroke="#c19a6b" strokeWidth="1.5" strokeDasharray="3,3" />

                          {/* Coordinates marker for each car */}
                          {fleetCars.map((car) => (
                            <g key={car.id} className="cursor-pointer" onClick={() => setSelectedFleetVehicle(car.id)}>
                              {/* Glowing circle representation */}
                              <circle 
                                cx={car.x} 
                                cy={car.y} 
                                r="4" 
                                fill={car.status === 'On Duty' ? '#10b981' : '#c19a6b'} 
                                className={car.status === 'On Duty' ? 'animate-pulse' : ''} 
                              />
                              <circle cx={car.x} cy={car.y} r="10" fill="none" stroke={selectedFleetVehicle === car.id ? '#c19a6b' : 'transparent'} strokeWidth="1" />
                              <text x={car.x + 6} y={car.y + 3} fill="#94a3b8" fontSize="5" className="font-mono">
                                {car.driver}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>

                      <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 z-10">
                        <span>Liaisons: PRIVATE_HELIPORT_SYNC</span>
                        <span>Crypto secure location nodes active</span>
                      </div>
                    </div>

                    {/* Fleet & Chauffeur Status Sidebar */}
                    <div className="bg-[#0b0e14] border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                      <span className="text-[8px] font-mono text-[#c19a6b] block uppercase">Fleet & Chauffeur Status</span>
                      
                      <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
                        {fleetCars.map((car) => (
                          <div 
                            key={car.id} 
                            onClick={() => setSelectedFleetVehicle(car.id)}
                            className={`p-3 rounded-xl border transition cursor-pointer text-xs space-y-2 ${
                              selectedFleetVehicle === car.id 
                                ? 'bg-[#c19a6b]/10 border-[#c19a6b]' 
                                : 'bg-black/40 border-white/5 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-200">{car.name}</span>
                              <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                                car.status === 'On Duty' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                              }`}>{car.status}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Driver: {car.driver}</span>
                              <span>Speed: {car.speed} km/h</span>
                            </div>
                            <div className="text-[9px] text-[#c19a6b] font-mono uppercase tracking-widest">{car.location}</div>
                          </div>
                        ))}
                      </div>

                      {/* Interactive dispatch action */}
                      <button
                        onClick={() => {
                          const targetCar = fleetCars.find(c => c.id === selectedFleetVehicle);
                          if (!targetCar) return;
                          
                          // Animate driver coordinate
                          const updated = fleetCars.map(c => {
                            if (c.id === selectedFleetVehicle) {
                              return {
                                ...c,
                                status: 'On Duty',
                                speed: 55,
                                x: Math.min(190, c.x + 15),
                                y: Math.max(10, c.y - 10),
                                location: 'Nice Airport Route'
                              };
                            }
                            return c;
                          });
                          setFleetCars(updated);
                          confetti({ particleCount: 20 });
                          alert(`Dispatched ${targetCar.name} driven by ${targetCar.driver} securely to airport transfer.`);
                        }}
                        className="w-full bg-gradient-to-r from-[#c19a6b] to-[#a37c4c] hover:brightness-110 text-white font-mono text-[9px] uppercase font-bold py-2.5 px-4 rounded-xl transition"
                      >
                        Dispatch Driver to Nice Airport
                      </button>
                    </div>

                    {/* Right summary panel */}
                    <div className="bg-[#0b0e14] border border-white/5 p-4 rounded-2xl flex flex-col justify-between text-xs space-y-4">
                      <div className="space-y-3">
                        <span className="text-[8px] font-mono text-slate-400 block uppercase">Upcoming Transfers</span>
                        
                        <div className="space-y-2">
                          {[
                            { name: 'Mrs. Dubois', route: 'Airport ➔ Hotel', vehicle: 'Luxury Sedan' },
                            { name: 'Ms. Charlos', route: 'Nice Jet Lounge ➔ Suite 301', vehicle: 'Phantom Sedan' },
                            { name: 'Ms. Dhaler', route: 'Monaco Heliport ➔ Executive Spa', vehicle: 'Luxury SUV' }
                          ].map((t, idx) => (
                            <div key={idx} className="bg-black/50 p-2.5 rounded-lg border border-white/5 space-y-1">
                              <div className="flex justify-between font-bold text-slate-200 text-[10px]">
                                <span>{t.name}</span>
                                <span className="text-[#c19a6b] text-[9px]">{t.vehicle}</span>
                              </div>
                              <div className="text-[9px] text-slate-400">{t.route}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-white/5">
                        <span className="text-[7px] font-mono text-slate-500 uppercase block">FLIGHT MONITORING</span>
                        <div className="text-[9px] text-slate-300">LH 2212 - Arriving 15:45 (On Time)</div>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* SCREEN 14: PREDICTIVE MAINTENANCE */}
              {activeCockpit === 'predictive' && (
                <div className="p-6 md:p-8 bg-[#04060d] space-y-6 text-left">
                  <div className="text-center space-y-2">
                    <h3 className="font-serif text-2xl text-slate-100 font-bold tracking-tight">
                      Intelligence prédictive pour une maintenance sans faille
                    </h3>
                    <p className="text-xs text-slate-400 font-light max-w-xl mx-auto">
                      Anticipez les incidents techniques et optimisez les opérations en temps réel grâce à l'IA de Zaphir.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-5xl mx-auto pt-2">
                    
                    {/* Left Column: AI-Generated Maintenance Tasks */}
                    <div className="bg-[#0b0e14] border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <span className="text-[8px] font-mono text-slate-400 block uppercase">AI-Generated Maintenance Tasks</span>
                        
                        <div className="space-y-2 overflow-y-auto max-h-60 pr-1">
                          {maintenanceTasks.map((task) => (
                            <div 
                              key={task.id}
                              onClick={() => {
                                setActiveMaintenanceTask(task.id);
                                setMaintenanceTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: t.status === 'Pending' ? 'Complete' : 'Pending' } : t));
                                alert(`Focusing technical cameras on ${task.appliance} in room ${task.roomNum}. Clicked again to toggle status.`);
                              }}
                              className={`p-3 rounded-xl border transition cursor-pointer text-xs space-y-1 ${
                                activeMaintenanceTask === task.id 
                                  ? 'bg-[#c19a6b]/15 border-[#c19a6b]' 
                                  : 'bg-black/50 border-white/5 hover:bg-white/5'
                              }`}
                            >
                              <div className="flex justify-between items-center font-bold text-slate-200 text-[11px]">
                                <span>{task.title}</span>
                                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                                  task.priority === 'Predictive' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                }`}>{task.priority}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">{task.location}</div>
                              <div className="text-[9px] text-[#c19a6b] font-mono">{task.date}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Diagnostic trigger */}
                      <button
                        onClick={() => {
                          setDiagnosticsRunning(true);
                          setDiagnosticsOutput(["Scanning sub-systems..."]);
                          setTimeout(() => {
                            setDiagnosticsOutput(prev => [...prev, "Checking Suite 101 mini-bar pressure..."]);
                            setTimeout(() => {
                              setDiagnosticsOutput(prev => [...prev, "Reading AC ventilation output..."]);
                              setTimeout(() => {
                                setDiagnosticsOutput(prev => [...prev, "ALL SYSTEMS STABLE. Diagnostic complete."]);
                                setDiagnosticsRunning(false);
                                confetti({ particleCount: 15 });
                              }, 1000);
                            }, 800);
                          }, 800);
                        }}
                        disabled={diagnosticsRunning}
                        className="w-full bg-[#c19a6b] text-slate-950 hover:brightness-110 disabled:opacity-50 font-mono text-[9px] uppercase font-bold py-2.5 px-4 rounded-xl transition"
                      >
                        {diagnosticsRunning ? "Running Diagnostics..." : "Run System Diagnostics"}
                      </button>
                    </div>

                    {/* Central 3D Tablet floorplan with green links */}
                    <div className="lg:col-span-2 bg-black border border-[#c19a6b]/20 rounded-2xl p-4 relative h-80 overflow-hidden flex flex-col justify-between shadow-xl">
                      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
                      
                      <div className="flex justify-between items-center z-10">
                        <span className="text-[8px] font-mono text-[#c19a6b] uppercase tracking-widest bg-[#c19a6b]/10 px-2 py-0.5 rounded border border-[#c19a6b]/20">
                          PREDICTIVE INFRASTRUCTURE MAP
                        </span>
                        <span className="text-[8px] font-mono text-slate-500">REALTIME TELEMETRY</span>
                      </div>

                      {/* Perspective visual matching the AC, minibars, water sensors diagram */}
                      <div className="relative w-full h-56 flex items-center justify-center">
                        <div className="w-11/12 h-5/6 border border-white/5 bg-slate-950/90 rounded-xl p-3 flex flex-col justify-between font-mono text-[9px] relative [transform:rotateX(15deg)_rotateY(-5deg)]">
                          <div className="absolute inset-0 border border-[#c19a6b]/10 rounded-xl pointer-events-none" />
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300">Z-Hub Core Node #9841</span>
                            <span className="text-emerald-400 animate-pulse">● LIVE</span>
                          </div>

                          {/* Appliance connection lines */}
                          <div className="flex justify-center my-1 relative h-28">
                            <svg className="w-full h-full" viewBox="0 0 200 80">
                              {/* Central Hub */}
                              <circle cx="100" cy="40" r="10" fill="#c19a6b" fillOpacity="0.1" stroke="#c19a6b" strokeWidth="1.5" />
                              <circle cx="100" cy="40" r="4" fill="#c19a6b" className="animate-pulse" />

                              {/* Appliances */}
                              <g id="ac" className="cursor-pointer" onClick={() => alert("AC Unit normal telemetry output.")}>
                                <circle cx="40" cy="20" r="6" fill="#10b981" />
                                <text x="15" y="10" fill="#94a3b8" fontSize="6">AC Suite 101</text>
                                <line x1="40" y1="20" x2="90" y2="35" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
                              </g>

                              <g id="minibar" className="cursor-pointer" onClick={() => alert("Minibar warning: temperature compressor exceeds 4.5°C threshold.")}>
                                <circle cx="160" cy="20" r="6" fill="#fbbf24" />
                                <text x="145" y="10" fill="#fcd34d" fontSize="6">Mini-Bar 204</text>
                                <line x1="160" y1="20" x2="110" y2="35" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2,2" />
                              </g>

                              <g id="locks" className="cursor-pointer" onClick={() => alert("Smart lock battery swap task pre-booked.")}>
                                <circle cx="50" cy="65" r="6" fill="#10b981" />
                                <text x="25" y="78" fill="#94a3b8" fontSize="6">Smart Locks</text>
                                <line x1="50" y1="65" x2="90" y2="45" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
                              </g>

                              <g id="water" className="cursor-pointer" onClick={() => alert("Water sensor reports flow is stable.")}>
                                <circle cx="150" cy="65" r="6" fill="#10b981" />
                                <text x="135" y="78" fill="#94a3b8" fontSize="6">Water Sensors</text>
                                <line x1="150" y1="65" x2="110" y2="45" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
                              </g>
                            </svg>
                          </div>

                          <div className="flex justify-between text-slate-500 text-[8px] border-t border-white/5 pt-1">
                            <span>Compressor efficiency optimized</span>
                            <span>Secure Ledger Node Online</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Column: Staff Alerts & System Health */}
                    <div className="bg-[#0b0e14] border border-white/5 p-4 rounded-2xl flex flex-col justify-between text-xs space-y-4">
                      <div className="space-y-4">
                        <span className="text-[8px] font-mono text-slate-400 block uppercase">Staff Alerts & System Health</span>
                        
                        <div className="space-y-2">
                          {[
                            { title: 'Leak Detection, Spa Area', time: 'Today ago', status: 'ALERT' },
                            { title: 'Smart Lock Battery Low, Club Lounge', time: 'Today ago', status: 'Warning' }
                          ].map((alert, idx) => (
                            <div key={idx} className="bg-black/50 p-2.5 rounded-lg border border-white/5 space-y-1">
                              <div className="flex justify-between items-center font-bold text-slate-200 text-[10px]">
                                <span>{alert.title}</span>
                                <span className={`text-[8px] font-mono ${alert.status === 'ALERT' ? 'text-red-400' : 'text-amber-400'}`}>{alert.status}</span>
                              </div>
                              <div className="text-[9px] text-slate-400">{alert.time}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sparkline efficiency graphics using custom simple SVGs */}
                      <div className="space-y-3 pt-3 border-t border-white/5 font-mono text-[9px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-400">
                            <span>AC Efficiency</span>
                            <span className="text-emerald-400 font-bold">92%</span>
                          </div>
                          {/* Sparkline graph */}
                          <svg className="w-full h-6 bg-slate-950/80 rounded" viewBox="0 0 100 20">
                            <path d="M 0 15 L 20 12 L 40 18 L 60 8 L 80 14 L 100 5" fill="none" stroke="#10b981" strokeWidth="1.5" />
                          </svg>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-400">
                            <span>AC HF System Status</span>
                            <span className="text-emerald-400 font-bold">92%</span>
                          </div>
                          <svg className="w-full h-6 bg-slate-950/80 rounded" viewBox="0 0 100 20">
                            <path d="M 0 10 L 20 15 L 40 5 L 60 12 L 80 4 L 100 8" fill="none" stroke="#10b981" strokeWidth="1.5" />
                          </svg>
                        </div>
                      </div>

                      {diagnosticsOutput.length > 0 && (
                        <div className="bg-black/60 p-2.5 rounded-lg border border-[#c19a6b]/20 font-mono text-[8px] space-y-1 overflow-y-auto max-h-24">
                          {diagnosticsOutput.map((log, idx) => (
                            <div key={idx} className="text-slate-300 leading-tight">➔ {log}</div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              )}

            </div>
          </div>
        </section>

        {/* 1. PLATEFORME SECTION */}
        <section 
          id="plateforme" 
          className="pt-16 border-t border-white/5 space-y-12"
          style={{ paddingTop: '10px', width: isLargeScreen ? '1213.33px' : '100%', paddingLeft: '7px', marginTop: '10px' }}
        >
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#c19a6b] font-bold">01 / PLATFORM</span>
            <h2 className="text-3xl font-serif text-slate-100 font-bold tracking-tight">Une infrastructure souveraine pour vos opérations</h2>
            <p className="text-sm text-slate-400 font-light">Zaphir centralise la gestion technique, hôtelière et relationnelle de vos établissements dans un cockpit sécurisé.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Sliders className="w-5 h-5 text-[#c19a6b]" />,
                title: language === 'FR' ? "Domotique & Suites Connectées" : "Smart Room Automation",
                desc: language === 'FR' ? "Ajustez la lueur des néons, la climatisation, et l'opacité du vitrage sans quitter votre cockpit." : "Control HVAC, neon lighting, and smart glass opacity in real time via biometric keys."
              },
              {
                icon: <Coffee className="w-5 h-5 text-[#c19a6b]" />,
                title: language === 'FR' ? "Room Service & Gastronomie" : "Room Service & Catering",
                desc: language === 'FR' ? "Pilotage des commandes de haute cuisine en temps réel avec indicateur de préparation." : "Manage elite catering requests and chef-designed menu queues seamlessly with live status updates."
              },
              {
                icon: <Crown className="w-5 h-5 text-[#c19a6b]" />,
                title: language === 'FR' ? "Fidélisation & VIP Registry" : "Loyalty & Private Registry",
                desc: language === 'FR' ? "Gérez l'historique de dépenses et d'attribution de majordome de vos clients d'exception." : "Track custom spends, preferences, and personal butler level assignments for elite club members."
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-[#c19a6b]" />,
                title: language === 'FR' ? "Coffre-fort Cryptographique" : "Cryptographic Secure Vault",
                desc: language === 'FR' ? "Enregistrement de contrats, documents d'identité et de transport sur registre immuable." : "Upload contracts, ID passports, and luxury assets with SHA-256 validation and blockchain logs."
              },
              {
                icon: <Wine className="w-5 h-5 text-[#c19a6b]" />,
                title: language === 'FR' ? "La Cave des Souverains" : "Sovereign Wine Cellar",
                desc: language === 'FR' ? "Sommelier intelligent dopé à l'IA pour accorder les grands crus d'oenologie d'exception." : "AI Sommelier pairing engine for prestigious wines, grand crus, and custom culinary menus."
              },
              {
                icon: <Activity className="w-5 h-5 text-[#c19a6b]" />,
                title: language === 'FR' ? "Supervision du Staff" : "Staff Allocation Matrix",
                desc: language === 'FR' ? "Associez vos majordomes, sommeliers, concierges aux requêtes actives et suivez l'avancée." : "Delegate personnel clearance level tasks, view active room logs, and secure ledger edits."
              }
            ].map((feat, idx) => (
              <div key={idx} className="bg-[#0b0e14] border border-white/5 hover:border-[#c19a6b]/30 p-6 rounded-2xl transition-all duration-300 space-y-4 group">
                <span className="p-3 bg-[#c19a6b]/10 group-hover:bg-[#c19a6b]/20 rounded-xl inline-block transition">
                  {feat.icon}
                </span>
                <h3 className="text-base font-serif font-bold text-slate-100">{feat.title}</h3>
                <p className="text-xs text-slate-400 font-light leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. SOLUTIONS SECTION */}
        <section 
          id="solutions" 
          className="pt-16 border-t border-white/5 space-y-12"
          style={{ marginTop: '10px' }}
        >
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#c19a6b] font-bold">02 / SOLUTIONS</span>
            <h2 className="text-3xl font-serif text-slate-100 font-bold tracking-tight">Des réponses sur-mesure aux exigences de l'élite</h2>
            <p className="text-sm text-slate-400 font-light">Que vous gériez un palace historique, un club de membres sélect ou des résidences privées, Zaphir s'adapte à vos protocoles d'exception.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: language === 'FR' ? "Palaces & Hôtels 5 Étoiles" : "Palaces & Five-Star Hotels",
                badge: "Palace Suite",
                desc: language === 'FR' 
                  ? "Assurez la parité des prix, la synchronisation instantanée des réservations sur vos canaux et configurez une expérience personnalisée pour vos délégations."
                  : "Ensure dynamic rate estimation, instant channel updates, and high-occupancy guest coordination with ultimate aesthetic consistency.",
                checklist: language === 'FR'
                  ? ["Synchronisation multicanal (Expedia, Booking)", "Visualisation 3D en temps réel", "Accès tablettes & majordome L5"]
                  : ["Multichannel parity sync (Expedia, Booking)", "Real-time 3D dashboard visuals", "iPad butler clearances L5"]
              },
              {
                title: language === 'FR' ? "Clubs Privés & Yachting" : "Private Clubs & Elite Yachting",
                badge: "Sovereign Membership",
                desc: language === 'FR'
                  ? "Fournissez des clés cryptographiques virtuelles à vos membres exclusifs. Pilotez l'accès au lounge exécutif et aux rafraîchissements haut de gamme."
                  : "Deliver biometric keys for private executive lounges, coordinate master cellar requests, and control secure yachting docking metrics.",
                checklist: language === 'FR'
                  ? ["Registre d'admissions biométrique", "Gestionnaire de cave intelligent", "Paiements par jetons de prestige"]
                  : ["Biometric admissions log", "Intelligent sommelier cellar engine", "Prestige token payments"]
              },
              {
                title: language === 'FR' ? "Villas & Chalets d'Exception" : "Bespoke Chalets & Residences",
                badge: "Exclusive Estate",
                desc: language === 'FR'
                  ? "Un système autonome, résistant aux pannes de réseau pour piloter vos domaines de montagne et propriétés littorales avec la plus haute discrétion."
                  : "An offline-first, failure-resistant control framework for remote chalets and private littoral domains, prioritizing resident complete solitude.",
                checklist: language === 'FR'
                  ? ["Stockage et base locale synchronisée", "Pare-feu acoustique autonome", "Alerte maintenance 3D instantanée"]
                  : ["Local-first database offline sync", "Autonomous acoustic firewalls", "Instant 3D maintenance alerts"]
              }
            ].map((sol, idx) => (
              <div key={idx} className="bg-gradient-to-b from-[#0a0f18] to-[#04060b] border border-white/5 hover:border-[#c19a6b]/30 p-8 rounded-2xl flex flex-col justify-between space-y-6 shadow-lg">
                <div className="space-y-4">
                  <span className="bg-[#c19a6b]/10 text-[#c19a6b] font-mono text-[9px] font-bold px-2.5 py-1 rounded border border-[#c19a6b]/30 uppercase tracking-widest inline-block">
                    {sol.badge}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-slate-100">{sol.title}</h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">{sol.desc}</p>
                </div>

                <ul className="space-y-2 border-t border-white/5 pt-4">
                  {sol.checklist.map((item, cIdx) => (
                    <li key={cIdx} className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-[#c19a6b] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* DYNAMIC SOLUTIONS PLANNER & ROI CALCULATOR */}
          <div className="bg-gradient-to-b from-[#0e111a] via-[#090b10] to-[#04060b] border border-white/5 p-6 sm:p-8 rounded-3xl shadow-xl max-w-5xl mx-auto space-y-6 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <span className="text-[9px] font-mono text-[#c19a6b] uppercase tracking-widest block mb-1">SOVEREIGN CALCULATOR</span>
                <h3 className="font-serif text-xl font-bold text-slate-100">Simulateur d'Impact Opérationnel & ROI</h3>
              </div>
              <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                {(['PALACE', 'CLUB', 'CHALET'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSolutionsTier(tier)}
                    className={`px-3 py-1.5 text-[9px] font-mono rounded-lg transition ${
                      solutionsTier === tier ? 'bg-[#c19a6b] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tier === 'PALACE' ? 'PALACES' : tier === 'CLUB' ? 'CLUBS' : 'CHALETS'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Slider panel */}
              <div className="md:col-span-1 space-y-4 font-sans">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Nombre d'unités / Suites connectées : <span className="text-[#c19a6b] font-bold font-mono text-xs">{solutionsRoomsCount}</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="300"
                    value={solutionsRoomsCount}
                    onChange={(e) => setSolutionsRoomsCount(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#c19a6b]"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-500">
                    <span>5 SUITES</span>
                    <span>300 SUITES</span>
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[8px] font-mono text-[#c19a6b] uppercase block">CONFIGURATION SÉLECTIONNÉE</span>
                  <p className="text-[11px] text-slate-300 font-light leading-relaxed">
                    {solutionsTier === 'PALACE' 
                      ? 'Parité de tarifs multicanaux active, clés de tablettes majordomes L5, et supervision du staff en direct.' 
                      : solutionsTier === 'CLUB' 
                        ? 'Accès salon exécutif biométrique, sommelier IA intelligent, et jetons de prestige pour lounge.'
                        : 'Bases de données synchronisées locales, résistant aux pannes réseau, et pare-feux acoustiques.'
                    }
                  </p>
                </div>
              </div>

              {/* Simulated Metrics Panel */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Économies d'Énergie Prévues</span>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
                    €{(solutionsRoomsCount * (solutionsTier === 'PALACE' ? 140 : solutionsTier === 'CLUB' ? 115 : 125)).toLocaleString('fr-FR')} / an
                  </div>
                  <span className="text-[8px] font-mono text-slate-500">Optimisation thermique dynamique</span>
                </div>

                <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Temps Concierge Moyen</span>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-slate-100">
                    2.1 secondes
                  </div>
                  <span className="text-[8px] font-mono text-emerald-500">Liaison locale instantanée</span>
                </div>

                <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Temps Staff Épargné</span>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-slate-100">
                    {Math.round(solutionsRoomsCount * 2.5)} heures / sem.
                  </div>
                  <span className="text-[8px] font-mono text-slate-500">Allocation optimisée via cockpit</span>
                </div>

                <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">ROI Estimé du Système</span>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
                    {Math.max(8, Math.round(24 - (solutionsRoomsCount / 12)))} mois
                  </div>
                  <span className="text-[8px] font-mono text-slate-500">Amortissement matériel inclus</span>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* 3. CLIENTS SECTION */}
        <section 
          id="clients" 
          className="pt-16 border-t border-white/5 space-y-12 scroll-mt-24"
          style={{ marginTop: '10px' }}
        >
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#c19a6b] font-bold">03 / CLIENTS D'EXCEPTION</span>
            <h2 className="text-3xl font-serif text-slate-100 font-bold tracking-tight">
              La confiance de l'élite de l'hospitalité
            </h2>
            <p className="text-sm text-slate-400 font-light">
              Zaphir équipe les établissements les plus sélectifs du globe, garantissant une discrétion absolue et un contrôle souverain.
            </p>
          </div>

          {/* Filtering tabs */}
          <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto px-4">
            {[
              { id: 'ALL', label: language === 'FR' ? 'Tous' : 'All' },
              { id: 'PALACE', label: language === 'FR' ? 'Palaces' : 'Palaces' },
              { id: 'CLUB', label: language === 'FR' ? 'Clubs Privés' : 'Private Clubs' },
              { id: 'FLEET', label: language === 'FR' ? 'Flottes & Jets' : 'Fleets & Jets' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedClientCategory(cat.id as any)}
                className={`px-4 py-2 text-[10px] font-mono rounded-xl border transition ${
                  selectedClientCategory === cat.id
                    ? 'bg-gradient-to-r from-[#c19a6b] to-[#a37c4c] text-white font-bold border-transparent shadow-[0_0_10px_rgba(193,154,107,0.2)]'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Prestigious clients cards portfolio */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Palace de l'Alpaga",
                loc: "Courchevel, France",
                category: "PALACE",
                desc: "Un cockpit de pilotage unifié pour 45 suites alpines de prestige connectées et synchronisées en local.",
                stats: "+24% Efficacité staff",
                quote: "\"Zaphir a redéfini le standard opérationnel de notre établissement. Nos majordomes opèrent avec un cockpit millimétré.\""
              },
              {
                name: "Le Club des Souverains",
                loc: "Genève, Suisse",
                category: "CLUB",
                desc: "Gestion de cave oenologique intelligente par IA et registre d'admissions souverain sur tablettes sécurisées.",
                stats: "100% Souveraineté données",
                quote: "\"La confidentialité de nos membres n'a pas de prix. Le chiffrement local de Zaphir nous offre une sérénité absolue.\""
              },
              {
                name: "Royal Yachting Fleet",
                loc: "Monaco",
                category: "FLEET",
                desc: "Sécurisation des liaisons héliport, transpondeurs yachts et chauffeurs privés en temps réel via clés biométriques.",
                stats: "2.1s Temps de réponse",
                quote: "\"Du jet au yacht, nos clients bénéficient d'un transfert sécurisé avec une coordination infaillible.\""
              },
              {
                name: "Château des Ducs",
                loc: "Val de Loire, France",
                category: "PALACE",
                desc: "Maintenance prédictive assistée par IA pour préserver le système domotique d'un monument historique d'exception.",
                stats: "-18% Consommation d'énergie",
                quote: "\"Zaphir prévient le moindre dysfonctionnement technique avant même qu'un hôte ne s'en aperçoive.\""
              },
              {
                name: "The Executive Jet Lounge",
                loc: "Nice Private Terminal",
                category: "FLEET",
                desc: "Accueil VIP de délégations diplomatiques avec contrôle d'ambiance lumineuse néon et domotique ultra discrète.",
                stats: "0 incident de sécurité",
                quote: "\"L'accès biométrique et le coffre-fort cryptographique assurent la protection ultime de nos passagers d'exception.\""
              },
              {
                name: "The Obsidian Club",
                loc: "Saint-Tropez, France",
                category: "CLUB",
                desc: "Gestion complète des adhésions de prestige par cartes de métal connectées en temps réel avec indicateur LED.",
                stats: "+40% Rétention membres",
                quote: "\"Nos membres apprécient le raffinement technologique. Les cartes métal s'intègrent à nos rituels exclusifs.\""
              }
            ]
            .filter(c => selectedClientCategory === 'ALL' || c.category === selectedClientCategory)
            .map((client, idx) => (
              <div key={idx} className="bg-gradient-to-b from-[#0b0f16] to-[#04060a] border border-white/5 hover:border-[#c19a6b]/30 p-6 rounded-2xl flex flex-col justify-between space-y-4 text-left shadow-lg transition-all duration-300">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif text-base font-bold text-slate-100">{client.name}</h4>
                      <span className="text-[9px] font-mono text-[#c19a6b] uppercase tracking-wider">{client.loc}</span>
                    </div>
                    <span className="bg-[#c19a6b]/10 text-[#c19a6b] font-mono text-[8px] font-bold px-2 py-0.5 rounded border border-[#c19a6b]/20">
                      {client.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">{client.desc}</p>
                  <p className="text-[10px] text-slate-300 italic font-serif leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                    {client.quote}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/5 text-[10px] font-mono text-slate-300">
                  <span>Métrique Clé :</span>
                  <span className="text-emerald-400 font-bold">{client.stats}</span>
                </div>
              </div>
            ))}
          </div>

          {/* INTERACTIVE SECURE NODE LEDGER TERMINAL */}
          <div className="bg-[#05070c] border border-cyan-500/10 p-6 sm:p-8 rounded-3xl shadow-xl max-w-5xl mx-auto space-y-6 text-left relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block">SECURE NODE PING</span>
                <h3 className="font-serif text-xl font-bold text-slate-100">Registre Souverain des Nœuds Clients</h3>
              </div>
              <div className="flex gap-2 text-xs font-mono">
                <select
                  value={clientSearchNode}
                  onChange={(e) => {
                    setClientSearchNode(e.target.value);
                    setClientNodeStatus('IDLE');
                    setClientNodeOutput([]);
                  }}
                  className="bg-black border border-white/10 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="NODE-COURCHEVEL">Nœud Alpaga Courchevel (#3942)</option>
                  <option value="NODE-GENEVE">Nœud Souverain Genève (#1084)</option>
                  <option value="NODE-MONACO">Nœud Yachts Monaco (#8831)</option>
                  <option value="NODE-LOIRE">Nœud Château Loire (#7102)</option>
                </select>
                
                <button
                  onClick={() => {
                    setClientNodeStatus('PENDING');
                    setClientNodeOutput(["Initialisation handshake TLS 1.3..."]);
                    setTimeout(() => {
                      setClientNodeOutput(prev => [...prev, "Signature de clé de Zero-Knowledge déchiffrée..."]);
                      setTimeout(() => {
                        setClientNodeOutput(prev => [...prev, "Validation de la chaîne de blocs SHA-256..."]);
                        setTimeout(() => {
                          setClientNodeOutput(prev => [...prev, "NŒUD SÉCURISÉ VÉRIFIÉ AVEC SUCCÈS. STATUT : EN LIGNE"]);
                          setClientNodeStatus('SUCCESS');
                          confetti({ particleCount: 15, colors: ['#06b6d4', '#ffffff'] });
                        }, 700);
                      }, 700);
                    }, 600);
                  }}
                  disabled={clientNodeStatus === 'PENDING'}
                  className="bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-500/20 px-4 py-2 rounded-lg transition"
                >
                  {clientNodeStatus === 'PENDING' ? 'PINGING...' : 'Vérifier Nœud'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Terminal Logs */}
              <div className="md:col-span-2 bg-black border border-white/5 rounded-xl p-4 font-mono text-[10px] h-44 flex flex-col justify-between">
                <div className="space-y-1 overflow-y-auto h-32 text-slate-300">
                  <div className="text-slate-500">// Zaphir Ledger Verification Protocol v4.2</div>
                  <div className="text-slate-500">// Target Node: {clientSearchNode}</div>
                  {clientNodeOutput.map((log, idx) => (
                    <div key={idx} className={log.includes("SUCCÈS") ? 'text-emerald-400 font-bold' : ''}>➔ {log}</div>
                  ))}
                  {clientNodeStatus === 'IDLE' && (
                    <div className="text-slate-500 italic">En attente de commande de vérification...</div>
                  )}
                </div>
                <div className="flex justify-between text-[8px] text-slate-600 border-t border-white/5 pt-1">
                  <span>Cryptographic ledger verified</span>
                  <span>SSL/TLS 1.3</span>
                </div>
              </div>

              {/* Verified Node Metrics */}
              <div className="space-y-4 text-xs font-mono">
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-slate-400 uppercase text-[9px]">Latence Nœud :</span>
                  <span className={clientNodeStatus === 'SUCCESS' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {clientNodeStatus === 'SUCCESS' ? '12 ms (Excellent)' : '--'}
                  </span>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-slate-400 uppercase text-[9px]">Chambres Sécurisées :</span>
                  <span className={clientNodeStatus === 'SUCCESS' ? 'text-slate-200 font-bold' : 'text-slate-500'}>
                    {clientNodeStatus === 'SUCCESS' ? (clientSearchNode === 'NODE-COURCHEVEL' ? '45 Suites connectées' : clientSearchNode === 'NODE-GENEVE' ? '24 Salons connectés' : '15 Yachts connectés') : '--'}
                  </span>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-slate-400 uppercase text-[9px]">Souveraineté :</span>
                  <span className={clientNodeStatus === 'SUCCESS' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {clientNodeStatus === 'SUCCESS' ? '100% Locale / Offline-first' : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* 4. À PROPOS SECTION */}
        <section id="apropos" className="pt-16 border-t border-white/5 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#c19a6b] font-bold block">04 / ABOUT ZAPHIR</span>
              <h2 className="text-4xl font-serif text-slate-100 font-bold tracking-tight">Notre Héritage & Vision</h2>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                Fondé sur la French Riviera, Zaphir unit la tradition de l'hospitalité d'exception française à la rigueur de la cryptographie moderne locale.
              </p>
              
              {/* Timeline selector */}
              <div className="flex gap-2 p-1 bg-black/40 border border-white/5 rounded-xl max-w-xs">
                {([2024, 2025, 2026] as const).map((year) => (
                  <button
                    key={year}
                    onClick={() => setActiveAboutYear(year)}
                    className={`flex-1 py-1.5 text-xs font-mono rounded-lg transition ${
                      activeAboutYear === year 
                        ? 'bg-[#c19a6b] text-slate-950 font-bold shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>

              {/* Dynamic Year Display */}
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3 animate-fade-in">
                {activeAboutYear === 2024 && (
                  <>
                    <h4 className="font-serif text-lg font-bold text-slate-200">Genesis & Cryptographie Locale</h4>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      Création de Zaphir sur la Côte d'Azur. Naissance du brevet de clé de chiffrement local immuable et architecture offline-first garantissant 0 fuite de données vers des cloud tiers.
                    </p>
                    <div className="flex justify-between items-center pt-2 font-mono text-[10px] text-slate-300">
                      <span>R&D Lab :</span>
                      <span className="text-[#c19a6b] font-bold">Nice, Côte d'Azur</span>
                    </div>
                  </>
                )}

                {activeAboutYear === 2025 && (
                  <>
                    <h4 className="font-serif text-lg font-bold text-[#c19a6b]">Premiers Cockpits Déployés</h4>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      Déploiement pilote expérimental dans deux célèbres palaces de Courchevel et un superyacht de prestige basé à Monaco. Validation de l'impact de l'automation et de l'efficience.
                    </p>
                    <div className="flex justify-between items-center pt-2 font-mono text-[10px] text-slate-300">
                      <span>Nœuds Actifs :</span>
                      <span className="text-[#c19a6b] font-bold">3 Établissements Pilotes</span>
                    </div>
                  </>
                )}

                {activeAboutYear === 2026 && (
                  <>
                    <h4 className="font-serif text-lg font-bold text-slate-200 font-sans tracking-tight">Hôtellerie Souveraine Globale</h4>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      Lancement de Zaphir 4.2. Notre réseau de nœuds s'étend aux chalets, clubs privés, et flottes VIP, établissant une nouvelle norme d'excellence opérationnelle et de sécurité cryptographique.
                    </p>
                    <div className="flex justify-between items-center pt-2 font-mono text-[10px] text-slate-300">
                      <span>Niveau de Chiffrement :</span>
                      <span className="text-emerald-400 font-bold">AES-GCM 256 Local Ledger</span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <span className="p-2 bg-[#c19a6b]/10 text-[#c19a6b] rounded-lg block shrink-0">
                    <Key className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">Sécurité Souveraine</h4>
                    <p className="text-[11px] text-slate-400 font-light">
                      Chaque transaction, accès, modification est chiffrée et enregistrée de manière immuable.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="p-2 bg-[#c19a6b]/10 text-[#c19a6b] rounded-lg block shrink-0">
                    <Sliders className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">Contrôle Millimétré</h4>
                    <p className="text-[11px] text-slate-400 font-light">
                      Centralisation absolue sur iPad et écrans muraux des ambiances et services hôteliers haut de gamme.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-white/5 h-[380px] shadow-2xl">
              <div 
                className="absolute inset-0 bg-cover bg-center brightness-[0.45] transition-all duration-700" 
                style={{ 
                  backgroundImage: `url(${
                    activeAboutYear === 2024 
                      ? 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
                      : activeAboutYear === 2025 
                        ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
                        : 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
                  })`
                }} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03050a] via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-md border border-white/5 rounded-2xl text-left">
                <span className="text-[8px] font-mono text-[#c19a6b] font-bold uppercase tracking-widest block mb-1">
                  {activeAboutYear === 2024 ? 'GENESIS 2024' : activeAboutYear === 2025 ? 'MILESTONE 2025' : 'CORE STANDARDS 2026'}
                </span>
                <p className="text-xs text-slate-300 font-serif leading-relaxed">
                  {activeAboutYear === 2024 
                    ? '"Combiner la grandeur de l\'hospitalité traditionnelle au luxe de la technologie autonome et de la confidentialité."'
                    : activeAboutYear === 2025 
                      ? '"Preuve de concept validée à la perfection dans des environnements d\'élite à l\'épreuve des plus hautes exigences."'
                      : '"Le cockpit souverain Zaphir devient la référence absolue pour le pilotage technologique des domaines d\'exception."'
                  }
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CONTACT / DEMO REQUEST SECTION */}
        <section 
          id="contact" 
          className="pt-16 border-t border-white/5 max-w-3xl mx-auto space-y-10 pb-12"
          style={{ marginTop: '20px' }}
        >
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#c19a6b] font-bold">05 / PRIVATE ACCESS</span>
            <h2 className="text-3xl font-serif text-slate-100 font-bold tracking-tight">Entrez dans l'ère de l'hospitalité souveraine</h2>
            <p className="text-sm text-slate-400 font-light leading-relaxed max-w-xl mx-auto">
              Complétez ce formulaire confidentiel pour réserver une démonstration personnalisée ou demander des accès privilégiés.
            </p>
          </div>

          <div className="bg-[#0b0e14] border border-[#c19a6b]/20 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Crown className="w-24 h-24 text-[#c19a6b]" />
            </div>

            {success ? (
              <div className="text-center py-6 space-y-6 animate-fade-in max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#c19a6b]/10 border border-[#c19a6b]/30 flex items-center justify-center mx-auto text-[#c19a6b]">
                  <CheckCircle className="w-8 h-8 text-[#c19a6b]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-serif text-slate-100 font-bold">{trans.formSuccessTitle}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {trans.formSuccessText}
                  </p>
                </div>

                {/* BOARDING PASS BOARD CARD */}
                <div className="border border-[#c19a6b]/30 bg-black/60 rounded-2xl p-5 text-left font-mono relative overflow-hidden shadow-2xl">
                  {/* Watermark */}
                  <div className="absolute bottom-2 right-2 text-[50px] font-extrabold text-white/[0.02] tracking-wider pointer-events-none uppercase">
                    ZAPHIR
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[7px] text-[#c19a6b] uppercase tracking-widest block">PASS SECURE PROTOCOL</span>
                      <span className="text-xs text-slate-100 font-serif font-bold">CARTE D'INVITATION PRIVÉE</span>
                    </div>
                    <div className="bg-[#c19a6b]/20 text-[#c19a6b] text-[8px] font-bold px-2 py-0.5 rounded border border-[#c19a6b]/30">
                      VIP CONFIRMED
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 text-[10px] border-b border-white/5">
                    <div className="space-y-1">
                      <span className="text-slate-500 block text-[8px]">INVITÉ :</span>
                      <span className="text-slate-200 font-bold">{formData.name}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 block text-[8px]">ÉTABLISSEMENT :</span>
                      <span className="text-slate-200 font-bold">{formData.hotel || 'Non spécifié'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 block text-[8px]">DATE DEMO :</span>
                      <span className="text-emerald-400 font-bold">{contactDemoDate} ({contactDemoTime})</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 block text-[8px]">LANGUE PROTOCOLE :</span>
                      <span className="text-slate-200 font-bold">{contactDemoLang}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[8px]">CODE D'ACCÈS DU NŒUD :</span>
                      <span className="text-[11px] text-amber-400 font-bold font-mono tracking-wider">{contactInvitationCode}</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(contactInvitationCode);
                        alert("Code d'accès copié dans le presse-papier !");
                      }}
                      className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded transition font-mono inline-block shrink-0"
                    >
                      Copier le Code
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-center gap-4">
                  <button
                    onClick={onEnterDashboard}
                    className="bg-gradient-to-r from-[#c19a6b] to-[#a37c4c] hover:brightness-110 text-white font-mono text-xs uppercase font-extrabold tracking-widest py-3 px-8 rounded-xl transition shadow-lg"
                  >
                    {trans.ctaDashboard}
                  </button>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setFormData({ name: '', email: '', hotel: '', plan: 'PRO', notes: '' });
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-400 border border-white/5 py-3 px-6 rounded-xl text-xs font-mono transition"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6 text-left">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{trans.formName} *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Elena Petrova"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-200 focus:outline-none focus:border-[#c19a6b] focus:ring-1 focus:ring-[#c19a6b]/30 font-mono transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{trans.formEmail} *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="elena@palaceresort.com"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-200 focus:outline-none focus:border-[#c19a6b] focus:ring-1 focus:ring-[#c19a6b]/30 font-mono transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{trans.formHotel}</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={formData.hotel}
                        onChange={(e) => setFormData({...formData, hotel: e.target.value})}
                        placeholder="Chateau Royal Courchevel"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-200 focus:outline-none focus:border-[#c19a6b] focus:ring-1 focus:ring-[#c19a6b]/30 font-mono transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{trans.formPlan}</label>
                    <div className="relative">
                      <Crown className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select 
                        value={formData.plan}
                        onChange={(e) => setFormData({...formData, plan: e.target.value})}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-300 focus:outline-none focus:border-[#c19a6b] font-mono transition"
                      >
                        <option value="STARTER">Starter Plan (399€/m)</option>
                        <option value="PRO">Professional Plan (799€/m)</option>
                        <option value="ENTERPRISE">Enterprise Sovereign Plan</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ADVANCED DEMO SCHEDULER INNER GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-1.5 font-sans">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Date Privilégiée *</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="date" 
                        required
                        value={contactDemoDate}
                        onChange={(e) => setContactDemoDate(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-300 focus:outline-none focus:border-[#c19a6b] font-mono transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 font-sans">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Heure Privilégiée *</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="time" 
                        required
                        value={contactDemoTime}
                        onChange={(e) => setContactDemoTime(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-300 focus:outline-none focus:border-[#c19a6b] font-mono transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 font-sans">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Langue d'Échange</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select 
                        value={contactDemoLang}
                        onChange={(e) => setContactDemoLang(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-300 focus:outline-none focus:border-[#c19a6b] font-mono transition"
                      >
                        <option value="FR">Français (French)</option>
                        <option value="EN">English (English)</option>
                        <option value="RU">Русский (Russian)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 font-sans">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{trans.formNotes}</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="E.g., Private Heliport transponder sync, 24/7 dedicated steward service requested..."
                    rows={4}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-[#c19a6b] focus:ring-1 focus:ring-[#c19a6b]/30 font-mono transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-[#c19a6b] to-[#a37c4c] disabled:opacity-50 hover:brightness-110 text-white font-mono text-xs uppercase font-extrabold tracking-widest rounded-xl transition shadow-[0_4px_20px_rgba(193,154,107,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? "CONFIRMING NODE CONCIERGE..." : trans.formSubmit}</span>
                </button>

              </form>
            )}
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 bg-[#020306]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg tracking-widest font-extrabold text-[#c19a6b] uppercase">ZAPHIR</span>
            <Crown className="w-3.5 h-3.5 text-[#c19a6b]" />
          </div>
          <p className="text-[10px] font-mono text-slate-500">
            © 2026 ZAPHIR SYSTEME INC. SOVEREIGN HOSPITALITY NETWORKS. French Riviera / European Core Nodes.
          </p>
          <div className="flex gap-4 text-[10px] font-mono text-slate-400">
            <button onClick={onEnterDashboard} className="hover:text-[#c19a6b] transition">
              {trans.ctaDashboard}
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-[#c19a6b] font-bold">STATUS: DEPLOYED SECURE</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

// Simple placeholder components for unused lucide icon conflicts
const BookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
    <path d="M6 6h10" />
    <path d="M6 10h10" />
  </svg>
);
