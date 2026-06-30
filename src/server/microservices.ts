import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json' assert { type: 'json' };

// Initialize a server-side Firebase instance
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "ai-studio-c03eed34-6b98-437a-b865-3de7e2a9ecd6");

// Helper to safely read a setting document from Firestore, with local memory fallback
async function getSettingDoc<T>(tenantId: string, id: string, defaultData: T): Promise<T> {
  try {
    const docRef = doc(db, 'tenants', tenantId || 'default', 'settings', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...defaultData, ...snap.data() } as T;
    }
    // Write default if not exists
    await setDoc(docRef, defaultData as any);
    return defaultData;
  } catch (error) {
    console.error(`Error reading setting ${id} from Firestore, using fallback:`, error);
    return defaultData;
  }
}

// Helper to safely save a setting document to Firestore
async function saveSettingDoc<T>(tenantId: string, id: string, data: T): Promise<void> {
  try {
    const docRef = doc(db, 'tenants', tenantId || 'default', 'settings', id);
    await setDoc(docRef, data as any);
  } catch (error) {
    console.error(`Error saving setting ${id} to Firestore:`, error);
  }
}

// Interfaces & Defaults for our 23 Microservices

// 1. ARRIVALS VIP
export interface ArrivalsData {
  arrivalsApproved: boolean;
  guests: Array<{
    guest: string;
    flight: string;
    suite: string;
    status: string;
    eta: string;
    color: string;
  }>;
}
const defaultArrivals: ArrivalsData = {
  arrivalsApproved: false,
  guests: [
    { guest: "H.R.H. Prince Al-Waleed", flight: "LJG-747", suite: "301", status: "En Approche / Flying", eta: "8 mins", color: "text-amber-400" },
    { guest: "Elena Petrova (Elite Student)", flight: "LX-982", suite: "101", status: "Atterri / Landed", eta: "Vérifié", color: "text-emerald-400" },
    { guest: "Alexandre Beaumont", flight: "PJS-550", suite: "201", status: "Transfert / En Route", eta: "15 mins", color: "text-[#c19a6b]" }
  ]
};

// 2. ROOM SERVICE
export interface RoomServiceData {
  roomServiceCompleted: boolean;
  orders: Array<{
    item: string;
    suite: string;
    notes: string;
    status: string;
    time: string;
  }>;
}
const defaultRoomService: RoomServiceData = {
  roomServiceCompleted: false,
  orders: [
    { item: "Caviar Beluga Impérial (50g)", suite: "Suite 301", notes: "Extra toast & chilled silver spoon", status: "EN PRÉPARATION", time: "18:45" },
    { item: "Champagne Louis Roederer Cristal", suite: "Suite 201", notes: "Two custom lead crystal flutes", status: "LIVRAISON INSTANTANÉE", time: "18:50" },
    { item: "Filet Mignon aux Truffes Noires", suite: "Suite 101", notes: "Medium rare, hot plates covered", status: "EN CUISINE", time: "19:02" }
  ]
};

// 3. SUITE CONTROLS
export interface SuiteControlsData {
  suiteTemp: number;
  suiteGlass: number;
  suiteLight: 'AMBIENT' | 'READING' | 'RELAX';
}
const defaultSuiteControls: SuiteControlsData = {
  suiteTemp: 21.5,
  suiteGlass: 40,
  suiteLight: 'AMBIENT'
};

// 4. SUITE PORTAL
export interface SuitePortalData {
  suiteActiveId: string;
}
const defaultSuitePortal: SuitePortalData = {
  suiteActiveId: '201'
};

