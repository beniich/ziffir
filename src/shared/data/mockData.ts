import type { Course, RoomServiceOrder } from '../types';

// Typage issu de Layout.tsx (historiquement)
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

export const INITIAL_VIP_GUESTS = [
  { name: 'Mr. Chen & Family', vip: 'VIP GOLD', status: 'En route animate-pulse', info: 'Limo Pickup in 20m', flight: 'Flight BA245 / LHR-JFK' },
  { name: 'Ms. Al-Fayed', vip: 'VIP PLATINUM', status: 'Landed', info: 'Arrived at Terminal 4 / Chauffeur en route', flight: 'Flight Emirates EM5 / DXB-JFK' },
  { name: 'Dr. Rossi', vip: 'VIP BRONZE', status: 'In-flight', info: 'Estimated arrival 2h 15m', flight: 'Flight AF112 / CDG-JFK' }
];

export const INITIAL_FLIGHTS = [
  { id: 'BA245', status: 'On Time', time: '11:15 AM' },
  { id: 'AF112', status: 'Delayed 15m', time: '12:45 PM' },
  { id: 'EM5', status: 'Landed', time: '09:50 AM' }
];

export const INITIAL_CHANNELS = [
  { name: 'Booking.com', status: 'Synced', iconColor: 'bg-emerald-500' },
  { name: 'Expedia.com', status: 'Synced', iconColor: 'bg-emerald-500' },
  { name: 'Airbnb Luxury', status: 'Pending', iconColor: 'bg-amber-400 animate-pulse' },
  { name: 'Direct Zafir', status: 'Synced', iconColor: 'bg-emerald-500' }
];

export const INITIAL_SYNC_LOGS = [
  '01:59 AM - Channel Booking.com price parity audit completed',
  '01:59 AM - Expedia price update distributed successfully',
  '01:53 AM - Airbnb API availability handshake verified',
  '01:53 AM - Direct portal local server cache sync updated'
];

export const INITIAL_VAULT_DOCS = [
  { id: '1', name: 'Zafir_Acquisition_Contract_2024.pdf', encrypted: true, decrypting: false, progress: 0, securityLevel: 'VIP Elite Class V' },
  { id: '2', name: 'Global_Merger_Sovereign_Agreement_X89.docx', encrypted: true, decrypting: false, progress: 0, securityLevel: 'Presidential Clearance' },
  { id: '3', name: 'Strategic_Sovereign_Financial_Report_Q3.xlsx', encrypted: true, decrypting: false, progress: 0, securityLevel: 'Secretariat Level IV' }
];


export const INITIAL_COURSES: Course[] = [
  { code: 'HOSP-501', name: 'Advanced Guest Experience Design', category: 'Operations', credits: 4.0, grade: 'A+', completedDate: '2025-11-20' },
  { code: 'SOMM-612', name: 'Master Oenology & Fine Wine Curation', category: 'Gastronomy', credits: 3.0, grade: 'A', completedDate: '2025-12-15' },
  { code: 'ESTM-505', name: 'Five-Star Estate & Butler Management', category: 'Service', credits: 4.0, grade: 'A+', completedDate: '2026-02-10' },
  { code: 'CULN-410', name: 'Elite Haute Gastronomy & Hospitality Ethics', category: 'Gastronomy', credits: 3.0, grade: 'A-', completedDate: '2026-03-01' },
  { code: 'FINH-590', name: 'Yield Management & Luxury Resort Finance', category: 'Management', credits: 4.0, grade: 'A', completedDate: '2026-04-18' },
];

export const INITIAL_ROOM_ORDERS: RoomServiceOrder[] = [
  { id: 'order-1', guest: 'Mr. Chen & Family', room: 'Suite 201', details: 'Gourmet French Breakfast platter, freshly pressed organic orange juice', status: 'Quality Check', imgUrl: '' },
  { id: 'order-2', guest: 'Ms. Al-Fayed', room: 'Suite 202', details: 'Chef Selection Premium Sushi platter, Wagyu Beef skewers', status: 'Quality Check', imgUrl: '' },
  { id: 'order-3', guest: 'Dr. Rossi', room: 'Suite 203', details: 'Dry Standard Ribeye Steak, Truffle fries, Barolo Reserve wine', status: 'Quality Check', imgUrl: '' },
  { id: 'order-4', guest: 'Al Gtore', room: 'Villa 1', details: 'Gourmet Buttermilk Pancakes, Canadian maple syrup, hot espresso', status: 'Preparation', imgUrl: '' },
  { id: 'order-5', guest: 'Contarah', room: 'Villa 2', details: 'Traditional Premium Angus Beef burger, gold leaf garnish', status: 'Quality Check', imgUrl: '' },
  { id: 'order-6', guest: 'Fonuhery', room: 'Suite 304', details: 'Fettuccine Vongole with fresh Mediterranean clams, Pinot Grigio', status: 'Quality Check', imgUrl: '' }
];

export const INITIAL_AUDITS: AuditEntry[] = [
  {
    id: "LOG-001",
    timestamp: "2024-10-26 08:30:15 AM",
    action: "SYSTEM_BOOT_GENESIS",
    role: "ACADEMY-CORE",
    reason: "Secure core init for student Elena Petrova (ZCA-2024-9182)",
    previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
    hash: "0x7b8f9e0c5afde9c3b123d4f6eef050b16",
    status: "AUTHORIZED"
  },
  {
    id: "LOG-002",
    timestamp: "2024-10-26 09:12:44 AM",
    action: "TRANSCRIPT_BLOCKCHAIN_ANCHOR",
    role: "VICE_DEAN_VANCE",
    reason: "GPA Anchor to sovereign ledger matching hash 0x89C...D4AF",
    previousHash: "0x7b8f9e0c5afde9c3b123d4f6eef050b16",
    hash: "0xc8d9e2a14b301cdfe98eba18274381907cb",
    status: "AUTHORIZED"
  }
];

export const translations = {
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
    tabPOSHeader: "Zafir POS: Tactile Point of Sale & Kitchen Orders",
    tabAnalyticsHeader: "Zafir Analytics: Stock Forecast & Dish Profitability",
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
    tabPOS: "POS Tactile",
    tabAnalytics: "Analytics",
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
    tabPOSHeader: "Zafir POS : Point de Vente Tactile & Commandes Cuisine",
    tabAnalyticsHeader: "Zafir Analytics : Prévision Stocks & Rentabilité Plats",
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
    tabPOS: "POS Tactile",
    tabAnalytics: "Analytics",
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
    tabPOSHeader: "Zafir POS: Тактильная Точка Продаж",
    tabAnalyticsHeader: "Zafir Аналитика: Прогноз Запасов и Рентабельность Блюд",
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
    tabPOS: "POS Тактильный",
    tabAnalytics: "Аналитика",
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
  }
};
