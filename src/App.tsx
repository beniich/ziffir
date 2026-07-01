import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plane, 
  Utensils, 
  Sliders, 
  Layers, 
  Lock, 
  Crown, 
  HardHat, 
  CreditCard,
  Activity,
  RefreshCw,
  Moon,
  Sun,
  Fingerprint,
  Settings,
  X,
  Languages,
  Users,
  Hotel,
  User,
  Globe,
  Mail,
  ChevronLeft,
  Menu,
  Wine
} from 'lucide-react';
import { initAuth, logout, getOrCreateUserProfile } from './firebase';
import { User as FirebaseUser } from 'firebase/auth';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';

// Shared types and tab subcomponents
import { Course, RoomServiceOrder, VaultDocument } from './types';
import { ArrivalsTab } from './components/ArrivalsTab';
import { RoomServiceTab } from './components/RoomServiceTab';
import { ControlsTab } from './components/ControlsTab';
import { ChannelSyncTab } from './components/ChannelSyncTab';
import { VaultTab } from './components/VaultTab';
import { MembershipsTab } from './components/MembershipsTab';
import { MaintenanceTab } from './components/MaintenanceTab';
import { OmniStreamTab } from './components/OmniStreamTab';
import { LedgerTab } from './components/LedgerTab';
import { ManagementTab } from './components/ManagementTab';
import { HospitalityManagerTab } from './components/HospitalityManagerTab';
import { ProfileTab } from './components/ProfileTab';
import { PrestigePortalTab } from './components/PrestigePortalTab';
import DesignSystemShowcase from './components/DesignSystemShowcase';
import { SettingsTab } from './components/SettingsTab';
import { SaaSBillingTab } from './components/SaaSBillingTab';
import { UserManagerSuite } from './components/UserManagerSuite';
import { WineCellarTab } from './components/WineCellarTab';
import { MarketingWebsite } from './components/MarketingWebsite';
import { SaaSCheckoutWall } from './components/SaaSCheckoutWall';
import { AuthWall } from './components/AuthWall';
import { zaphirApi } from './apiClient';

// Cryptographic Simulation Utilities for dynamic chain audit logging
export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  role: string;
  reason: string;
  previousHash: string;
  hash: string;
  status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT';
}

function computeSimpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return '0x' + hex + 'afde9c3b' + Math.abs(hash * 31).toString(16).padEnd(20, '4').slice(0, 20);
}

const INITIAL_AUDITS: AuditEntry[] = [
  {
    id: "LOG-001",
    timestamp: "2026-06-30 08:30:15 AM",
    action: "SYSTEM_BOOT",
    role: "ZAFIR-CORE",
    reason: "Zafir Command Center initialized — production environment online",
    previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
    hash: "0x7b8f9e0c5afde9c3b123d4f6eef050b16",
    status: "AUTHORIZED"
  },
  {
    id: "LOG-002",
    timestamp: "2026-06-30 09:02:44 AM",
    action: "CHECK_IN_CONFIRMED",
    role: "FRONT_DESK",
    reason: "Suite 1801 — Royal Suite — Mr. Al-Rashid & party. Check-in validated via passport scan.",
    previousHash: "0x7b8f9e0c5afde9c3b123d4f6eef050b16",
    hash: "0xc8d9e2a14b301cdfe98eba18274381907cb",
    status: "AUTHORIZED"
  },
  {
    id: "LOG-003",
    timestamp: "2026-06-30 10:15:00 AM",
    action: "SUITE_ACCESS_GRANTED",
    role: "SECURITY",
    reason: "Digital key issued — Suite 2204 — Imperial Suite — Ms. Laurent.",
    previousHash: "0xc8d9e2a14b301cdfe98eba18274381907cb",
    hash: "0xd4ef3c7912b8a0e6f5c290178364b5308ef",
    status: "AUTHORIZED"
  }
];

// Hotel production billing records
const INITIAL_COURSES: Course[] = [
  { code: 'INV-0041', name: 'Royal Suite — 3 nights', category: 'Accommodation', credits: 3, grade: 'PAID', completedDate: '2026-06-28' },
  { code: 'INV-0042', name: 'Sommelier Dinner — Cave des Souverains', category: 'F&B', credits: 1, grade: 'PAID', completedDate: '2026-06-29' },
  { code: 'INV-0043', name: 'Spa Prestige Package', category: 'Wellness', credits: 1, grade: 'PENDING', completedDate: '2026-06-30' },
  { code: 'INV-0044', name: 'Airport Private Transfer — Bentley', category: 'Conciergerie', credits: 1, grade: 'PAID', completedDate: '2026-06-30' },
  { code: 'INV-0045', name: 'Imperial Suite — 5 nights', category: 'Accommodation', credits: 5, grade: 'INVOICED', completedDate: '2026-07-01' },
];