// 5. WELLNESS SPA
export interface WellnessData {
  selectedWellnessSlot: string;
  wellnessSlots: Array<{
    id: string;
    time: string;
    guest: string;
    service: string;
    room: string;
    therapist: string;
    status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';
  }>;
}
const defaultWellness: WellnessData = {
  selectedWellnessSlot: 'facial',
  wellnessSlots: [
    { id: '1', time: '10:00 AM', guest: 'Elena Petrova', service: 'Royal Cellular Facial', room: 'Treatment Room 2', therapist: 'Camille', status: 'CONFIRMED' },
    { id: '2', time: '11:30 AM', guest: 'Prince Al-Waleed', service: 'Deep Tissue Massage', room: 'Treatment Room 1', therapist: 'Sofia', status: 'IN_PROGRESS' },
    { id: '3', time: '02:00 PM', guest: 'Alexandre Beaumont', service: 'Detoxifying Body Wrap', room: 'Hydrotherapy Suite', therapist: 'Marc', status: 'COMPLETED' }
  ]
};

// 6. FLEET CHAUFFEURS
export interface FleetData {
  selectedFleetVehicle: string;
  fleetCars: Array<{
    id: string;
    model: string;
    driver: string;
    status: 'DISPONIBLE' | 'EN ROUTE' | 'EN ATTENTE' | 'MAINTENANCE';
    battery: number;
    destination: string;
  }>;
}
const defaultFleet: FleetData = {
  selectedFleetVehicle: 'sedan',
  fleetCars: [
    { id: 'sedan', model: 'Rolls-Royce Spectre Black Badge', driver: 'Jean-Luc', status: 'EN ROUTE', battery: 88, destination: 'Altiport Courchevel (CVF)' },
    { id: 'suv', model: 'Mercedes-Maybach EQS SUV', driver: 'Antoine', status: 'DISPONIBLE', battery: 94, destination: 'Lobby Principal' },
    { id: 'hyper', model: 'Bugatti Tourbillon (Escorte Privée)', driver: 'Marc-Aurèle', status: 'MAINTENANCE', battery: 100, destination: 'Hangar Elite' }
  ]
};

// 7. YACHTING EDITION
export interface YachtingData {
  yachtName: string;
  mooringSpot: string;
  anchorDepth: number;
  waterTemp: number;
  deckTemp: number;
  engineLoad: number;
  tenderStatus: string;
}
const defaultYachting: YachtingData = {
  yachtName: "The Sovereign",
  mooringSpot: "Port de Saint-Tropez - Quai d'Honneur",
  anchorDepth: 14.8,
  waterTemp: 22.4,
  deckTemp: 24.1,
  engineLoad: 0,
  tenderStatus: "DOCKÉ"
};

// 8. WINE CELLAR
export interface WineCellarData {
  sommelierAdvice: string | null;
  bottles: Array<{ id: string; name: string; year: number; stock: number; rating: number }>;
}
const defaultWineCellar: WineCellarData = {
  sommelierAdvice: null,
  bottles: [
    { id: 'c1', name: "Romanee-Conti Grand Cru", year: 2015, stock: 4, rating: 99 },
    { id: 'c2', name: "Château Petrus Pomerol", year: 2010, stock: 6, rating: 98 },
    { id: 'c3', name: "Dom Pérignon Plénitude 2", year: 2004, stock: 12, rating: 97 }
  ]
};

// 9. MEMBERSHIPS
export interface MembershipsData {
  platinumConcierge: boolean;
  platinumSpa: boolean;
  platinumHost: boolean;
  goldConcierge: boolean;
  goldSpa: boolean;
  goldHost: boolean;
  onyxConcierge: boolean;
  onyxSpa: boolean;
  onyxHost: boolean;
  platinumFee: string;
  goldFee: string;
  onyxFee: string;
}
const defaultMemberships: MembershipsData = {
  platinumConcierge: true,
  platinumSpa: true,
  platinumHost: true,
  goldConcierge: true,
  goldSpa: false,
  goldHost: true,
  onyxConcierge: true,
  onyxSpa: true,
  onyxHost: true,
  platinumFee: '50000',
  goldFee: '25000',
  onyxFee: '10000'
};