const translations = {
  EN: {
    syncActive: "Secure Network Sync Active",
    tabArrivalsHeader: "Zafir Command Center: Pôle Opérations",
    tabRoomServiceHeader: "Zafir Command Center: Room Service Orders",
    tabControlsHeader: "Zafir Command Center: Suite Command & Intelligence",
    tabChannelSyncHeader: "Zafir Command Center: Pricing & Sync Engine",
    tabVaultHeader: "Zafir Secure Vault & Document Ledger",
    tabMembershipsHeader: "Zafir Elite Club & Sovereign Membership",
    tabMaintenanceHeader: "Zafir Command Center: Facility 3D Maintenance",
    tabOmniStreamHeader: "Zafir Omni Stream: Communication Logs",
    tabLedgerHeader: "Zafir Scholarship Trust & PDF Ledger",
    tabManagementHeader: "Zafir Command Center: Cryptographic Staff & Operations Oversight",
     tabHospitalityHeader: "Zafir Operations Center: Luxury Suites, Kitchen & Stock Manager",
    tabWineCellarHeader: "Zafir Operations Center: La Cave des Souverains & Sommelier AI",
    tabProfileHeader: "Zafir Operations Center: Profile, Cryptographic Credentials & Tables Ledger",
    tabPrestigePortalHeader: "Zafir Grand Portal: Elite Showcase, Genesis & Live Rate Estimator",
    tabDesignShowcaseHeader: "Zaphir Design Lab — Interactive Showcase",
    tabSettingsHeader: "Zafir Command Center: Integrations & Synchronization Parameters",
    tabBillingHeader: "Zafir Cloud System: SaaS Subscriptions & AI Creative Asset Studio",
    tabArrivals: "Arrivals",
    tabRoomService: "Room Service",
    tabControls: "Suite Controls",
    tabChannelSync: "Channel Sync",
    tabVault: "Secure Vault",
    tabMemberships: "Club VIP",
    tabMaintenance: "3D Facility",
    tabOmniStream: "Omni Stream",
    tabLedger: "Academic Ledger",
    tabManagement: "Personnel Matrix",
    tabHospitality: "Hôtellerie & Stocks",
    tabWineCellar: "Sovereign Cellar",
    tabProfile: "Profil & Clés",
    tabPrestigePortal: "Portail Impérial",
    tabDesignShowcase: "Design Lab",
    tabSettings: "Parameters / Sync",
    tabBilling: "SaaS & AI Studio",
    settingsHeading: "Aesthetic Command Deck",
    themeHeading: "Master Base Lightwave",
    themeDark: "Obsidian Dark",
    themeLight: "Champagne Light",
    aestheticHeading: "Atmosphere Aesthetic Engine",
    aestheticStandard: "★ Zafir Luxury (Standard)",
    aestheticCyberpunk: "⚡ Cyberpunk Extrême",
    aestheticLuxury: "⚜ Quiet Luxury Discreet",
    glowHeading: "Dynamic Neon Glow / Parity Pigment",
    securityRoleHeading: "Security Node Role Clearance",
    operator: "Operator (L4)",
    manager: "Proprietor (L5)",
    languageMatrix: "Aesthetic Language Matrix",
    stylesEngine: "ZAFIR CORE STYLES ENGINE v1.4",
    sovereignLive: "Sovereign Alignment Live",
    registry: "REGISTRY",
    overview3d: "3D Overview",
    blueprint2d: "2D Blueprint",
  },
  FR: {
    syncActive: "Synchro Réseau Sécurisée Active",
    tabArrivalsHeader: "Centre de contrôle Zafir : Pôle Opérations",
    tabRoomServiceHeader: "Centre de contrôle Zafir : Service de Chambre",
    tabControlsHeader: "Centre de contrôle Zafir : Contrôle & Intelligence des Suites",
    tabChannelSyncHeader: "Centre de contrôle Zafir : Tarification & Synchronisation",
    tabVaultHeader: "Coffre-fort Sécurisé & Registre de Documents Zafir",
    tabMembershipsHeader: "Adhésion Souveraine & Club Élite Zafir",
    tabMaintenanceHeader: "Centre de contrôle Zafir : Maintenance 3D de l'Installation",
    tabOmniStreamHeader: "Flux Omni Zafir : Journaux de Communication",
    tabLedgerHeader: "Fonds de Secours Zafir & Registre PDF",
    tabManagementHeader: "Centre de contrôle Zafir : Supervision Esthétique du Personnel & Opérations",
    tabHospitalityHeader: "Centre de contrôle Zafir : Gestion Hôtelière, Cuisine & Stocks",
    tabWineCellarHeader: "Centre de contrôle Zafir : La Cave des Souverains & Sommelier AI",
    tabProfileHeader: "Fiche d'Habilitation : Profil, Clés Cryptographiques & Gestion de Tables",
    tabPrestigePortalHeader: "Portail Impérial : Vitrine d'Élite, Histoire & Simulateur de Tarifs",
    tabDesignShowcaseHeader: "Laboratoire de design Zaphir — Showcase Interactif",
    tabSettingsHeader: "Centre de contrôle Zafir : Intégrations & Paramètres Système",
    tabBillingHeader: "Système Cloud Zafir : Abonnements SaaS & Studio de création IA",
    tabArrivals: "Arrivées",
    tabRoomService: "Service de Chambre",
    tabControls: "Contrôles Suite",
    tabChannelSync: "Synchro Canaux",
    tabVault: "Coffre Fort",
    tabMemberships: "Club VIP",
    tabMaintenance: "Maintenance 3D",
    tabOmniStream: "Flux Omni",
    tabLedger: "Registre Académique",
    tabManagement: "Supervision",
    tabHospitality: "Hôtellerie & Stocks",
    tabWineCellar: "Cave des Souverains",
    tabProfile: "Profil & Clés",
    tabPrestigePortal: "Portail Impérial",
    tabDesignShowcase: "Design Lab",
    tabSettings: "Paramètres / Sync",
    tabBilling: "SaaS & Studio IA",
    settingsHeading: "Pont de Commande Esthétique",
    themeHeading: "Onde Lumineuse Principale",
    themeDark: "Obsidienne Sombre",
    themeLight: "Champagne Clair",
    aestheticHeading: "Moteur Esthétique d'Atmosphère",
    aestheticStandard: "★ Luxe Zafir (Standard)",
    aestheticCyberpunk: "⚡ Cyberpunk Extrême",
    aestheticLuxury: "⚜ Quiet Luxury Discret",
    glowHeading: "Lueur Néon Dynamique / Pigment de Parité",
    securityRoleHeading: "Habilitation de Sécurité du Nœud",
    operator: "Opérateur (L4)",
    manager: "Propriétaire (L5)",
    languageMatrix: "Linguistic Matrix Esthétique",
    stylesEngine: "MOTEUR DE STYLES ZAFIR v1.4",
    sovereignLive: "Alignement Souverain Actif",
    registry: "REGISTRE",
    overview3d: "Aperçu 3D",
    blueprint2d: "Plan 2D",
  },
  RU: {
    syncActive: "Безопасная синхронизация сети активна",
    tabArrivalsHeader: "Командный центр Zafir: Операционный отдел",
    tabRoomServiceHeader: "Командный центр Zafir: Заказы обслуживания номеров",
    tabControlsHeader: "Командный центр Zafir: Управление и интеллект номеров",
    tabChannelSyncHeader: "Командный центр Zafir: Инструмент синхронизации цен",
    tabVaultHeader: "Безопасное хранилище Zafir и реестр документов",
    tabMembershipsHeader: "Элитный клуб Zafir и суверенное членство",
    tabMaintenanceHeader: "Командный центр Zafir: 3D техническое обслуживание",
    tabOmniStreamHeader: "Омни Поток Zafir: Журнал связи",
    tabLedgerHeader: "Стипендиальный фонд Zafir и реестр PDF",
    tabManagementHeader: "Командный центр Zafir: Наблюдение за Персоналом и Операциями",
    tabHospitalityHeader: "Командный центр Zafir: Управление Номерами, Кухней и Складом",
    tabWineCellarHeader: "Командный центр Zafir: Императорская винная коллекция и Сомелье ИИ",
    tabProfileHeader: "Профиль Оператора: Права Доступа, Биометрические Ключи и Базы Таблиц",
    tabPrestigePortalHeader: "Императорский Портал: Элитная Витрина, История и Калькулятор Тарифов",
    tabDesignShowcaseHeader: "Дизайн-лаборатория Zaphir — Интерактивный показ",
    tabSettingsHeader: "Панель Управления Zafir: Параметры Синхронизации",
    tabBillingHeader: "Облачная система Zafir: Подписки SaaS и Мультимедийная студия ИИ",
    tabArrivals: "Прибытие",
    tabRoomService: "Обслуживание",
    tabControls: "Пульт Управления",
    tabChannelSync: "Синхронизация",
    tabVault: "Безопасный Сейф",
    tabMemberships: "VIP Клуб",
    tabMaintenance: "3D Обслуживание",
    tabOmniStream: "Омни Поток",
    tabLedger: "Учебный Реестр",
    tabManagement: "Наблюдение",
    tabHospitality: "Управление & Склад",
    tabWineCellar: "Винный Погреб",
    tabProfile: "Профиль & Ключи",
    tabPrestigePortal: "Имперский Портал",
    tabDesignShowcase: "Дизайн-лаб",
    tabSettings: "Параметры / Синх",
    tabBilling: "SaaS & ИИ Студия",
    settingsHeading: "Эстетическая командная панель",
    themeHeading: "Основная световая волна",
    themeDark: "Обсидиановая тьма",
    themeLight: "Светлое шампанское",
    aestheticHeading: "Эстетический двигатель атмосферы",
    aestheticStandard: "★ Роскошь Zafir (Стандарт)",
    aestheticCyberpunk: "⚡ Киберпанк Экстрим",
    aestheticLuxury: "⚜ Спокойная роскошь",
    glowHeading: "Динамический неон / Пигмент паритета",
    securityRoleHeading: "Разрешение роли узла безопасности",
    operator: "Оператор (L4)",
    manager: "Владелец (L5)",
    languageMatrix: "Эстетическая матрица языка",
    stylesEngine: "ОСНОВНОЙ СТИЛЕВОЙ ДВИГАТЕЛЬ v1.4",
    sovereignLive: "Суверенное выравнивание активно",
    registry: "РЕЕСТР",
    overview3d: "3D Обзор",
    blueprint2d: "2D Чертеж",
  }
};

const TAB_CLEARANCE: Record<string, ('administrateur' | 'client' | 'hotel')[]> = {
  'prestige-portal': ['administrateur', 'client', 'hotel'],
  'arrivals': ['administrateur', 'hotel'],
  'room-service': ['administrateur', 'client', 'hotel'],
  'controls': ['administrateur'],
  'channel-sync': ['administrateur'],
  'vault': ['administrateur'],
  'memberships': ['administrateur'],
  'billing': ['administrateur'],
  'maintenance': ['administrateur', 'hotel'],
  'omni-stream': ['administrateur'],
  'ledger': ['administrateur', 'hotel'],
  'management': ['administrateur'],
  'user-directory': ['administrateur'],
  'hospitality-manager': ['administrateur', 'hotel'],
  'wine-cellar': ['administrateur', 'hotel'],
  'profile': ['administrateur', 'hotel'],
  'settings': ['administrateur', 'client', 'hotel'],
  'design-showcase': ['administrateur']
};