// 10. METAL CARDS
export interface MetalCardsData {
  customCardName: string;
  cardWeight: number;
  cardFinish: 'BRUSHED_GOLD' | 'BLACK_ONYX' | 'PLATINUM';
}
const defaultMetalCards: MetalCardsData = {
  customCardName: 'Alexandre Beaumont',
  cardWeight: 28,
  cardFinish: 'BRUSHED_GOLD'
};

// 11. CHANNEL SYNC
export interface ChannelSyncData {
  syncingChannels: boolean;
  syncSuccess: boolean;
  channels: Array<{ name: string; latency: string; status: string }>;
}
const defaultChannelSync: ChannelSyncData = {
  syncingChannels: false,
  syncSuccess: false,
  channels: [
    { name: "Sovereign Booking Engine", latency: "1.2ms", status: "SYNCHRONISÉ" },
    { name: "GDS Amadeus Prime", latency: "14.5ms", status: "SYNCHRONISÉ" },
    { name: "Sabre Luxury Network", latency: "22.1ms", status: "SYNCHRONISÉ" }
  ]
};

// 12. RATES PRICING
export interface PricingData {
  solutionsRoomsCount: number;
  solutionsTier: 'PALACE' | 'CLUB' | 'CHALET';
}
const defaultPricing: PricingData = {
  solutionsRoomsCount: 45,
  solutionsTier: 'PALACE'
};

// 13. CMS
export interface CMSData {
  cmsPalette: 'navy' | 'gold' | 'charcoal';
  cmsSerif: boolean;
  cmsSliders: number;
  cmsUpendions: number;
}
const defaultCMS: CMSData = {
  cmsPalette: 'gold',
  cmsSerif: true,
  cmsSliders: 65,
  cmsUpendions: 80
};

// 14. BUSINESS CENTER
export interface BusinessData {
  businessHours: string;
  roomBookings: Array<{ id: string; room: string; time: string; bookedBy: string }>;
}
const defaultBusiness: BusinessData = {
  businessHours: "24/7 VIP Access",
  roomBookings: [
    { id: "b1", room: "Sovereign Executive Boardroom", time: "09:00 AM - 11:00 AM", bookedBy: "Prince Al-Waleed" },
    { id: "b2", room: "Prestige Suite A", time: "02:00 PM - 03:30 PM", bookedBy: "Elena Petrova" }
  ]
};

// 15. TESTIMONIALS
export interface TestimonialsData {
  list: Array<{ id: string; name: string; role: string; text: string; hotel: string; rating: number }>;
}
const defaultTestimonials: TestimonialsData = {
  list: [
    { id: '1', name: 'Lady Charlotte Vane', role: 'Royal Patron', text: 'Zaphir is the crown jewel of operations. Its predictive modules and bespoke automation elevated our guest satisfaction metrics to unprecedented heights.', hotel: 'Royal Chalet, Zermatt', rating: 5 },
    { id: '2', name: 'Marc-Antoine de Bouvier', role: 'General Director', text: 'We customized Zaphir for our private fleet and custom sommelier cellars. It operates as an invisible butler of pure software precision.', hotel: 'Hôtel Splendide, Courchevel', rating: 5 }
  ]
};

// 16. SECURE VAULT
export interface VaultData {
  vaultDecrypted: boolean;
  vaultDecrypting: boolean;
  multisigApprovals: Array<{ approver: string; approved: boolean; role: string }>;
}
const defaultVault: VaultData = {
  vaultDecrypted: false,
  vaultDecrypting: false,
  multisigApprovals: [
    { approver: "General Manager", approved: true, role: "Principal Executive" },
    { approver: "Director of Cyber Defense", approved: false, role: "System Administrator" },
    { approver: "Owner's Trustee Representative", approved: false, role: "External Validator" }
  ]
};

// 17. FACILITY MAINTENANCE
export interface MaintenanceData {
  diagnosticsRunning: boolean;
  diagnosticsOutput: string[];
  maintenanceTasks: Array<{
    id: string;
    title: string;
    location: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    assignedTo: string;
    status: 'AFFECTED' | 'IN_PROGRESS' | 'SOLVED';
    time: string;
  }>;
}
const defaultMaintenance: MaintenanceData = {
  diagnosticsRunning: false,
  diagnosticsOutput: [],
  maintenanceTasks: [
    { id: 't1', title: 'Calibration Capteurs de Pression Spa', location: 'Piscine Thermale', severity: 'MEDIUM', assignedTo: 'Stefan Keller', status: 'IN_PROGRESS', time: '14:20' },
    { id: 't2', title: 'Contrôle Filtre Cellar Température', location: 'Cave Souterraine 3', severity: 'HIGH', assignedTo: 'Pierre Laurent', status: 'AFFECTED', time: '14:50' },
    { id: 't3', title: 'Vérification Cryogène Vault Backup', location: 'Chambre du Coffre', severity: 'CRITICAL', assignedTo: 'Marc Aurel', status: 'SOLVED', time: '11:15' }
  ]
};

// 18. ACADEMIC LEDGER
export interface LedgerData {
  ledgerGenerating: boolean;
  ledgerSuccess: boolean;
  blocks: Array<{ index: number; hash: string; previousHash: string; timestamp: string; data: string }>;
}
const defaultLedger: LedgerData = {
  ledgerGenerating: false,
  ledgerSuccess: false,
  blocks: [
    { index: 1, hash: "0000a12f6b89c3d4e5f67a...", previousHash: "0000000000000000000000...", timestamp: "2026-06-29 10:15:22", data: "Suite 301 Access Activated (H.R.H. Prince Al-Waleed)" },
    { index: 2, hash: "0000f48e9c0b1a2d3e4f5a...", previousHash: "0000a12f6b89c3d4e5f67a...", timestamp: "2026-06-29 11:32:04", data: "Secured Vault Multi-Signature Request Initiated" }
  ]
};

// 19. PREDICTIVE MAINTENANCE (Predictive IA)
export interface PredictiveData {
  diagnosticsStatus: string;
  anomaliesCount: number;
  systems: Array<{ name: string; health: number; wearFactor: number; status: string }>;
}
const defaultPredictive: PredictiveData = {
  diagnosticsStatus: "EXCELLENT",
  anomaliesCount: 0,
  systems: [
    { name: "HVAC Penthouse Compressor", health: 98, wearFactor: 12, status: "NOMINAL" },
    { name: "Pool Thermal Heater Exchange", health: 87, wearFactor: 34, status: "MONITOR" },
    { name: "Vault Cryogenic Compressor", health: 99, wearFactor: 4, status: "NOMINAL" },
    { name: "Secondary Power Inverter", health: 92, wearFactor: 18, status: "NOMINAL" }
  ]
};

// 20. CYBER SECURITY
export interface CyberData {
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  blockedIPs: number;
  firewallActive: boolean;
  nodes: Array<{ name: string; status: 'ONLINE' | 'OFFLINE' | 'ALERT'; uptime: string }>;
}
const defaultCyber: CyberData = {
  threatLevel: 'LOW',
  blockedIPs: 1422,
  firewallActive: true,
  nodes: [
    { name: "Central Console Ingress", status: "ONLINE", uptime: "99.99%" },
    { name: "Suite Smart IoT Grid", status: "ONLINE", uptime: "99.95%" },
    { name: "Secure Crypt Vault Node", status: "ONLINE", uptime: "100.00%" },
    { name: "Chauffeur Fleet GNSS Relay", status: "ONLINE", uptime: "99.98%" }
  ]
};

// 21. ENERGY GRID
export interface EnergyData {
  energyReportOpen: boolean;
  energyHvacLoad: number;
  energyWaterUsage: number;
  energyProduction: number;
}
const defaultEnergy: EnergyData = {
  energyReportOpen: false,
  energyHvacLoad: 75,
  energyWaterUsage: 1200,
  energyProduction: 4500
};