export default function App() {
  const [viewMode, setViewMode] = useState<'website' | 'dashboard'>('website');
  const [activeTab, setActiveTab ] = useState<'arrivals' | 'room-service' | 'controls' | 'channel-sync' | 'vault' | 'memberships' | 'maintenance' | 'omni-stream' | 'ledger' | 'management' | 'hospitality-manager' | 'wine-cellar' | 'profile' | 'prestige-portal' | 'design-showcase' | 'settings' | 'billing' | 'user-directory'>('prestige-portal');
  const [sessionRole, setSessionRole] = useState<'administrateur' | 'client' | 'hotel'>('administrateur');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'FR' | 'RU'>('EN');

  const t = (key: keyof typeof translations['EN']) => {
    return translations[language][key] || translations['EN'][key] || '';
  };

  // Dynamic 5 Styles and 5 RBAC options state!
  const [styleMode, setStyleMode] = useState<'standard' | 'cyberpunk' | 'luxury'>('standard');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [colorScheme, setColorScheme] = useState<'gold' | 'sapphire' | 'emerald' | 'sunset'>('gold');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(INITIAL_AUDITS);


  // Student details
  const [studentName, setStudentName] = useState<string>('Invité / Guest');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(() => {
    return localStorage.getItem('sapphir_has_active_subscription') === 'true';
  });


  useEffect(() => {
    const handleAuthError = () => {
      // Zaphir API rejected token
      setCurrentUser(null);
    };
    window.addEventListener('zaphir-unauthorized', handleAuthError);

    if (currentUser && hasActiveSubscription) {
      setIsLoadingBackend(true);
      zaphirApi.get('/state')
        .then((data: any) => {
          if (data.arrivals?.vipGuests) setVipGuests(data.arrivals.vipGuests);
          if (data.roomService?.roomOrders) setRoomOrders(data.roomService.roomOrders);
          if (data.suiteControls?.currentTemp) setCurrentTemp(data.suiteControls.currentTemp);
          if (data.suiteControls?.targetTemp) setTargetTemp(data.suiteControls.targetTemp);
          // And so on for other modules...
        })
        .catch(console.error)
        .finally(() => setIsLoadingBackend(false));
    }
    
    return () => {
      window.removeEventListener('zaphir-unauthorized', handleAuthError);
    };
  }, [currentUser, hasActiveSubscription]);

  useEffect(() => {
    const unsubscribe = initAuth(
      async (user) => {
        setCurrentUser(user);
        if (user) {
          setStudentName(user.displayName || user.email?.split('@')[0] || 'Utilisateur');
          try {
            const role = await getOrCreateUserProfile(user);
            setSessionRole(role);
          } catch (err) {
            console.error('Failed to sync profile role:', err);
          }
        }
      },
      () => {
        setCurrentUser(null);
        setSessionRole('client'); // Default fallback on logout
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [studentId] = useState<string>('ZFR-2026-0001');
  const [dob] = useState<string>('—');
  const [major] = useState<string>('Luxury Hospitality Operations');
  const [blockchainId] = useState<string>('0x89C...D4AF');
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);

  // Tab State Handlers
  
  // Helper to add audit logs dynamically
  const addAuditLog = (action: string, reason: string, status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT', roleStr: string = sessionRole.toUpperCase()) => {
    const lastEntry = auditLogs[auditLogs.length - 1] || INITIAL_AUDITS[INITIAL_AUDITS.length - 1];
    const prevHash = lastEntry ? lastEntry.hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const timestampStr = new Date().toLocaleString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    }).replace(',', '');
    
    const id = `LOG-${String(auditLogs.length + 1).padStart(3, '0')}`;
    const stringToHash = `${prevHash}-${action}-${id}-${timestampStr}-${reason}`;
    const newHash = computeSimpleHash(stringToHash);

    const newEntry: AuditEntry = {
      id,
      timestamp: timestampStr,
      action,
      role: roleStr,
      reason,
      previousHash: prevHash,
      hash: newHash,
      status
    };

    setAuditLogs(prev => [...prev, newEntry]);
  };


  // Try to access a tab
  const navigateToTab = (tab: 'arrivals' | 'room-service' | 'controls' | 'channel-sync' | 'vault' | 'memberships' | 'maintenance' | 'omni-stream' | 'ledger' | 'management' | 'hospitality-manager' | 'wine-cellar' | 'profile' | 'prestige-portal' | 'design-showcase' | 'settings' | 'billing' | 'user-directory') => {
    setActiveTab(tab);
  };

  // 1. ARRIVALS DATA
  const [vipGuests, setVipGuests] = useState([
    { id: 'GST-101', name: 'Mr. Chen & Family', vip: 'VIP GOLD', status: 'En route animate-pulse', info: 'Limo Pickup in 20m', flight: 'Flight BA245 / LHR-JFK', serviceLevel: 'VIP', totalSpend: 15400, checkInDate: '2026-06-18' },
    { id: 'GST-102', name: 'Ms. Al-Fayed', vip: 'VIP PLATINUM', status: 'Landed', info: 'Arrived at Terminal 4 / Chauffeur en route', flight: 'Flight Emirates EM5 / DXB-JFK', serviceLevel: 'ROYAL', totalSpend: 28500, checkInDate: '2026-06-19' },
    { id: 'GST-103', name: 'Dr. Rossi', vip: 'VIP BRONZE', status: 'In-flight', info: 'Estimated arrival 2h 15m', flight: 'Flight AF112 / CDG-JFK', serviceLevel: 'EXECUTIVE', totalSpend: 7900, checkInDate: '2026-06-20' }
  ]);
  const flights = [
    { id: 'BA245', status: 'On Time', time: '11:15 AM' },
    { id: 'AF112', status: 'Delayed 15m', time: '12:45 PM' },
    { id: 'EM5', status: 'Landed', time: '09:50 AM' }
  ];

  // 2. ROOM SERVICE ORDERS
  const [roomOrders, setRoomOrders] = useState<RoomServiceOrder[]>([
    { id: 'order-1', guest: 'Mr. Chen & Family', room: 'Suite 201', details: 'Gourmet French Breakfast platter, freshly pressed organic orange juice', status: 'Quality Check', imgUrl: '' },
    { id: 'order-2', guest: 'Ms. Al-Fayed', room: 'Suite 202', details: 'Chef Selection Premium Sushi platter, Wagyu Beef skewers', status: 'Quality Check', imgUrl: '' },
    { id: 'order-3', guest: 'Dr. Rossi', room: 'Suite 203', details: 'Dry Standard Ribeye Steak, Truffle fries, Barolo Reserve wine', status: 'Quality Check', imgUrl: '' },
    { id: 'order-4', guest: 'Al Gtore', room: 'Villa 1', details: 'Gourmet Buttermilk Pancakes, Canadian maple syrup, hot espresso', status: 'Preparation', imgUrl: '' },
    { id: 'order-5', guest: 'Contarah', room: 'Villa 2', details: 'Traditional Premium Angus Beef burger, gold leaf garnish', status: 'Quality Check', imgUrl: '' },
    { id: 'order-6', guest: 'Fonuhery', room: 'Suite 304', details: 'Fettuccine Vongole with fresh Mediterranean clams, Pinot Grigio', status: 'Quality Check', imgUrl: '' }
  ]);

  const advanceOrderStatus = (id: string) => {
    setRoomOrders(prev => prev.map(order => {
      if (order.id !== id) return order;
      const statusMap: Record<RoomServiceOrder['status'], RoomServiceOrder['status']> = {
        'Preparation': 'Quality Check',
        'Quality Check': 'Out for Delivery',
        'Out for Delivery': 'Delivered',
        'Delivered': 'Preparation'
      };
      return { ...order, status: statusMap[order.status] };
    }));
    confetti({ particleCount: 15, spread: 35, colors: ['#c19a6b', '#ffffff'] });
  };

  // 3. ENVIRONMENTAL SUITE COMMAND CONTROLS
  const [lightScene, setLightScene] = useState<'ambient' | 'bright' | 'relax' | 'night'>('ambient');
  const [currentTemp, setCurrentTemp] = useState(22);
  const [targetTemp, setTargetTemp] = useState(23);
  const [glassOpacity, setGlassOpacity] = useState(65);
  const [glowingRooms, setGlowingRooms] = useState<Record<string, boolean>>({
    '201': true,
    '202': false,
    '203': true,
    'corridor': true,
    'meeting': false
  });

  const toggleRoomGlow = (room: string) => {
    setGlowingRooms(prev => ({ ...prev, [room]: !prev[room] }));
  };

  // 4. CHANNEL MANAGER PRICE SYNCHRONIZER
  const channels = [
    { name: 'Booking.com', status: 'Synced', iconColor: 'bg-emerald-500' },
    { name: 'Expedia.com', status: 'Synced', iconColor: 'bg-emerald-500' },
    { name: 'Airbnb Luxury', status: 'Pending', iconColor: 'bg-amber-400 animate-pulse' },
    { name: 'Direct Zafir', status: 'Synced', iconColor: 'bg-emerald-500' }
  ];
  const syncLogs = [
    '01:59 AM - Channel Booking.com price parity audit completed',
    '01:59 AM - Expedia price update distributed successfully',
    '01:53 AM - Airbnb API availability handshake verified',
    '01:53 AM - Direct portal local server cache sync updated'
  ];

  // 5. SECURE VAULT ACCESS CONTROL
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([
    { id: '1', name: 'Zafir_Acquisition_Contract_2024.pdf', encrypted: true, decrypting: false, progress: 0, securityLevel: 'VIP Elite Class V' },
    { id: '2', name: 'Global_Merger_Sovereign_Agreement_X89.docx', encrypted: true, decrypting: false, progress: 0, securityLevel: 'Presidential Clearance' },
    { id: '3', name: 'Strategic_Sovereign_Financial_Report_Q3.xlsx', encrypted: true, decrypting: false, progress: 0, securityLevel: 'Secretariat Level IV' }
  ]);

  const handleDecrypt = (id: string) => {
    setVaultDocs(prev => prev.map(doc => {
      if (doc.id === id) {
        return { ...doc, decrypting: true };
      }
      return doc;
    }));
  };

  useEffect(() => {
    const activeDecrypting = vaultDocs.find(d => d.decrypting);
    if (!activeDecrypting) return;

    const interval = setInterval(() => {
      setVaultDocs(prev => prev.map(doc => {
        if (doc.decrypting) {
          const nextProgress = doc.progress + 20;
          if (nextProgress >= 100) {
            return { ...doc, progress: 100, encrypted: false, decrypting: false };
          }
          return { ...doc, progress: nextProgress };
        }
        return doc;
      }));
    }, 400);

    return () => clearInterval(interval);
  }, [vaultDocs]);

  // GPA calculations
  const totalCredits = courses.reduce((acc, curr) => acc + curr.credits, 0);
  const totalGPA = (() => {
    const gradePoints: Record<string, number> = {
      'A+': 4.3, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'F': 0.0
    };
    let totalGradeVal = 0;
    let totalCredsCount = 0;
    courses.forEach(c => {
      totalGradeVal += (gradePoints[c.grade] || 4.0) * c.credits;
      totalCredsCount += c.credits;
    });
    return totalCredsCount > 0 ? (totalGradeVal / totalCredsCount).toFixed(2) : '4.00';
  })();

  // 6. QR CODE & VERIFICATION CODES HANDLERS
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const queryParams = new URLSearchParams();
    queryParams.set('verify', 'true');
    queryParams.set('student', studentName);
    queryParams.set('id', studentId);
    queryParams.set('gpa', totalGPA);
    queryParams.set('credits', totalCredits.toFixed(1));
    queryParams.set('courses', courses.length.toString());
    queryParams.set('hash', blockchainId);

    const checkUrl = `${window.location.origin}${window.location.pathname}?${queryParams.toString()}`;

    QRCode.toDataURL(checkUrl, {
      margin: 1,
      width: 250,
      color: {
        dark: '#c19a6b', // Camel QR Code color pattern matching the brand identity!
        light: '#050b16' // Midnight deep navy background
      }
    })
    .then(url => {
      setQrCodeUrl(url);
    })
    .catch(err => {
      console.error('Error generating Camel QR verification code', err);
    });
  }, [courses, totalGPA, totalCredits, studentName, studentId, blockchainId]);

  // Course additions
  const addCourse = (course: Course) => {
    setCourses(prev => [...prev, course]);
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#c19a6b', '#ffffff', '#0c1b33']
    });
  };

  const removeCourse = (code: string) => {
    setCourses(prev => prev.filter(c => c.code !== code));
  };

  // HIGHEST FIDELITY Signed PDF Generator with Navy/Camel styling
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const exportPDF = async () => {
    setIsGenerating(true);
    setGenerationStep('Assembling cryptographic block variables...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setGenerationStep('Aligning authorized seal from Dean Alistair Vance...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const doc = new jsPDF();
      
      // Page frame matching Navy & Camel
      doc.setDrawColor(193, 154, 107); // Camel
      doc.setLineWidth(1.0);
      doc.rect(8, 8, 194, 281);

      doc.setDrawColor(12, 27, 51); // Navy Outline
      doc.setLineWidth(0.2);
      doc.rect(10, 10, 190, 277);

      // Header Block
      doc.setFillColor(12, 27, 51); // Heavy Navy block
      doc.rect(12, 12, 186, 32, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text("ZAFIR ELITE COMMAND ACADEMY", 105, 24, { align: 'center' });
      
      doc.setTextColor(193, 154, 107); // Camel gold tint text
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text("Registry Hub & permanent decentralized credentials ledger", 105, 31, { align: 'center' });

      // Title
      doc.setTextColor(12, 27, 51);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(15);
      doc.text("OFFICIAL REGISTERED TRANSCRIPT", 105, 56, { align: 'center' });

      // Info Table
      doc.setFillColor(245, 230, 211); // Camel light backdrop tint
      doc.rect(15, 66, 180, 36, 'F');

      doc.setTextColor(12, 27, 51);
      doc.setFontSize(9);
      doc.text("STUDENT LEGAL NAME:", 18, 73);
      doc.text(studentName.toUpperCase(), 64, 73);

      doc.text("ACADEMIC MAJOR:", 18, 80);
      doc.text(major, 64, 80);

      doc.text("DATE OF BIRTH:", 18, 87);
      doc.text(dob, 64, 87);

      doc.text("GPA CUMULATIVE:", 120, 73);
      doc.text(`${totalGPA} / 4.30`, 160, 73);

      doc.text("BLOCKCHAIN ROOT:", 120, 80);
      doc.text(blockchainId, 160, 80);

      // Complete Table Header
      doc.setFillColor(12, 27, 51);
      doc.rect(15, 110, 180, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.text("CODE", 18, 115.5);
      doc.text("MODULE TITLE", 38, 115.5);
      doc.text("CREDITS", 144, 115.5);
      doc.text("GRADE", 174, 115.5);

      let yOffset = 118;
      doc.setTextColor('#1E293B');
      courses.forEach((course) => {
        doc.text(course.code, 18, yOffset + 5.5);
        doc.text(course.name, 38, yOffset + 5.5);
        doc.text(course.credits.toFixed(1), 144, yOffset + 5.5);
        doc.text(course.grade, 174, yOffset + 5.5);
        yOffset += 8;
      });

      // Signature seals
      const sigY = yOffset + 16;
      doc.setDrawColor(193, 154, 107);
      doc.circle(45, sigY + 16, 18);
      doc.text("ZAFIR OFFICIAL", 45, sigY + 14, { align: 'center' });
      doc.text("AUTHORIZED", 45, sigY + 19, { align: 'center' });

      doc.line(100, sigY + 16, 180, sigY + 16);
      doc.text("Dr. Alistair Vance, Dean of Academic Registry", 100, sigY + 21);

      doc.save(`Zafir_Official_Ledger_${studentName.replace(' ', '_')}.pdf`);
      
      confetti({
        particleCount: 100,
        spread: 85,
        colors: ['#c19a6b', '#ffffff']
      });

    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const [showSettings, setShowSettings] = useState(false);

  // Dynamic CSS variables injected on render corresponding to custom theme parameters
  const getDynamicStyles = () => {
    const styles: Record<string, string> = {};
    if (colorScheme === 'gold') {
      styles['--accent-color'] = '#c19a6b';
      styles['--accent-rgb'] = '193, 154, 107';
    } else if (colorScheme === 'sapphire') {
      styles['--accent-color'] = '#3b82f6';
      styles['--accent-rgb'] = '59, 130, 246';
    } else if (colorScheme === 'emerald') {
      styles['--accent-color'] = '#10b981';
      styles['--accent-rgb'] = '16, 185, 129';
    } else if (colorScheme === 'sunset') {
      styles['--accent-color'] = '#f97316';
      styles['--accent-rgb'] = '249, 115, 22';
    }
    return styles as React.CSSProperties;
  };

  // Render Lock Screen for Session Roles with insufficient clearance
  const renderSessionRoleLockScreen = (tab: string) => {
    const allowed = TAB_CLEARANCE[tab] || ['administrateur'];
    return (
      <div 
        className={`p-10 rounded-3xl text-center flex flex-col items-center justify-center space-y-6 relative overflow-hidden transition-all duration-300 border-2 max-w-4xl mx-auto shadow-lg ${
          themeMode === 'light' ? 'bg-[#fcfaf2]/95 border-stone-200 text-stone-900 shadow-[0_0_15px_rgba(0,0,0,0.05)]' : 'bg-obsidian-900/90 border-stone-800 text-stone-100'
        }`}
        style={{ minHeight: '480px' }}
      >
        <div className="absolute inset-0 bg-[#c19a6b]/5 opacity-10 pointer-events-none" />
        
        <div className="w-20 h-20 rounded-full bg-amber-500/15 border-2 border-[#c19a6b] flex items-center justify-center text-[#7c5a30] animate-pulse">
          <Lock className="w-10 h-10 stroke-[2.5]" />
        </div>
        
        <div className="space-y-3 max-w-lg">
          <h2 className="text-2xl font-serif-luxury font-bold text-[#7c5a30] tracking-wide">
            {language === 'FR' ? "Accès Restreint au Profil" : language === 'RU' ? "Доступ Ограничен" : "Access Denied by Session Profile"}
          </h2>
          <p className="text-xs font-mono text-slate-500 font-bold uppercase tracking-widest">
            {language === 'FR' ? "L'HABILITATION DU COMPTE ACTIF EST INSUFFISANTE" : language === 'RU' ? "НЕДОСТАТОЧНО ПРАВ ПОЛЬЗОВАТЕЛЯ" : "SECURITY CLEARANCE RECONNAISSANCE REJECTED"}
          </p>
          <div className="bg-black border-2 border-stone-850 rounded-2xl p-5 my-4 font-mono text-[11px] text-left text-slate-300 shadow-inner space-y-2">
            <p className="text-[#c19a6b] font-bold">// SECURE LEDGER STATUS ENFORCEMENT:</p>
            <p><span className="text-slate-400">Target Segment:</span> {tab.toUpperCase()}_v1</p>
            <p><span className="text-slate-400">Your Session Role:</span> <span className="text-red-400 font-bold uppercase">{sessionRole}</span></p>
            <p><span className="text-slate-400">Required Authorities:</span> <span className="text-emerald-400 font-bold uppercase">{allowed.join(' • ')}</span></p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            {language === 'FR' 
              ? "Vous pouvez alterner de profil d'habilitation simulé (Administrateur, Hôtel, Client) à tout moment en cliquant sur votre profil dans l'en-tête (en haut à droite)."
              : language === 'RU'
                ? "Вы можете переключить симулируемую роль сессии (Администратор, Отель, Клиент) в любой момент, кликнув на профиль в правом верхнем углу."
                : "You can transition your simulated session profile (Administrateur, Hotel, Client) at any instant by clicking on the Profile Dropdown menu in the top right header."}
          </p>
        </div>
      </div>
    );
  };



  // Render Drawer with Aesthetic/Role options
  const renderSettingsDrawer = () => {
    if (!showSettings) return null;
    return (
      <div className="fixed inset-y-0 right-0 w-80 max-w-full bg-black/95 backdrop-blur-md border-l-2 border-stone-850 shadow-[0_0_35px_rgba(0,0,0,0.9)] z-50 p-5 sm:p-6 flex flex-col justify-between animate-fade-in text-stone-100">
        <div className="space-y-5 overflow-y-auto max-h-[85vh] scrollbar-none pr-1">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#c19a6b] flex items-center gap-2">
              <Settings className="w-4 h-4 animate-spin-slow" /> {t('settingsHeading')}
            </h3>
            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Theme Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
              {t('themeHeading')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setThemeMode('dark');
                  addAuditLog('THEME_RECALIBRATION', 'Switched master lightwave back into Deep Cosmic Obsidian Dark mode.', 'AUTHORIZED');
                }}
                className={`py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1 border-2 ${
                  themeMode === 'dark'
                    ? 'bg-black border-[#c19a6b] text-[#c19a6b]'
                    : 'bg-stone-900 border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> {t('themeDark')}
              </button>
              <button
                onClick={() => {
                  setThemeMode('light');
                  addAuditLog('THEME_RECALIBRATION', 'Calibrated master lightwave into Champagne Light mode.', 'AUTHORIZED');
                }}
                className={`py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1 border-2 ${
                  themeMode === 'light'
                    ? 'bg-white border-black text-black'
                    : 'bg-stone-900 border-transparent text-stone-400 hover:text-stone-100'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" /> {t('themeLight')}
              </button>
            </div>
          </div>

          {/* 2. Visual Style Presets (5 Styles options) */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
              {t('aestheticHeading')}
            </label>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setStyleMode('standard');
                  addAuditLog('AESTHETIC_RECONFIG', 'Restored Zafir Command standard luxury visual layouts.', 'AUTHORIZED');
                }}
                className={`p-2.5 rounded-xl border-2 text-left text-xs font-mono font-bold flex justify-between items-center ${
                  styleMode === 'standard' 
                    ? 'bg-black border-[#c19a6b] text-[#c19a6b]' 
                    : 'bg-stone-900 border-transparent text-slate-300 hover:bg-stone-850'
                }`}
              >
                <span>{t('aestheticStandard')}</span>
                <span className="text-[9px] bg-[#c19a6b]/20 px-1.5 py-0.5 rounded text-[#c19a6b]">ACTIVE</span>
              </button>

              <button
                onClick={() => {
                  setStyleMode('cyberpunk');
                  addAuditLog('AESTHETIC_RECONFIG', 'Forced Cyberpunk Extrême mode. Active CRT scanlines, flicker & cyan neon spikes.', 'AUTHORIZED');
                }}
                className={`p-2.5 rounded-xl border-2 text-left text-xs font-mono font-bold flex justify-between items-center ${
                  styleMode === 'cyberpunk' 
                    ? 'bg-black border-[#00ffff] text-[#00ffff]' 
                    : 'bg-stone-900 border-transparent text-slate-300 hover:bg-stone-850'
                }`}
              >
                <span>{t('aestheticCyberpunk')}</span>
                <span className="text-[9px] bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-400">NEON</span>
              </button>

              <button
                onClick={() => {
                  setStyleMode('luxury');
                  addAuditLog('AESTHETIC_RECONFIG', 'Adopted Quiet Luxury style: thin Georgia serifs with muted borders.', 'AUTHORIZED');
                }}
                className={`p-2.5 rounded-xl border-2 text-left text-xs font-mono font-bold flex justify-between items-center ${
                  styleMode === 'luxury' 
                    ? 'bg-black border-[#ffd700] text-[#ffd700]' 
                    : 'bg-stone-900 border-transparent text-slate-300 hover:bg-stone-850'
                }`}
              >
                <span>{t('aestheticLuxury')}</span>
                <span className="text-[9px] bg-yellow-500/10 px-1.5 py-0.5 rounded text-yellow-300">ESTATE</span>
              </button>
            </div>
          </div>

          {/* 3. Gem Accent Light Options */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
              {t('glowHeading')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'gold', code: '#c19a6b', label: 'Gold' },
                { name: 'sapphire', code: '#3b82f6', label: 'Sapphire' },
                { name: 'emerald', code: '#10b981', label: 'Forest' },
                { name: 'sunset', code: '#f97316', label: 'Riviera' },
              ].map(gem => (
                <button
                  key={gem.name}
                  onClick={() => {
                    setColorScheme(gem.name as any);
                    addAuditLog('GLOW_PIGMENT_RECALIBRATION', `Adjusted parity pigment lightwave to ${gem.label.toUpperCase()}.`, 'AUTHORIZED');
                  }}
                  className={`flex flex-col items-center gap-1 p-1 py-2 rounded-xl border-2 transition ${
                    colorScheme === gem.name ? 'bg-black border-[#c19a6b]' : 'bg-stone-900 border-transparent hover:bg-stone-850'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: gem.code, boxShadow: `0 0 10px ${gem.code}` }} />
                  <span className="text-[8px] font-mono uppercase text-stone-400 font-bold">{gem.label}</span>
                </button>
              ))}
            </div>
          </div>



          {/* 5. Aesthetic Language Matrix */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1 font-bold">
              <Languages className="w-3.5 h-3.5 text-[#c19a6b]" /> {t('languageMatrix')}
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-black p-1 rounded-xl border-2 border-stone-950">
              {[
                { code: 'EN', name: 'English', flag: '🇬🇧' },
                { code: 'FR', name: 'Français', flag: '🇫🇷' },
                { code: 'RU', name: 'Русский', flag: '🇷🇺' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as any);
                    addAuditLog('LANGUAGE_RECONSTITUTE', `Switched application linguistic framework to ${lang.name.toUpperCase()}.`, 'AUTHORIZED');
                    confetti({ particleCount: 15, spread: 30 });
                  }}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition flex flex-col items-center justify-center border-2 ${
                    language === lang.code
                      ? 'bg-black border-[#c19a6b] text-[#c19a6b] font-bold'
                      : 'bg-stone-900 border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                  }`}
                >
                  <span className="text-[11px] mb-0.5">{lang.flag}</span>
                  <span className="text-[9px] uppercase tracking-wider">{lang.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-850 text-center font-mono text-[9px] text-stone-500">
          <p>{t('stylesEngine')}</p>
          <p className="text-[#c19a6b]">{t('sovereignLive')}</p>
        </div>
      </div>
    );
  };

  const emailHasDigits = currentUser?.email ? /\d/.test(currentUser.email) : false;

  if (viewMode === 'website') {
    return (
      <MarketingWebsite
        language={language}
        onEnterDashboard={() => {
          setViewMode('dashboard');
          addAuditLog('ENTERED_DASHBOARD', 'Navigated from public landing page to secure system dashboard cockpit.', 'AUTHORIZED');
        }}
      />
    );
  }

  // REQUIRE AUTHENTICATION WALL BEFORE CHECKOUT
  if (!currentUser) {
    return (
      <AuthWall
        themeMode={themeMode}
        language={language}
        onAuthSuccess={async (user) => {
          const token = typeof (user as FirebaseUser).getIdToken === 'function' 
            ? await (user as FirebaseUser).getIdToken() 
            : await (user as any).getToken?.();
          
          if (token) {
            zaphirApi.setToken(token);
          }
          
          setCurrentUser(user as FirebaseUser);
          addAuditLog('AUTH_SUCCESS', `User authenticated successfully: ${user.email}`, 'AUTHORIZED');
        }}
        onBackToWebsite={() => {
          setViewMode('website');
        }}
      />
    );
  }

  // REQUIRE PAYMENT ACCESS WALL BEFORE DASHBOARD IS ENTERED
  if (!hasActiveSubscription) {
    return (
      <SaaSCheckoutWall
        themeMode={themeMode}
        language={language}
        onPaymentSuccess={(chosenPlan) => {
          setHasActiveSubscription(true);
          addAuditLog('PAYMENT_AUTHORIZED', `Completed Stripe transaction sandbox payload. Assigned to ${chosenPlan} tier.`, 'AUTHORIZED');
        }}
        onBackToWebsite={() => {
          setViewMode('website');
        }}
      />
    );
  }

  if (isLoadingBackend) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian-950 text-[#c19a6b] font-mono text-sm tracking-widest uppercase">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#c19a6b]/20 border-t-[#c19a6b] rounded-full animate-spin"></div>
          <div>Establishing Secure Handshake...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={getDynamicStyles()}
      className={`min-h-screen flex flex-col relative selection:bg-[#c19a6b]/30 selection:text-[#7c5a30] transition-colors duration-300 ${
        themeMode === 'light' ? 'bg-[#faf7f0] text-stone-900 border-[#0a0a0c]' : 'bg-obsidian-950 text-slate-100 dark'
      } ${
        styleMode === 'cyberpunk' ? 'font-mono text-cyan-400 font-bold cyberpunk-extreme' : 
        styleMode === 'luxury' ? 'font-serif text-stone-900 tracking-wide font-light' : 'font-sans'
      }`}
    >
      
      {/* BACKGROUNDS FOR LIGHT AND DARK MODES */}
      {themeMode === 'dark' ? (
        <>
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 opacity-40 transition-opacity duration-300" 
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2600&q=85')",
              transform: "scale(1.02)",
              filter: "blur(5px) brightness(0.6) contrast(1.1)"
            }} 
          />
          {/* Neon scanlines overlay for cyberpunk dark mode */}
          {styleMode === 'cyberpunk' && (
            <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-0 opacity-40 animate-pulse" />
          )}
          <div className="fixed inset-0 bg-gradient-to-tr from-obsidian-950 via-obsidian-900/95 to-obsidian-950/90 pointer-events-none z-0" />
          <div className="fixed inset-0 bg-[radial-gradient(#c19a6b_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none z-0" />
        </>
      ) : (
        <>
          <div className="fixed inset-0 bg-gradient-to-tr from-[#ede4d2]/35 via-[#faf8f4]/60 to-[#ffffff]/90 pointer-events-none z-0" />
          <div className="fixed inset-0 bg-[radial-gradient(#c19a6b_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none z-0" />
        </>
      )}

      {/* Floating Settings Button in bottom-right corner */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-black border-2 border-stone-800 shadow-[0_0_15px_rgba(193,154,107,0.85)] text-[#c19a6b] hover:text-white hover:scale-110 active:scale-95 transition-all duration-200"
        title="Custom Sovereign Aesthetics Deck"
      >
        <Settings className="w-5.5 h-5.5 animate-[spin_10s_linear_infinite]" />
      </button>

      {/* Drawers and modals renderers */}
      {renderSettingsDrawer()}


      {/* TOP BRADING HEADER BAR */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-40 shadow-sm relative transition-all duration-300 ${
        themeMode === 'light' 
          ? 'border-white/60 bg-white/40' 
          : 'border-white/5 bg-[#0c0d10]/60'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 min-h-18 py-2.5 sm:py-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 sm:p-2 mr-1 rounded-xl bg-white/70 dark:bg-[#121214]/60 border border-[#c19a6b]/25 hover:border-[#c19a6b]/60 text-[#7c5a30] dark:text-[#c19a6b] hover:bg-[#c19a6b]/10 transition-all flex items-center justify-center shadow-xs"
              title={sidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
              id="sidebar-toggle-btn"
            >
              {sidebarCollapsed ? (
                <Menu className="w-4 h-4 sm:w-5 h-5" />
              ) : (
                <ChevronLeft className="w-4 h-4 sm:w-5 h-5" />
              )}
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFF3DE] to-[#c19a6b] p-[1.5px] shadow-sm shrink-0">
              <div className="w-full h-full bg-white/80 rounded-xl flex items-center justify-center">
                <span className="font-serif-luxury font-bold text-lg text-[#c19a6b]">Z</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-serif-luxury text-sm sm:text-lg tracking-wider font-bold text-slate-800 dark:text-stone-100">ZAFIR SYSTEM</span>
                <span className="text-[8px] sm:text-[9px] bg-[#c19a6b]/20 text-[#7c5a30] border border-[#c19a6b]/40 px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-widest leading-none">COMMAND</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono tracking-wider uppercase truncate max-w-[160px] xs:max-w-[220px] sm:max-w-md md:max-w-lg lg:max-w-none" title="Active Tab Description">
                {activeTab === 'arrivals' && t('tabArrivalsHeader')}
                {activeTab === 'room-service' && t('tabRoomServiceHeader')}
                {activeTab === 'controls' && t('tabControlsHeader')}
                {activeTab === 'channel-sync' && t('tabChannelSyncHeader')}
                {activeTab === 'vault' && t('tabVaultHeader')}
                {activeTab === 'memberships' && t('tabMembershipsHeader')}
                {activeTab === 'maintenance' && t('tabMaintenanceHeader')}
                {activeTab === 'omni-stream' && t('tabOmniStreamHeader')}
                {activeTab === 'ledger' && t('tabLedgerHeader')}
                {activeTab === 'management' && t('tabManagementHeader')}
                {activeTab === 'hospitality-manager' && t('tabHospitalityHeader')}
                {activeTab === 'wine-cellar' && t('tabWineCellarHeader')}
                {activeTab === 'profile' && t('tabProfileHeader')}
                {activeTab === 'prestige-portal' && t('tabPrestigePortalHeader')}
                {activeTab === 'settings' && t('tabSettingsHeader')}
                {activeTab === 'billing' && t('tabBillingHeader')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <div className="hidden lg:flex items-center gap-4 bg-white/30 dark:bg-[#0c0d10]/30 border border-white/60 dark:border-stone-800/80 px-4 py-1.5 rounded-lg text-xs shadow-sm">
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-700 dark:text-slate-200">{t('syncActive')}</span>
              </div>
              <span className="text-[#7c5a30] dark:text-[#c19a6b] border-l border-slate-300 dark:border-stone-800/30 pl-3 font-mono font-semibold">October 26, 2024, 10:30 AM</span>
            </div>

            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 cursor-pointer focus:outline-none hover:opacity-90 select-none group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 transition group-hover:text-[#7c5a30]">{studentName}</p>
                  <p className="text-[10px] text-[#7c5a30] font-mono leading-none capitalize font-bold">
                    {sessionRole} • {t('registry')}
                  </p>
                </div>
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-white/60 border border-[#c19a6b]/45 group-hover:border-[#c19a6b] flex items-center justify-center text-[#7c5a30] font-serif-luxury text-sm font-bold shadow-sm transition">
                    {studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'EP'}
                  </div>
                  {emailHasDigits && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-600 border border-white text-white rounded-full p-0.5 shadow-sm" title="Email containing numbers verified">
                      <Mail className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              </button>

              {/* PROFILE DROPDOWN MENU */}
              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 glass-panel bg-white/95 border-2 border-[#c19a6b]/60 rounded-2xl shadow-xl p-4 text-slate-800 z-50 animate-fade-in text-left">
                    <div className="border-b border-black/5 pb-2.5 mb-2.5">
                      <h4 className="font-serif-luxury font-bold text-sm text-[#7c5a30]">{studentName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono leading-snug">connected_node@zafir.academy</p>
                    </div>

                    <div className="space-y-1.5 mb-3.5">
                      <p className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                        {language === 'FR' ? 'Changer de Rôle :' : 'Switch Active Role :'}
                      </p>
                      
                      <div className="flex flex-col gap-1">
                        {[
                          { id: 'administrateur', label: 'Administrateur 🛡️' },
                          { id: 'client', label: 'Client VIP 👤' },
                          { id: 'hotel', label: 'Hôtel / Staff 🏨' }
                        ].map(roleItem => (
                          <button
                            key={roleItem.id}
                            type="button"
                            onClick={() => {
                              setSessionRole(roleItem.id as any);
                              addAuditLog(
                                'SESSION_ROLE_SIMULATED',
                                `Switched active credentials profile simulated role to [${roleItem.id.toUpperCase()}].`,
                                'AUTHORIZED',
                                roleItem.id.toUpperCase()
                              );
                              setProfileDropdownOpen(false);
                              confetti({ particleCount: 15, colors: ['#c19a6b', '#ffffff'] });
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                              sessionRole === roleItem.id
                                ? 'bg-slate-900 border-slate-950 text-white shadow-xs'
                                : 'bg-white/40 border-transparent text-slate-700 hover:border-slate-200'
                            }`}
                          >
                            {roleItem.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Demo reset subscription option */}
                    <div className="border-t border-black/5 pt-2 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setHasActiveSubscription(false);
                          localStorage.removeItem('sapphir_has_active_subscription');
                          localStorage.setItem('sapphir_current_plan', 'TRIAL');
                          addAuditLog(
                            'SUBSCRIPTION_DEMO_RESET',
                            'Reset subscription state for demo testing purposes. Redirecting back to Payment Gateway Wall.',
                            'AUTHORIZED'
                          );
                          confetti({ particleCount: 20, colors: ['#ffd700', '#c19a6b'] });
                        }}
                        className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer border border-amber-500/20"
                        title="Lock Dashboard for Demo Testing"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{language === 'FR' ? 'Réinitialiser l\'Abonnement' : 'Reset Subscription Wall'}</span>
                      </button>
                    </div>

                    {/* Disconnection/Logout button as requested */}
                    <div className="border-t border-black/5 pt-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setProfileDropdownOpen(false);
                          try {
                            await logout();
                            addAuditLog(
                              'CRYPTO_SECURITY_LOGOUT',
                              'User triggered defensive logout sequence. Recovering access tokens and recycling keys.',
                              'AUTHORIZED',
                              sessionRole.toUpperCase()
                            );
                            setStudentName('Invité / Guest');
                            setSessionRole('client');
                            confetti({ particleCount: 15, colors: ['#e11d48'] });
                            alert(language === 'FR' ? 'Déconnexion effectuée avec succès !' : 'Successfully logged out !');
                          } catch (err) {
                            console.error("Logout Err:", err);
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition shadow-sm cursor-pointer"
                        title="Disconnect System Session Node"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                        <span>{language === 'FR' ? 'Déconnexion' : language === 'RU' ? 'Выйти' : 'Sign Out'}</span>
                      </button>
                    </div>

                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE GRID */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8 relative z-10">
        
        {/* SIDE BAR NAVIGATION - TRANSPARENT FROSTED GLASS */}
        {!sidebarCollapsed && (
          <aside className="w-full lg:w-64 flex flex-row lg:flex-col gap-1.5 shrink-0 overflow-x-auto pb-2 lg:pb-0 scrollbar-none glass-panel p-2.5 sm:p-4 h-fit sticky top-[62px] lg:top-24 z-30 shadow-md animate-fade-in">
          
          <button
            onClick={() => {
              setViewMode('website');
              addAuditLog('RETURNED_TO_WEBSITE', 'Navigated back to the public landing page from secure cockpit.', 'AUTHORIZED');
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left bg-gradient-to-r from-[#c19a6b]/15 to-transparent border border-[#c19a6b]/30 text-[#7c5a30] hover:bg-[#c19a6b]/10 font-bold shadow-sm"
          >
            <Globe className="w-4 h-4 text-amber-600 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono">{language === 'FR' ? 'Site Public' : 'Public Website'}</span>
            <span className="ml-auto text-[10px] bg-[#c19a6b]/30 text-[#7c5a30] px-1.5 py-0.2 rounded font-bold">WEB</span>
          </button>

          <button
            onClick={() => navigateToTab('prestige-portal')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'prestige-portal'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Globe className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabPrestigePortal')}</span>
            <span className="ml-auto text-[10px] bg-[#c19a6b]/30 text-[#7c5a30] px-1.5 py-0.2 rounded font-bold">INFO</span>
          </button>

          <button
            onClick={() => navigateToTab('arrivals')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'arrivals'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Plane className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono">{t('tabArrivals')}</span>
            <span className="ml-auto text-[10px] bg-sky-500/10 text-sky-700 px-1.5 py-0.2 rounded border border-sky-500/20 font-bold">VIP</span>
          </button>

          <button
            onClick={() => navigateToTab('room-service')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'room-service'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Utensils className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabRoomService')}</span>
            <span className="ml-auto text-[10px] bg-[#c19a6b]/15 text-[#7c5a30] px-1.5 py-0.2 rounded border border-[#c19a6b]/30 font-bold">6</span>
          </button>

          <button
            onClick={() => navigateToTab('controls')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'controls'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Sliders className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabControls')}</span>

          </button>

          <button
            onClick={() => navigateToTab('channel-sync')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'channel-sync'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabChannelSync')}</span>
          </button>

          <button
            onClick={() => navigateToTab('vault')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'vault'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Lock className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabVault')}</span>

          </button>

          <button
            onClick={() => navigateToTab('memberships')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'memberships'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Crown className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono flex-1 font-sans-luxury">{t('tabMemberships')}</span>
          </button>

          <button
            onClick={() => navigateToTab('billing')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'billing'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
            id="sidebar-billing-btn"
          >
            <CreditCard className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono flex-1 font-sans-luxury">{t('tabBilling')}</span>
            <span className="ml-auto text-[9px] bg-emerald-500/15 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-500/20 font-bold uppercase">SaaS</span>
          </button>

          <button
            onClick={() => navigateToTab('maintenance')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'maintenance'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <HardHat className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabMaintenance')}</span>

          </button>

          <button
            onClick={() => navigateToTab('omni-stream')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'omni-stream'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Activity className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabOmniStream')}</span>
          </button>

          <div className="hidden lg:block border-t border-slate-350/50 my-4" />

          <button
            onClick={() => navigateToTab('ledger')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'ledger'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabLedger')}</span>
            <span className="ml-auto text-[9px] bg-[#c19a6b]/20 text-[#7c5a30] px-1.5 py-0.2 rounded border border-[#c19a6b]/30 font-bold">GPA {totalGPA}</span>
          </button>

          <button
            onClick={() => navigateToTab('management')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'management'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Users className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabManagement')}</span>
            <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded border border-emerald-500/20 font-bold font-mono">SYS</span>
          </button>

          <button
            onClick={() => navigateToTab('user-directory')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'user-directory'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Fingerprint className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">
              {language === 'FR' ? 'Comptes Utilisateurs' : language === 'RU' ? 'Пользователи' : 'User Accounts'}
            </span>
            <span className="ml-auto text-[10px] bg-[#c19a6b]/20 text-[#7c5a30] px-1.5 py-0.2 rounded border border-[#c19a6b]/40 font-bold font-mono">ROLE</span>
          </button>

          <button
            onClick={() => navigateToTab('hospitality-manager')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'hospitality-manager'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Hotel className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabHospitality')}</span>
            <span className="ml-auto text-[10px] bg-[#c19a6b]/20 text-[#7c5a30] px-1.5 py-0.2 rounded border border-[#c19a6b]/40 font-bold font-mono">OPS</span>
          </button>

          <button
            onClick={() => navigateToTab('wine-cellar')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'wine-cellar'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Wine className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabWineCellar')}</span>
            <span className="ml-auto text-[10px] bg-[#c19a6b]/20 text-[#7c5a30] px-1.5 py-0.2 rounded border border-[#c19a6b]/40 font-bold font-mono">CAV</span>
          </button>

          <button
            onClick={() => navigateToTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'profile'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <div className="relative shrink-0">
              <User className="w-4 h-4 text-sapphire" />
              {emailHasDigits && (
                <div className="absolute -top-1 -right-1 bg-amber-600 rounded-full p-0.5" title="Email containing numbers verified">
                  <Mail className="w-2.5 h-2.5 text-white stroke-[2.5]" />
                </div>
              )}
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabProfile')}</span>
            <span className="ml-auto text-[10px] bg-[#c19a6b]/30 text-[#7c5a30] px-1.5 py-0.2 rounded font-bold">VIP-V</span>
          </button>

          <button
            onClick={() => navigateToTab('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'settings'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabSettings')}</span>
            <span className="ml-auto text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.2 rounded border border-amber-500/20 font-bold font-mono">SYNC</span>
          </button>

          <button
            onClick={() => navigateToTab('design-showcase')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'design-showcase'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Globe className="w-4 h-4 text-sapphire" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabDesignShowcase')}</span>
            <span className="ml-auto text-[10px] bg-sky-500/10 text-sky-600 px-1.5 py-0.2 rounded border border-sky-500/20 font-bold font-mono">LAB</span>
          </button>
        </aside>
        )}

        {/* WORKSPACE PREVIEW GLASS STAGE CONTENT */}
        <main className="flex-1 flex flex-col gap-6 animate-fade-in" id="workspace-stage">
          {!TAB_CLEARANCE[activeTab]?.includes(sessionRole) ? (
            renderSessionRoleLockScreen(activeTab)
          ) : (
            <>
              {activeTab === 'arrivals' && <ArrivalsTab vipGuests={vipGuests} flights={flights} />}
              
              {activeTab === 'room-service' && <RoomServiceTab roomOrders={roomOrders} advanceOrderStatus={advanceOrderStatus} addAuditLog={addAuditLog} language={language} />}
              

              {activeTab === 'controls' && (
                <ControlsTab
                  lightScene={lightScene}
                  setLightScene={setLightScene}
                  currentTemp={currentTemp}
                  setCurrentTemp={setCurrentTemp}
                  targetTemp={targetTemp}
                  setTargetTemp={setTargetTemp}
                  glassOpacity={glassOpacity}
                  setGlassOpacity={setGlassOpacity}
                  glowingRooms={glowingRooms}
                  toggleRoomGlow={toggleRoomGlow}
                  language={language}
                  fontStyle={styleMode}
                />
              )}

              {activeTab === 'channel-sync' && <ChannelSyncTab channels={channels} syncLogs={syncLogs} />}

              {activeTab === 'vault' && <VaultTab vaultDocs={vaultDocs} startDecrypt={handleDecrypt} />}

              {activeTab === 'memberships' && <MembershipsTab addAuditLog={addAuditLog} />}

              {activeTab === 'billing' && <SaaSBillingTab addAuditLog={addAuditLog} themeMode={themeMode} />}

              {activeTab === 'maintenance' && <MaintenanceTab addAuditLog={addAuditLog} />}

              {activeTab === 'omni-stream' && <OmniStreamTab />}

              {activeTab === 'ledger' && (
                <LedgerTab
                  studentName={studentName}
                  studentId={studentId}
                  totalGPA={totalGPA}
                  totalCredits={totalCredits}
                  blockchainId={blockchainId}
                  courses={courses}
                  addCourse={addCourse}
                  removeCourse={removeCourse}
                  exportPDF={exportPDF}
                  isGenerating={isGenerating}
                  qrCodeUrl={qrCodeUrl}
                  auditLogs={auditLogs}
                />
              )}

              {activeTab === 'management' && (
                <ManagementTab
                  language={language}
                  auditLogs={auditLogs}
                  addAuditLog={addAuditLog}
                />
              )}

              {activeTab === 'hospitality-manager' && (
                <HospitalityManagerTab
                  language={language}
                  addAuditLog={addAuditLog}
                />
              )}

              {activeTab === 'wine-cellar' && (
                <WineCellarTab
                  language={language}
                  addAuditLog={addAuditLog}
                  fontStyle={styleMode}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileTab
                  language={language}
                  addAuditLog={addAuditLog}
                  onUserChange={(name, _role) => {
                    setStudentName(name);
                  }}
                />
              )}

              {activeTab === 'prestige-portal' && (
                <PrestigePortalTab
                  language={language}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsTab
                  language={language}
                  addAuditLog={addAuditLog}
                  vipGuests={vipGuests}
                  setVipGuests={setVipGuests}
                  roomOrders={roomOrders}
                  auditLogs={auditLogs}
                />
              )}

              {activeTab === 'design-showcase' && (
                <DesignSystemShowcase />
              )}

              {activeTab === 'user-directory' && (
                <UserManagerSuite
                  language={language}
                  addAuditLog={addAuditLog}
                  sessionRole={sessionRole}
                />
              )}
            </>
          )}
        </main>

      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-obsidian-950/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="glass-panel p-8 rounded-2xl max-w-sm text-center border border-[#c19a6b]/35 bg-obsidian-900">
            <RefreshCw className="w-8 h-8 text-[#c19a6b] animate-spin mx-auto mb-4" />
            <h4 className="text-sm font-semibold text-slate-100 mb-1">Generating Cryptographic PDF Ledger</h4>
            <span className="text-xs text-[#c19a6b] font-mono block animate-pulse">{generationStep}</span>
          </div>
        </div>
      )}

    </div>
  );
}