// 22. EMERGENCY GATE
export interface EmergencyData {
  lockdownTimer: string;
  emergencyActive: boolean;
  connectedResponders: string[];
}
const defaultEmergency: EmergencyData = {
  lockdownTimer: "00:02:30",
  emergencyActive: false,
  connectedResponders: []
};

// 23. FOOTFALL HEATMAP
export interface HeatmapData {
  selectedHeatmapZone: 'suite' | 'lobby' | 'spa';
  zoneTraffic: Record<string, { currentCount: number; maxCapacity: number; status: string }>;
}
const defaultHeatmap: HeatmapData = {
  selectedHeatmapZone: 'suite',
  zoneTraffic: {
    suite: { currentCount: 14, maxCapacity: 40, status: "LOW" },
    lobby: { currentCount: 45, maxCapacity: 100, status: "OPTIMAL" },
    spa: { currentCount: 12, maxCapacity: 30, status: "LOW" }
  }
};

// CORE API SERVICE ROUTING FUNCTIONS

export const microserviceService = {
  // Get all states (one massive handshake)
  async getAllStates(tenantId: string) {
    const arrivals = await getSettingDoc<ArrivalsData>(tenantId, 'cockpit_arrivals', defaultArrivals);
    const roomService = await getSettingDoc<RoomServiceData>(tenantId, 'cockpit_room_service', defaultRoomService);
    const suiteControls = await getSettingDoc<SuiteControlsData>(tenantId, 'cockpit_suite_controls', defaultSuiteControls);
    const suitePortal = await getSettingDoc<SuitePortalData>(tenantId, 'cockpit_suite_portal', defaultSuitePortal);
    const wellness = await getSettingDoc<WellnessData>(tenantId, 'cockpit_wellness', defaultWellness);
    const fleet = await getSettingDoc<FleetData>(tenantId, 'cockpit_fleet', defaultFleet);
    const yachting = await getSettingDoc<YachtingData>(tenantId, 'cockpit_yachting', defaultYachting);
    const wineCellar = await getSettingDoc<WineCellarData>(tenantId, 'cockpit_wine_cellar', defaultWineCellar);
    const memberships = await getSettingDoc<MembershipsData>(tenantId, 'cockpit_memberships', defaultMemberships);
    const metalCards = await getSettingDoc<MetalCardsData>(tenantId, 'cockpit_metal_cards', defaultMetalCards);
    const channelSync = await getSettingDoc<ChannelSyncData>(tenantId, 'cockpit_channel_sync', defaultChannelSync);
    const pricing = await getSettingDoc<PricingData>(tenantId, 'cockpit_pricing', defaultPricing);
    const cms = await getSettingDoc<CMSData>(tenantId, 'cockpit_cms', defaultCMS);
    const business = await getSettingDoc<BusinessData>(tenantId, 'cockpit_business', defaultBusiness);
    const testimonials = await getSettingDoc<TestimonialsData>(tenantId, 'cockpit_testimonials', defaultTestimonials);
    const vault = await getSettingDoc<VaultData>(tenantId, 'cockpit_vault', defaultVault);
    const maintenance = await getSettingDoc<MaintenanceData>(tenantId, 'cockpit_maintenance', defaultMaintenance);
    const ledger = await getSettingDoc<LedgerData>(tenantId, 'cockpit_ledger', defaultLedger);
    const predictive = await getSettingDoc<PredictiveData>(tenantId, 'cockpit_predictive', defaultPredictive);
    const cyber = await getSettingDoc<CyberData>(tenantId, 'cockpit_cyber', defaultCyber);
    const energy = await getSettingDoc<EnergyData>(tenantId, 'cockpit_energy', defaultEnergy);
    const emergency = await getSettingDoc<EmergencyData>(tenantId, 'cockpit_emergency', defaultEmergency);
    const heatmap = await getSettingDoc<HeatmapData>(tenantId, 'cockpit_heatmap', defaultHeatmap);

    return {
      arrivals,
      roomService,
      suiteControls,
      suitePortal,
      wellness,
      fleet,
      yachting,
      wineCellar,
      memberships,
      metalCards,
      channelSync,
      pricing,
      cms,
      business,
      testimonials,
      vault,
      maintenance,
      ledger,
      predictive,
      cyber,
      energy,
      emergency,
      heatmap
    };
  },

  // Logistics
  async getArrivals(tenantId: string) { return getSettingDoc<ArrivalsData>(tenantId, 'cockpit_arrivals', defaultArrivals); },
  async saveArrivals(tenantId: string, data: ArrivalsData) { return saveSettingDoc<ArrivalsData>(tenantId, 'cockpit_arrivals', data); },

  async getFleet(tenantId: string) { return getSettingDoc<FleetData>(tenantId, 'cockpit_fleet', defaultFleet); },
  async saveFleet(tenantId: string, data: FleetData) { return saveSettingDoc<FleetData>(tenantId, 'cockpit_fleet', data); },

  async getHeatmap(tenantId: string) { return getSettingDoc<HeatmapData>(tenantId, 'cockpit_heatmap', defaultHeatmap); },
  async saveHeatmap(tenantId: string, data: HeatmapData) { return saveSettingDoc<HeatmapData>(tenantId, 'cockpit_heatmap', data); },

  async getYachting(tenantId: string) { return getSettingDoc<YachtingData>(tenantId, 'cockpit_yachting', defaultYachting); },
  async saveYachting(tenantId: string, data: YachtingData) { return saveSettingDoc<YachtingData>(tenantId, 'cockpit_yachting', data); },

  // Hospitality
  async getRoomService(tenantId: string) { return getSettingDoc<RoomServiceData>(tenantId, 'cockpit_room_service', defaultRoomService); },
  async saveRoomService(tenantId: string, data: RoomServiceData) { return saveSettingDoc<RoomServiceData>(tenantId, 'cockpit_room_service', data); },

  async getSuiteControls(tenantId: string) { return getSettingDoc<SuiteControlsData>(tenantId, 'cockpit_suite_controls', defaultSuiteControls); },
  async saveSuiteControls(tenantId: string, data: SuiteControlsData) { return saveSettingDoc<SuiteControlsData>(tenantId, 'cockpit_suite_controls', data); },

  async getSuitePortal(tenantId: string) { return getSettingDoc<SuitePortalData>(tenantId, 'cockpit_suite_portal', defaultSuitePortal); },
  async saveSuitePortal(tenantId: string, data: SuitePortalData) { return saveSettingDoc<SuitePortalData>(tenantId, 'cockpit_suite_portal', data); },

  async getWellness(tenantId: string) { return getSettingDoc<WellnessData>(tenantId, 'cockpit_wellness', defaultWellness); },
  async saveWellness(tenantId: string, data: WellnessData) { return saveSettingDoc<WellnessData>(tenantId, 'cockpit_wellness', data); },

  // Commerce
  async getWineCellar(tenantId: string) { return getSettingDoc<WineCellarData>(tenantId, 'cockpit_wine_cellar', defaultWineCellar); },
  async saveWineCellar(tenantId: string, data: WineCellarData) { return saveSettingDoc<WineCellarData>(tenantId, 'cockpit_wine_cellar', data); },

  async getMemberships(tenantId: string) { return getSettingDoc<MembershipsData>(tenantId, 'cockpit_memberships', defaultMemberships); },
  async saveMemberships(tenantId: string, data: MembershipsData) { return saveSettingDoc<MembershipsData>(tenantId, 'cockpit_memberships', data); },

  async getMetalCards(tenantId: string) { return getSettingDoc<MetalCardsData>(tenantId, 'cockpit_metal_cards', defaultMetalCards); },
  async saveMetalCards(tenantId: string, data: MetalCardsData) { return saveSettingDoc<MetalCardsData>(tenantId, 'cockpit_metal_cards', data); },

  async getChannelSync(tenantId: string) { return getSettingDoc<ChannelSyncData>(tenantId, 'cockpit_channel_sync', defaultChannelSync); },
  async saveChannelSync(tenantId: string, data: ChannelSyncData) { return saveSettingDoc<ChannelSyncData>(tenantId, 'cockpit_channel_sync', data); },

  async getPricing(tenantId: string) { return getSettingDoc<PricingData>(tenantId, 'cockpit_pricing', defaultPricing); },
  async savePricing(tenantId: string, data: PricingData) { return saveSettingDoc<PricingData>(tenantId, 'cockpit_pricing', data); },

  async getCMS(tenantId: string) { return getSettingDoc<CMSData>(tenantId, 'cockpit_cms', defaultCMS); },
  async saveCMS(tenantId: string, data: CMSData) { return saveSettingDoc<CMSData>(tenantId, 'cockpit_cms', data); },

  async getBusiness(tenantId: string) { return getSettingDoc<BusinessData>(tenantId, 'cockpit_business', defaultBusiness); },
  async saveBusiness(tenantId: string, data: BusinessData) { return saveSettingDoc<BusinessData>(tenantId, 'cockpit_business', data); },

  async getTestimonials(tenantId: string) { return getSettingDoc<TestimonialsData>(tenantId, 'cockpit_testimonials', defaultTestimonials); },
  async saveTestimonials(tenantId: string, data: TestimonialsData) { return saveSettingDoc<TestimonialsData>(tenantId, 'cockpit_testimonials', data); },

  // Security & Technical
  async getVault(tenantId: string) { return getSettingDoc<VaultData>(tenantId, 'cockpit_vault', defaultVault); },
  async saveVault(tenantId: string, data: VaultData) { return saveSettingDoc<VaultData>(tenantId, 'cockpit_vault', data); },

  async getMaintenance(tenantId: string) { return getSettingDoc<MaintenanceData>(tenantId, 'cockpit_maintenance', defaultMaintenance); },
  async saveMaintenance(tenantId: string, data: MaintenanceData) { return saveSettingDoc<MaintenanceData>(tenantId, 'cockpit_maintenance', data); },

  async getLedger(tenantId: string) { return getSettingDoc<LedgerData>(tenantId, 'cockpit_ledger', defaultLedger); },
  async saveLedger(tenantId: string, data: LedgerData) { return saveSettingDoc<LedgerData>(tenantId, 'cockpit_ledger', data); },

  async getPredictive(tenantId: string) { return getSettingDoc<PredictiveData>(tenantId, 'cockpit_predictive', defaultPredictive); },
  async savePredictive(tenantId: string, data: PredictiveData) { return saveSettingDoc<PredictiveData>(tenantId, 'cockpit_predictive', data); },

  async getCyber(tenantId: string) { return getSettingDoc<CyberData>(tenantId, 'cockpit_cyber', defaultCyber); },
  async saveCyber(tenantId: string, data: CyberData) { return saveSettingDoc<CyberData>(tenantId, 'cockpit_cyber', data); },

  async getEnergy(tenantId: string) { return getSettingDoc<EnergyData>(tenantId, 'cockpit_energy', defaultEnergy); },
  async saveEnergy(tenantId: string, data: EnergyData) { return saveSettingDoc<EnergyData>(tenantId, 'cockpit_energy', data); },

  async getEmergency(tenantId: string) { return getSettingDoc<EmergencyData>(tenantId, 'cockpit_emergency', defaultEmergency); },
  async saveEmergency(tenantId: string, data: EmergencyData) { return saveSettingDoc<EmergencyData>(tenantId, 'cockpit_emergency', data); },
};
