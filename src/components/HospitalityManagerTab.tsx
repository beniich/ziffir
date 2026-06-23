import React, { useState } from 'react';
import { 
  Hotel,
  BedDouble, 
  UtensilsCrossed, 
  ChefHat, 
  Wine, 
  Plus, 
  Search, 
  Sliders, 
  Flame, 
  PlusCircle,
  Package,
  CheckCircle2,
  Lock,
  Unlock,
  AlertOctagon,
  Box,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Types representing Suite Status
export interface SuiteInfo {
  id: string;
  classTier: 'Presidential' | 'Royal Embassy' | 'Executive Penthouse' | 'Supreme Sand';
  guestName: string;
  occupancy: 'Occupied' | 'Vacant' | 'Reserved';
  cleaningStatus: 'Spotless' | 'In Progress' | 'Requires Attention';
  cardAccess: 'ACTIVE' | 'REVOKED' | 'STANDBY';
  temperature: number;
  notes: string;
}

// Types representing Kitchen queue
export interface KitchenItem {
  id: string;
  name: string;
  category: 'Appetizer' | 'Main Course' | 'Pastry' | 'Beverage';
  assignedChef: string;
  status: 'Awaiting Fire' | 'Slow Cooking' | 'Searing' | 'Ready to Dispatch';
  prepTimeLeft: number; // minutes
  priority: 'Standard' | 'RUSH' | 'VIP EXCLUSIVE';
  roomDestination: string;
}

// Types representing Inventory log
export interface StockItem {
  id: string;
  name: string;
  category: 'Wine & Champagne' | 'Gourmet Ingredients' | 'Fine Dining Ware' | 'Hygiene & Bedding';
  quantity: number;
  unit: string;
  minimumReserve: number;
  supplier: string;
  valuePerUnit: number;
  location: string;
}

interface HospitalityManagerTabProps {
  language: 'EN' | 'FR' | 'RU';
  addAuditLog?: (
    action: string, 
    reason: string, 
    status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT', 
    role?: string
  ) => void;
}

// Custom Tooltip component for Recharts charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-[#c19a6b]/35 p-3 rounded-xl shadow-xl backdrop-blur-sm text-xs text-white select-none font-mono z-50">
        <p className="font-bold border-b border-[#c19a6b]/20 pb-1 mb-1.5 text-slate-300">{label}</p>
        <div className="space-y-1">
          {payload.map((pld: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pld.color || pld.fill }} />
                <span className="text-slate-450 font-sans">{pld.name}:</span>
              </span>
              <span className="font-bold font-mono" style={{ color: pld.color || pld.fill }}>{pld.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const HospitalityManagerTab: React.FC<HospitalityManagerTabProps> = ({ language, addAuditLog }) => {
  // 1) Suites State
  const [suites, setSuites] = useState<SuiteInfo[]>([
    { id: 'Suite 301', classTier: 'Presidential', guestName: 'Prince Al-Saud', occupancy: 'Occupied', cleaningStatus: 'Spotless', cardAccess: 'ACTIVE', temperature: 21.5, notes: 'Prefers jasmine incense at sunset' },
    { id: 'Suite 302', classTier: 'Royal Embassy', guestName: 'Lady Genevieve', occupancy: 'Occupied', cleaningStatus: 'In Progress', cardAccess: 'ACTIVE', temperature: 20.0, notes: 'Extra high-thread linen request' },
    { id: 'Suite 401', classTier: 'Executive Penthouse', guestName: 'Dr. Elizabeth Finch', occupancy: 'Reserved', cleaningStatus: 'Spotless', cardAccess: 'STANDBY', temperature: 22.0, notes: 'Requires high-security terminal configuration' },
    { id: 'Suite 402', classTier: 'Supreme Sand', guestName: 'Maximilian Sterling', occupancy: 'Vacant', cleaningStatus: 'Requires Attention', cardAccess: 'REVOKED', temperature: 19.5, notes: 'Deep sterile audit scheduled' },
    { id: 'Suite 501', classTier: 'Presidential', guestName: 'Charlotte Dubois', occupancy: 'Occupied', cleaningStatus: 'Spotless', cardAccess: 'ACTIVE', temperature: 21.0, notes: 'Vegan pillow configurations' }
  ]);

  // 2) Kitchen Queue State
  const [kitchenQueue, setKitchenQueue] = useState<KitchenItem[]>([
    { id: 'KIT-102', name: 'Beluga Caviar Diamond Platter', category: 'Appetizer', assignedChef: 'Chef Giovanni', status: 'Searing', prepTimeLeft: 5, priority: 'VIP EXCLUSIVE', roomDestination: 'Suite 301' },
    { id: 'KIT-103', name: 'Dry-Aged Tomahawk with Gold Shavings', category: 'Main Course', assignedChef: 'Chef Pierre', status: 'Slow Cooking', prepTimeLeft: 18, priority: 'RUSH', roomDestination: 'Suite 302' },
    { id: 'KIT-104', name: 'Zafir Caramelized Pear Tartlet', category: 'Pastry', assignedChef: 'Chef Maria', status: 'Awaiting Fire', prepTimeLeft: 12, priority: 'Standard', roomDestination: 'Suite 401' },
    { id: 'KIT-105', name: 'Prestige Dom Pérignon Flutes', category: 'Beverage', assignedChef: 'Sommelier Antoine', status: 'Ready to Dispatch', prepTimeLeft: 2, priority: 'VIP EXCLUSIVE', roomDestination: 'Suite 501' }
  ]);

  // 3) Stock Inventory State
  const [stockInventory, setStockInventory] = useState<StockItem[]>([
    { id: 'STK-001', name: 'Château Margaux 2015 Premium', category: 'Wine & Champagne', quantity: 24, unit: 'Bottles', minimumReserve: 10, supplier: 'Bordeaux Elite Dispersals', valuePerUnit: 450, location: 'Cellar Block C' },
    { id: 'STK-002', name: 'Caspian Beluga Sturgeon Caviar', category: 'Gourmet Ingredients', quantity: 4.8, unit: 'Kg', minimumReserve: 2.0, supplier: 'Caspian Maritime Syndicate', valuePerUnit: 3200, location: 'Kitchen Cold Safe' },
    { id: 'STK-003', name: 'Custom Egyptian Cotton Sheets', category: 'Hygiene & Bedding', quantity: 12, unit: 'Sets', minimumReserve: 15, supplier: 'Cairo Atelier Suture', valuePerUnit: 180, location: 'Linen Chamber 2' },
    { id: 'STK-004', name: 'Gold-Rimmed Limoges Porcelain Plates', category: 'Fine Dining Ware', quantity: 60, unit: 'Pieces', minimumReserve: 50, supplier: 'Limoges Prestige Guild', valuePerUnit: 95, location: 'Kitchen Pantry A' },
    { id: 'STK-005', name: 'Black Saffron Stigmas (Iranian)', category: 'Gourmet Ingredients', quantity: 450, unit: 'Grams', minimumReserve: 200, supplier: 'Persian Spice Hub', valuePerUnit: 15, location: 'Ingredients Safe' }
  ]);

  // Searching & Filtering States
  const [suiteSearch, setSuiteSearch] = useState('');
  const [kitchenFilter, setKitchenFilter] = useState<'All' | 'Awaiting Fire' | 'Preparing' | 'Ready'>('All');
  const [stockSearch, setStockSearch] = useState('');

  // Modals / Creators Form State
  const [showAddSuite, setShowAddSuite] = useState(false);
  const [newSuiteId, setNewSuiteId] = useState('');
  const [newSuiteTier, setNewSuiteTier] = useState<SuiteInfo['classTier']>('Presidential');
  const [newSuiteGuest, setNewSuiteGuest] = useState('');
  const [newSuiteNotes, setNewSuiteNotes] = useState('');

  const [showAddDish, setShowAddDish] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishCat, setNewDishCat] = useState<KitchenItem['category']>('Main Course');
  const [newDishChef, setNewDishChef] = useState('Chef Giovanni');
  const [newDishPriority, setNewDishPriority] = useState<KitchenItem['priority']>('Standard');
  const [newDishRoom, setNewDishRoom] = useState('Suite 301');

  const [showAddStock, setShowAddStock] = useState(false);
  const [newStockName, setNewStockName] = useState('');
  const [newStockCat, setNewStockCat] = useState<StockItem['category']>('Gourmet Ingredients');
  const [newStockQty, setNewStockQty] = useState(10);
  const [newStockUnit, setNewStockUnit] = useState('Units');
  const [newStockMin, setNewStockMin] = useState(5);
  const [newStockVal, setNewStockVal] = useState(50);

  // Localization dict
  const t = {
    EN: {
      suitesTitle: "Suites & Hospitality Register",
      suitesDesc: "Real-time state overview of imperial suites, cleaning requirements, and live access credentials.",
      kitchenTitle: "Zafir Culinary Kitchen Queue",
      kitchenDesc: "Active preparation lines, fire signals, expert chef assignments, and order dispatch controls.",
      stocksTitle: "Ops Stock & Luxury Storage Console",
      stocksDesc: "Durable stock tracking for gourmet raw reserves, vintage cellars, and luxury suites items.",
      addSuiteBtn: "Commission New Suite",
      addDishBtn: "Order Kitchen Prep",
      addStockBtn: "Log Inventory Asset",
      searchSuitePlaceholder: "Search suites by guest or ID...",
      searchStockPlaceholder: "Search ingredients/items...",
      colSuite: "Suite ID",
      colClass: "Luxury Tier",
      colGuest: "Lead Occupant",
      colStatus: "Occupancy",
      colClean: "Housekeeping",
      colCard: "Keycard Access",
      colTemp: "Climate Gate",
      colDish: "Gastronomic Dish",
      colCategory: "Line",
      colChef: "Master Chef",
      colPrepStatus: "Prep Status",
      colTime: "Delay",
      colDest: "Destination",
      colPriority: "Priority",
      colQty: "Available Qty",
      colMin: "Reserve Guard",
      colValue: "Asset Value",
      colSupplier: "Syndicate Supplier",
      actions: "Operational Controls",
      cleanRoom: "Dispatch Cleaning",
      toggleAccess: "Modify Keycard",
      fireDish: "Fire Priority",
      readyDish: "Ready for Waiter",
      replenishStock: "Replenish Asset (+10)",
      criticalAlert: "REVOLVING RESERVE LOW",
      're-keyCard': "Regen Token Access",
      dashboardTitle: "Sovereign Suite Occupancy Dashboard",
      dashboardDesc: "Real-time 30-day occupancy trajectories, available reservation reserves, and luxury tier analytics.",
      trendTitle: "30-Day Availability & Occupancy Trajectory",
      breakdownTitle: "Occupancy status by Luxury Tier",
      kpiOccupancy: "Occupancy Rate",
      kpiAvailable: "Rooms Available",
      kpiReserved: "Guaranteed Reserves",
      colOccupied: "Occupied",
      colReserved: "Reserved",
      colAvailable: "Available"
    },
    FR: {
      suitesTitle: "Registre des Suites & Hospitalité",
      suitesDesc: "Vue d'ensemble en temps réel des suites impériales, des statuts de nettoyage et des accréditations.",
      kitchenTitle: "File de Production Cuisine Zafir",
      kitchenDesc: "Lignes de préparation actives, feux de cuisson, affectations des chefs et contrôle d'assiette.",
      stocksTitle: "Console d'Inventaire & Cave de Prestige",
      stocksDesc: "Suivi rigoureux des ingrédients fins, de la cave à vin et des consommables de prestige.",
      addSuiteBtn: "Commissionner une Suite",
      addDishBtn: "Lancer une Préparation",
      addStockBtn: "Ajouter un Actif Stock",
      searchSuitePlaceholder: "Rechercher une suite ou occupant...",
      searchStockPlaceholder: "Rechercher un ingrédient ou vin...",
      colSuite: "N° de Suite",
      colClass: "Gamme de Prestige",
      colGuest: "Occupant Majeur",
      colStatus: "Occupation",
      colClean: "Entretien Salles",
      colCard: "Accès Magnétique",
      colTemp: "Régulation Climat",
      colDish: "Création Culinaire",
      colCategory: "Discipline",
      colChef: "Chef de Partie",
      colPrepStatus: "État de Cuisson",
      colTime: "Temps Restant",
      colDest: "Destination",
      colPriority: "Urgence",
      colQty: "Quantité en Stock",
      colMin: "Alerte Réserve",
      colValue: "Valeur Unitaire",
      colSupplier: "Fournisseur",
      actions: "Contrôles",
      cleanRoom: "Donner Entretien",
      toggleAccess: "Modifier Droits",
      fireDish: "Lancer à Plein Feu",
      readyDish: "Prêt au Service",
      replenishStock: "Réapprovisionner (+10)",
      criticalAlert: "RÉSERVE CRITIQUE BASSE",
      're-keyCard': "Régénérer Accès Card",
      dashboardTitle: "Tableau de Bord d'Occupation des Suites",
      dashboardDesc: "Analyse en temps réel de l'occupation sur 30 jours, des réserves de réservation et des gammes de luxe.",
      trendTitle: "Trajectoire d'Occupation et Disponibilité sur 30 Jours",
      breakdownTitle: "Statut d'occupation par Gamme de Prestige",
      kpiOccupancy: "Taux d'Occupation",
      kpiAvailable: "Suites Disponibles",
      kpiReserved: "Réserves Garanties",
      colOccupied: "Occupé",
      colReserved: "Réservé",
      colAvailable: "Disponible"
    },
    RU: {
      suitesTitle: "Реестр Апартаментов и Безопасности",
      suitesDesc: "Мониторинг статуса люксовых номеров, расписания уборки и состояния магнитных карт-ключей.",
      kitchenTitle: "Кулинарная Очередь Ресторана Zafir",
      kitchenDesc: "Активные посты приготовления, приоритеты шеф-поваров и диспетчерская служба доставки.",
      stocksTitle: "Склад Деликатесов и Премиум Запасы",
      stocksDesc: "Система учета редких ингредиентов, винных коллекций и предметов роскоши.",
      addSuiteBtn: "Зарегистрировать Номер",
      addDishBtn: "Заказать на Кухню",
      addStockBtn: "Внести Актив Склада",
      searchSuitePlaceholder: "Поиск по гостю или номеру...",
      searchStockPlaceholder: "Искать деликатесы или вина...",
      colSuite: "Номер Люкса",
      colClass: "Уровень Роскоши",
      colGuest: "Главный Гость",
      colStatus: "Заселение",
      colClean: "Статус Уборки",
      colCard: "Статус Ключ-карты",
      colTemp: "Температура",
      colDish: "Заказ Блюда",
      colCategory: "Категория",
      colChef: "Шеф-Повар",
      colPrepStatus: "Статус Готовки",
      colTime: "Таймер",
      colDest: "Куда Доставить",
      colPriority: "Приоритет",
      colQty: "Количество",
      colMin: "Лимит Охраны",
      colValue: "Стоимость",
      colSupplier: "Официальный Поставщик",
      actions: "Операции управления",
      cleanRoom: "Начать Уборку",
      toggleAccess: "Изменить Доступ",
      fireDish: "Ускорить жарку!",
      readyDish: "Готово к подаче",
      replenishStock: "Пополнить Склад (+10)",
      criticalAlert: "ЗАПАСЫ НИЖЕ ЛИМИТА",
      're-keyCard': "Выпустить Новую Карту",
      dashboardTitle: "Аналитическая Панель Занятости Номеров",
      dashboardDesc: "Реально-временной мониторинг траектории за 30 дней, резервов бронирования и категорий люксов.",
      trendTitle: "Динамика Занятости и Свободных Мест за 30 Дней",
      breakdownTitle: "Занятость по Уровням Роскоши Номеров",
      kpiOccupancy: "Уровень Загрузки",
      kpiAvailable: "Свободные Номера",
      kpiReserved: "Гарантированный Резерв",
      colOccupied: "Занято",
      colReserved: "Резерв",
      colAvailable: "Свободно"
    }
  }[language];

  // 30-Day Trend Data Generator based on real-time suites state
  const trendData = React.useMemo(() => {
    const data = [];
    const total = suites.length || 5;
    
    // Seed dates from 29 days ago up to yesterday
    for (let i = 29; i > 0; i--) {
      const d = new Date(2026, 5, 22 - i); // June 22 is month index 5
      const dateStr = d.toLocaleDateString(language === 'RU' ? 'ru-RU' : language === 'FR' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' });
      
      // Let's seed stable fluctuating historic data based on the indices of the days so it doesn't change randomly every frame
      const seedVal = (i * 7) % 5;
      const occupiedHist = Math.max(1, Math.min(total, Math.round(total * 0.7) + (seedVal % 2 === 0 ? 1 : -1)));
      const reservedHist = Math.max(0, Math.min(total - occupiedHist, (seedVal % 3 === 0 ? 1 : 0)));
      const vacantHist = Math.max(0, total - occupiedHist - reservedHist);
      
      data.push({
        date: dateStr,
        [t.colOccupied]: occupiedHist,
        [t.colReserved]: reservedHist,
        [t.colAvailable]: vacantHist,
        [t.kpiOccupancy]: Math.round((occupiedHist / total) * 100)
      });
    }
    
    // Today's dynamic live data point
    const todayOccupied = suites.filter(s => s.occupancy === 'Occupied').length;
    const todayReserved = suites.filter(s => s.occupancy === 'Reserved').length;
    const todayVacant = suites.filter(s => s.occupancy === 'Vacant').length;
    const todayRate = total > 0 ? Math.round((todayOccupied / total) * 100) : 0;
    
    const todayDate = new Date(2026, 5, 22);
    const todayStr = todayDate.toLocaleDateString(language === 'RU' ? 'ru-RU' : language === 'FR' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' });
    
    data.push({
      date: todayStr + ' (Today)',
      [t.colOccupied]: todayOccupied,
      [t.colReserved]: todayReserved,
      [t.colAvailable]: todayVacant,
      [t.kpiOccupancy]: todayRate
    });
    
    return data;
  }, [suites, language, t]);

  // Luxury Tiers breakdown counts calculation
  const tierOccupancyData = React.useMemo(() => {
    const tiers: Record<SuiteInfo['classTier'], { Occupied: number, Reserved: number, Vacant: number }> = {
      'Presidential': { Occupied: 0, Reserved: 0, Vacant: 0 },
      'Royal Embassy': { Occupied: 0, Reserved: 0, Vacant: 0 },
      'Executive Penthouse': { Occupied: 0, Reserved: 0, Vacant: 0 },
      'Supreme Sand': { Occupied: 0, Reserved: 0, Vacant: 0 }
    };
    
    suites.forEach(s => {
      if (tiers[s.classTier]) {
        if (s.occupancy === 'Occupied') tiers[s.classTier].Occupied++;
        else if (s.occupancy === 'Reserved') tiers[s.classTier].Reserved++;
        else tiers[s.classTier].Vacant++;
      }
    });
    
    return Object.keys(tiers).map(key => ({
      tier: key,
      [t.colOccupied]: tiers[key as SuiteInfo['classTier']].Occupied,
      [t.colReserved]: tiers[key as SuiteInfo['classTier']].Reserved,
      [t.colAvailable]: tiers[key as SuiteInfo['classTier']].Vacant
    }));
  }, [suites, t]);

  // Actions implementations
  const handleToggleOccupancy = (id: string) => {
    setSuites(prev => prev.map(s => {
      if (s.id === id) {
        const occupancies: SuiteInfo['occupancy'][] = ['Occupied', 'Reserved', 'Vacant'];
        const currentIndex = occupancies.indexOf(s.occupancy);
        const nextOccupancy = occupancies[(currentIndex + 1) % occupancies.length];
        
        if (addAuditLog) {
          addAuditLog(
            'SUITE_OCCUPANCY_TOGGLED',
            `Suite ID ${s.id} occupancy state cycled from ${s.occupancy} to ${nextOccupancy}.`,
            'AUTHORIZED',
            'MANAGER'
          );
        }
        return { ...s, occupancy: nextOccupancy };
      }
      return s;
    }));
    confetti({ particleCount: 15, colors: ['#4f46e5', '#c19a6b'] });
  };

  const handleCleanSuite = (id: string) => {
    setSuites(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.cleaningStatus === 'Requires Attention' ? 'In Progress' : 'Spotless';
        if (addAuditLog) {
          addAuditLog(
            'HOSPITALITY_HOUSEKEEPING_UPDATE',
            `Housekeeping scheduled for ${s.id} (${s.guestName}). Status updated to ${nextStatus}.`,
            'AUTHORIZED',
            'MANAGER'
          );
        }
        return { ...s, cleaningStatus: nextStatus };
      }
      return s;
    }));
    confetti({ particleCount: 20, colors: ['#c19a6b', '#ffffff'] });
  };

  const handleToggleCardAccess = (id: string) => {
    setSuites(prev => prev.map(s => {
      if (s.id === id) {
        const nextAccess: SuiteInfo['cardAccess'] = s.cardAccess === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
        if (addAuditLog) {
          addAuditLog(
            'SUITE_SECURITY_DECK_CARD',
            `Guest RFID badge modified for Suite ID: ${s.id}. Status set to: ${nextAccess}. Encryption key rebuilt.`,
            'AUTHORIZED',
            'MANAGER'
          );
        }
        return { ...s, cardAccess: nextAccess };
      }
      return s;
    }));
  };

  const handleFireDish = (id: string) => {
    setKitchenQueue(prev => prev.map(k => {
      if (k.id === id) {
        if (addAuditLog) {
          addAuditLog(
            'KITCHEN_PRIORITY_FIRE',
            `Chef Commander triggered FIRE priority on order: ${k.name} for ${k.roomDestination}. Prep speed optimized.`,
            'AUTHORIZED',
            'AESTHETIC_ENGINEER'
          );
        }
        return { ...k, status: 'Searing', priority: 'RUSH', prepTimeLeft: Math.max(1, k.prepTimeLeft - 4) };
      }
      return k;
    }));
    confetti({ particleCount: 30, colors: ['#f97316', '#ef4444', '#fef08a'] });
  };

  const handleReadyDish = (id: string, name: string, dest: string) => {
    setKitchenQueue(prev => prev.filter(k => k.id !== id));
    if (addAuditLog) {
      addAuditLog(
        'KITCHEN_ORDER_DISPATCHED',
        `Culinary masterpiece "${name}" dispatched on silver cart to ${dest}. Hand-signed by master culinary squad.`,
        'AUTHORIZED',
        'VIP_BUTLER'
      );
    }
    confetti({ particleCount: 45, spread: 80 });
  };

  const handleReplenishStock = (id: string, name: string) => {
    setStockInventory(prev => prev.map(item => {
      if (item.id === id) {
        const addedValue = item.unit === 'Kg' ? 5 : item.unit === 'Bottles' ? 12 : 24;
        const newQty = item.quantity + addedValue;
        if (addAuditLog) {
          addAuditLog(
            'INVENTORY_RESTOCK_COMMITTED',
            `Restocked luxurious resource: ${name}. Added ${addedValue} ${item.unit}. New balance recorded: ${newQty} ${item.unit}.`,
            'AUTHORIZED',
            'MANAGER'
          );
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
    confetti({ particleCount: 15, colors: ['#10b981', '#34d399'] });
  };

  // Creation logic
  const handleAddSuiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuiteId || !newSuiteGuest) return;
    const newSuite: SuiteInfo = {
      id: newSuiteId.startsWith('Suite') ? newSuiteId : `Suite ${newSuiteId}`,
      classTier: newSuiteTier,
      guestName: newSuiteGuest,
      occupancy: 'Reserved',
      cleaningStatus: 'Spotless',
      cardAccess: 'ACTIVE',
      temperature: 21.0,
      notes: newSuiteNotes || 'Standard operations guide applied'
    };
    setSuites(prev => [...prev, newSuite]);
    setShowAddSuite(false);
    setNewSuiteId('');
    setNewSuiteGuest('');
    setNewSuiteNotes('');
    if (addAuditLog) {
      addAuditLog('HOSPITALITY_SUITE_COMMISSIONED', `Commissioned new sovereign suite ${newSuite.id} logged to database files.`, 'AUTHORIZED', 'MANAGER');
    }
  };

  const handleAddDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName) return;
    const newId = `KIT-${Math.floor(100 + Math.random() * 900)}`;
    const newDish: KitchenItem = {
      id: newId,
      name: newDishName,
      category: newDishCat,
      assignedChef: newDishChef,
      status: 'Awaiting Fire',
      prepTimeLeft: 15,
      priority: newDishPriority,
      roomDestination: newDishRoom
    };
    setKitchenQueue(prev => [...prev, newDish]);
    setShowAddDish(false);
    setNewDishName('');
    if (addAuditLog) {
      addAuditLog('KITCHEN_ORDER_LOGGED', `Enqueued culinary order recipe ${newDish.name} in operations grid.`, 'AUTHORIZED', 'VIP_BUTLER');
    }
  };

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockName) return;
    const newId = `STK-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: StockItem = {
      id: newId,
      name: newStockName,
      category: newStockCat,
      quantity: Number(newStockQty),
      unit: newStockUnit,
      minimumReserve: Number(newStockMin),
      supplier: 'Sovereign Global Sourcing Group',
      valuePerUnit: Number(newStockVal),
      location: 'Primary Pantry Lock'
    };
    setStockInventory(prev => [...prev, newItem]);
    setShowAddStock(false);
    setNewStockName('');
    if (addAuditLog) {
      addAuditLog('INVENTORY_ASSET_LOGGED', `Cataloged deluxe logistical resource: ${newItem.name} (Value: $${newItem.valuePerUnit}).`, 'AUTHORIZED', 'MANAGER');
    }
  };

  // Filter computations
  const filteredSuites = suites.filter(s => 
    s.id.toLowerCase().includes(suiteSearch.toLowerCase()) ||
    s.guestName.toLowerCase().includes(suiteSearch.toLowerCase()) ||
    s.classTier.toLowerCase().includes(suiteSearch.toLowerCase())
  );

  const filteredKitchen = kitchenQueue.filter(k => {
    if (kitchenFilter === 'All') return true;
    if (kitchenFilter === 'Awaiting Fire') return k.status === 'Awaiting Fire';
    if (kitchenFilter === 'Preparing') return k.status === 'Searing' || k.status === 'Slow Cooking';
    if (kitchenFilter === 'Ready') return k.status === 'Ready to Dispatch';
    return true;
  });

  const filteredStock = stockInventory.filter(stk => 
    stk.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
    stk.category.toLowerCase().includes(stockSearch.toLowerCase()) ||
    stk.location.toLowerCase().includes(stockSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in" id="hospitality-manager-tab">
      
      {/* EXQUISITE RECHARTS SUITE OCCUPANCY DASHBOARD */}
      <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl overflow-hidden relative" id="hospitality-occupancy-dashboard">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-black/5 pb-5 mb-6">
          <div className="flex items-start gap-4">
            <span className="p-3 bg-[#c19a6b]/10 text-[#7c5a30] rounded-2xl border border-[#c19a6b]/25 shadow-sm">
              <TrendingUp className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h1 className="text-xl font-serif-luxury font-bold text-slate-800 tracking-tight">{t.dashboardTitle}</h1>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{t.dashboardDesc}</p>
            </div>
          </div>

          {/* Quick Metrics KPI Cards */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto self-stretch md:self-auto">
            {/* KPI 1 */}
            <div className="bg-white/60 border border-slate-200 p-2.5 px-4 rounded-2xl flex flex-col justify-center min-w-[100px] shadow-sm">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">{t.kpiOccupancy}</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold font-mono text-indigo-600">
                  {suites.length > 0 ? Math.round((suites.filter(s => s.occupancy === 'Occupied').length / suites.length) * 100) : 0}%
                </span>
                <span className="text-[9px] font-mono text-emerald-600 font-bold">▲ Live</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white/60 border border-slate-200 p-2.5 px-4 rounded-2xl flex flex-col justify-center min-w-[100px] shadow-sm">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">{t.kpiAvailable}</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold font-mono text-slate-800">
                  {suites.filter(s => s.occupancy === 'Vacant').length}
                </span>
                <span className="text-[9px] font-mono text-slate-400">/ {suites.length}</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white/60 border border-slate-200 p-2.5 px-4 rounded-2xl flex flex-col justify-center min-w-[100px] shadow-sm">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">{t.kpiReserved}</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold font-mono text-amber-700">
                  {suites.filter(s => s.occupancy === 'Reserved').length}
                </span>
                <span className="text-[9px] font-mono text-amber-500">★ Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 30-Day Trend Chart */}
          <div className="lg:col-span-8 bg-slate-50/50 border border-black/5 p-4 rounded-2xl shadow-inner flex flex-col justify-between" style={{ minHeight: '320px' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                📈 {t.trendTitle}
              </h3>
              <span className="px-2 py-0.5 bg-[#c19a6b]/20 text-[#7c5a30] border border-[#c19a6b]/35 font-mono text-[9px] font-bold uppercase rounded">
                Live Feeds
              </span>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorReserved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorVacant" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'monospace' }} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: '#475569' }}
                  />
                  <Area 
                    type="monotone" 
                    name={t.colOccupied}
                    dataKey={t.colOccupied} 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorOccupied)" 
                    stackId="1"
                  />
                  <Area 
                    type="monotone" 
                    name={t.colReserved}
                    dataKey={t.colReserved} 
                    stroke="#d97706" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorReserved)" 
                    stackId="1"
                  />
                  <Area 
                    type="monotone" 
                    name={t.colAvailable}
                    dataKey={t.colAvailable} 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorVacant)" 
                    stackId="1"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown per Luxury class */}
          <div className="lg:col-span-4 bg-slate-50/50 border border-black/5 p-4 rounded-2xl shadow-inner flex flex-col justify-between" style={{ minHeight: '320px' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                🏛️ {t.breakdownTitle}
              </h3>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tierOccupancyData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="tier" 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 8, fill: '#64748b' }} 
                    tickFormatter={(value) => value.split(' ')[0]} // short display name for nice spacing
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'monospace' }} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="square"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: '#475569' }}
                  />
                  <Bar name={t.colOccupied} dataKey={t.colOccupied} fill="#4f46e5" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar name={t.colReserved} dataKey={t.colReserved} fill="#d97706" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar name={t.colAvailable} dataKey={t.colAvailable} fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Dynamic Interactions hint bar */}
        <div className="mt-4 p-3.5 bg-indigo-50/60 dark:bg-slate-900/30 rounded-2xl border border-indigo-200/40 text-[10px] text-slate-500 font-mono leading-relaxed flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span>
            💡 <strong className="text-indigo-750 font-bold">Real-Time Interactive State Engine:</strong> You can click the occupancy badges inside the active registry ledger below to cycle suite occupancy statuses. The dashboard trends and charts immediately sync and re-plot points dynamically!
          </span>
        </div>
      </div>

      {/* 1) GESTION DES SUITES TABLE */}
      <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-black/5 pb-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="p-3 bg-indigo-500/10 text-indigo-700 rounded-2xl border border-indigo-500/20">
              <Hotel className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-serif-luxury font-bold text-slate-800">{t.suitesTitle}</h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{t.suitesDesc}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder={t.searchSuitePlaceholder}
                value={suiteSearch}
                onChange={(e) => setSuiteSearch(e.target.value)}
                className="pl-8 pr-4 py-1.5 w-full md:w-64 bg-white/60 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#c19a6b] font-mono"
              />
            </div>
            <button
              onClick={() => setShowAddSuite(!showAddSuite)}
              className="py-1.5 px-3.5 bg-[#c19a6b] hover:bg-[#7c5a30] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{showAddSuite ? 'Close' : 'Add'}</span>
            </button>
          </div>
        </div>

        {/* Modal-like form drawer inline */}
        {showAddSuite && (
          <form onSubmit={handleAddSuiteSubmit} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Suite ID / Number</label>
              <input 
                type="text" 
                placeholder="e.g. 502" 
                value={newSuiteId}
                onChange={(e) => setNewSuiteId(e.target.value)}
                required
                className="p-2 border rounded-xl bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Suite Class Tier</label>
              <select 
                value={newSuiteTier}
                onChange={(e) => setNewSuiteTier(e.target.value as SuiteInfo['classTier'])}
                className="p-2 border rounded-xl bg-white"
              >
                <option value="Presidential">Presidential Suite</option>
                <option value="Royal Embassy">Royal Embassy Suite</option>
                <option value="Executive Penthouse">Executive Penthouse</option>
                <option value="Supreme Sand">Supreme Sand Suite</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Lead Guest Name</label>
              <input 
                type="text" 
                placeholder="e.g. Lord Byron" 
                value={newSuiteGuest}
                onChange={(e) => setNewSuiteGuest(e.target.value)}
                required
                className="p-2 border rounded-xl bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Ambience Custom Notes</label>
              <input 
                type="text" 
                placeholder="e.g. Lavender mist at morning" 
                value={newSuiteNotes}
                onChange={(e) => setNewSuiteNotes(e.target.value)}
                className="p-2 border rounded-xl bg-white"
              />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button 
                type="submit" 
                className="bg-[#c19a6b] hover:bg-[#7c5a30] text-white px-4 py-2 rounded-xl text-xs uppercase font-bold text-center"
              >
                Commission Suite Entry
              </button>
            </div>
          </form>
        )}

        {/* Suites Main Table */}
        <div className="overflow-x-auto rounded-2xl border border-black/5">
          <table className="w-full text-left border-collapse" id="suites-hospitality-table">
            <thead>
              <tr className="bg-slate-50 border-b border-black/5 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                <th className="py-3 px-4">{t.colSuite}</th>
                <th className="py-3 px-4">{t.colClass}</th>
                <th className="py-3 px-4">{t.colGuest}</th>
                <th className="py-3 px-4">{t.colStatus}</th>
                <th className="py-3 px-4">{t.colClean}</th>
                <th className="py-3 px-4">{t.colCard}</th>
                <th className="py-3 px-4">{t.colTemp}</th>
                <th className="py-3 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs text-slate-700">
              {filteredSuites.map((s) => (
                <tr key={s.id} className="hover:bg-white/50 transition duration-150">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-indigo-500" />
                      {s.id}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans-luxury">
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-indigo-500/5 text-indigo-700 font-semibold border border-indigo-500/10">
                      {s.classTier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div>
                      <p>{s.guestName}</p>
                      <p className="text-[9px] text-slate-400 font-mono font-normal italic">{s.notes}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <button
                      onClick={() => handleToggleOccupancy(s.id)}
                      title="Click to cycle occupancy status"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all outline-none border ${
                        s.occupancy === 'Occupied' ? 'bg-amber-100/90 text-amber-700 border-amber-200' :
                        s.occupancy === 'Reserved' ? 'bg-sky-100/90 text-sky-700 border-sky-200' :
                        'bg-slate-100/90 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${s.occupancy === 'Occupied' ? 'bg-amber-500 animate-pulse' : s.occupancy === 'Reserved' ? 'bg-sky-500' : 'bg-slate-400'}`} />
                      <span>{s.occupancy}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.cleaningStatus === 'Spotless' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                      s.cleaningStatus === 'In Progress' ? 'bg-sky-500/15 text-sky-600 animate-pulse' :
                      'bg-rose-500/10 text-rose-600 font-bold'
                    }`}>
                      {s.cleaningStatus === 'Spotless' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                      {s.cleaningStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                      s.cardAccess === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-600'
                    }`}>
                      {s.cardAccess === 'ACTIVE' ? <Unlock className="w-3 h-3 text-emerald-500" /> : <Lock className="w-3 h-3 text-red-500" />}
                      {s.cardAccess}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    <div className="flex items-center gap-1">
                      <span>{s.temperature}°C</span>
                      <Sliders className="w-3 h-3 text-slate-400" />
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleCleanSuite(s.id)}
                        className="py-1 px-2.5 hover:bg-emerald-600 hover:text-white bg-emerald-500/10 text-emerald-700 font-mono text-[10px] font-bold rounded-lg border border-emerald-500/20 transition-all active:scale-95 duration-150"
                        title={t.cleanRoom}
                      >
                        {s.cleaningStatus === 'Requires Attention' ? 'Clean Now' : 'Refresh'}
                      </button>
                      <button 
                        onClick={() => handleToggleCardAccess(s.id)}
                        className="p-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] rounded-lg border border-slate-350 transition-all"
                        title={t.toggleAccess}
                      >
                        Sec Key
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2) CUISINE PRODUCTION MANAGER */}
      <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-black/5 pb-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="p-3 bg-amber-500/10 text-amber-700 rounded-2xl border border-amber-500/20">
              <ChefHat className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-serif-luxury font-bold text-slate-800">{t.kitchenTitle}</h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{t.kitchenDesc}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Filter buttons */}
            <div className="inline-flex rounded-lg bg-black/5 p-0.5">
              {(['All', 'Awaiting Fire', 'Preparing', 'Ready'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setKitchenFilter(opt)}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded-md transition ${
                    kitchenFilter === opt ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowAddDish(!showAddDish)}
              className="py-1.5 px-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shrink-0"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>{showAddDish ? 'Close' : 'Order'}</span>
            </button>
          </div>
        </div>

        {/* Dish creation drawer form */}
        {showAddDish && (
          <form onSubmit={handleAddDishSubmit} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in grid grid-cols-1 md:grid-cols-5 gap-4 text-xs font-mono">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Recipe Dish Name</label>
              <input 
                type="text" 
                placeholder="e.g. White Truffle Ravioli" 
                value={newDishName}
                onChange={(e) => setNewDishName(e.target.value)}
                required
                className="p-2 border rounded-xl bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Course Classification</label>
              <select 
                value={newDishCat}
                onChange={(e) => setNewDishCat(e.target.value as KitchenItem['category'])}
                className="p-2 border rounded-xl bg-white"
              >
                <option value="Appetizer">Appetizer platter</option>
                <option value="Main Course">Main Course dish</option>
                <option value="Pastry">Pastry or dessert</option>
                <option value="Beverage">Luxury wine or cocktail</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Assigned Master Chef</label>
              <input 
                type="text" 
                placeholder="e.g. Sommelier Antoine" 
                value={newDishChef}
                onChange={(e) => setNewDishChef(e.target.value)}
                className="p-2 border rounded-xl bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Priority Code</label>
              <select 
                value={newDishPriority}
                onChange={(e) => setNewDishPriority(e.target.value as KitchenItem['priority'])}
                className="p-2 border rounded-xl bg-white"
              >
                <option value="Standard">Standard Protocol</option>
                <option value="RUSH">Aesthetic RUSH</option>
                <option value="VIP EXCLUSIVE">VIP EXCLUSIVE SITTING</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Destination Suite</label>
              <input 
                type="text" 
                placeholder="e.g. Suite 305" 
                value={newDishRoom}
                onChange={(e) => setNewDishRoom(e.target.value)}
                required
                className="p-2 border rounded-xl bg-white"
              />
            </div>
            <div className="md:col-span-12 flex justify-end">
              <button 
                type="submit" 
                className="bg-[#c19a6b] hover:bg-[#7c5a30] text-white px-4 py-2 rounded-xl text-xs uppercase font-bold text-center"
              >
                Route Order to Kitchen Logs
              </button>
            </div>
          </form>
        )}

        {/* Kitchen main table */}
        <div className="overflow-x-auto rounded-2xl border border-black/5">
          <table className="w-full text-left border-collapse" id="kitchen-queue-table">
            <thead>
              <tr className="bg-slate-50 border-b border-black/5 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">{t.colDish}</th>
                <th className="py-3 px-4">{t.colChef}</th>
                <th className="py-3 px-4">{t.colPrepStatus}</th>
                <th className="py-3 px-4">{t.colTime}</th>
                <th className="py-3 px-4">{t.colDest}</th>
                <th className="py-3 px-4">{t.colPriority}</th>
                <th className="py-3 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs text-slate-700">
              {filteredKitchen.map((k) => (
                <tr key={k.id} className="hover:bg-white/50 transition duration-150">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-600">{k.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Wine className="w-3.5 h-3.5 text-amber-500" />
                      {k.name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{k.assignedChef}</td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      k.status === 'Ready to Dispatch' ? 'bg-emerald-500/10 text-emerald-600' :
                      k.status === 'Searing' ? 'bg-[#c19a6b]/20 text-[#7c5a30] animate-pulse' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {k.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-amber-800 font-bold">
                    {k.prepTimeLeft} min
                  </td>
                  <td className="py-3.5 px-4 font-mono text-indigo-600 font-bold">
                    {k.roomDestination}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-bold ${
                      k.priority === 'VIP EXCLUSIVE' ? 'bg-indigo-600 text-white' :
                      k.priority === 'RUSH' ? 'bg-red-500 text-white animate-pulse' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {k.priority}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {k.status !== 'Ready to Dispatch' && (
                        <button 
                          onClick={() => handleFireDish(k.id)}
                          className="py-1 px-2 hover:bg-amber-600 hover:text-white bg-amber-500/10 text-amber-800 font-mono text-[10px] font-bold rounded-lg border border-amber-500/20 transition-all flex items-center gap-1"
                          title={t.fireDish}
                        >
                          <Flame className="w-3 h-3 text-red-500 animate-bounce" />
                          <span>FIRE</span>
                        </button>
                      )}
                      <button 
                        onClick={() => handleReadyDish(k.id, k.name, k.roomDestination)}
                        className="py-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-[10px] font-bold rounded-lg transition-all"
                        title={t.readyDish}
                      >
                        Fulfill
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3) OPS STOCK AND LUXURY STORAGE CONSOLE */}
      <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-black/5 pb-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="p-3 bg-emerald-500/10 text-emerald-700 rounded-2xl border border-emerald-500/20">
              <Package className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-serif-luxury font-bold text-slate-800">{t.stocksTitle}</h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{t.stocksDesc}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder={t.searchStockPlaceholder}
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="pl-8 pr-4 py-1.5 w-full md:w-64 bg-white/60 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#c19a6b] font-mono"
              />
            </div>
            <button
              onClick={() => setShowAddStock(!showAddStock)}
              className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddStock ? 'Close' : 'Add Item'}</span>
            </button>
          </div>
        </div>

        {/* Stock addition drawer form */}
        {showAddStock && (
          <form onSubmit={handleAddStockSubmit} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in grid grid-cols-1 md:grid-cols-5 gap-4 text-xs font-mono">
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Asset Name</label>
              <input 
                type="text" 
                placeholder="e.g. Imperial Beluga Pearl Spoons" 
                value={newStockName}
                onChange={(e) => setNewStockName(e.target.value)}
                required
                className="p-2 border rounded-xl bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Category</label>
              <select 
                value={newStockCat}
                onChange={(e) => setNewStockCat(e.target.value as StockItem['category'])}
                className="p-2 border rounded-xl bg-white"
              >
                <option value="Wine & Champagne">Wine & Champagne cellars</option>
                <option value="Gourmet Ingredients">Gourmet Raw Ingredients</option>
                <option value="Fine Dining Ware">Fine Gourmet Silver/Plates</option>
                <option value="Hygiene & Bedding">Linens & Premium Spa items</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Current On-Hand</label>
              <input 
                type="number" 
                value={newStockQty}
                onChange={(e) => setNewStockQty(Number(e.target.value))}
                className="p-2 border rounded-xl bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Asset Unit Type</label>
              <input 
                type="text" 
                placeholder="Bottles / Kg / Sets" 
                value={newStockUnit}
                onChange={(e) => setNewStockUnit(e.target.value)}
                className="p-2 border rounded-xl bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Min Safety Reserve</label>
              <input 
                type="number" 
                value={newStockMin}
                onChange={(e) => setNewStockMin(Number(e.target.value))}
                className="p-2 border rounded-xl bg-white"
              />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Unit Value/Per Price (USD)</label>
              <input 
                type="number" 
                value={newStockVal}
                onChange={(e) => setNewStockVal(Number(e.target.value))}
                className="p-2 border rounded-xl bg-white"
              />
            </div>
            <div className="md:col-span-5 flex justify-end">
              <button 
                type="submit" 
                className="bg-[#c19a6b] hover:bg-[#7c5a30] text-white px-4 py-2 rounded-xl text-xs uppercase font-bold text-center"
              >
                Log Registry Asset Row
              </button>
            </div>
          </form>
        )}

        {/* Stock main table */}
        <div className="overflow-x-auto rounded-2xl border border-black/5">
          <table className="w-full text-left border-collapse" id="pantry-stock-table">
            <thead>
              <tr className="bg-slate-50 border-b border-black/5 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                <th className="py-3 px-4">Item Ref ID</th>
                <th className="py-3 px-4">Logistical Item Name</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">{t.colQty}</th>
                <th className="py-3 px-4">{t.colMin}</th>
                <th className="py-3 px-4">Sovereign Supplier</th>
                <th className="py-3 px-4">{t.colValue}</th>
                <th className="py-3 px-4">Alert Grid</th>
                <th className="py-3 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs text-slate-700">
              {filteredStock.map((stk) => {
                const isUnderMinimum = stk.quantity < stk.minimumReserve;
                return (
                  <tr key={stk.id} className="hover:bg-white/50 transition duration-150">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{stk.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5 text-emerald-600" />
                        {stk.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px]">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-350">
                        {stk.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-800">{stk.quantity} {stk.unit}</span>
                        {/* Progress level bar representation */}
                        <div className="w-24 h-1.5 bg-black/5 rounded-full overflow-hidden">
                          <div className={`h-full ${isUnderMinimum ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (stk.quantity / (stk.minimumReserve * 2)) * 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {stk.minimumReserve} {stk.unit}
                    </td>
                    <td className="py-3.5 px-4 italic text-slate-600">{stk.supplier}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#7c5a30]">
                      ${stk.valuePerUnit} <span className="text-[9px] text-slate-400 font-normal">/ unit</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {isUnderMinimum ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 font-bold text-[9px] border border-rose-400/50 shadow-[0_0_10px_rgba(239,68,68,0.15)] relative overflow-visible">
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                          </span>
                          <AlertOctagon className="w-3 h-3 text-rose-600 shrink-0" />
                          <span className="tracking-wider uppercase">LOW STOCK</span>
                        </span>
                       ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-750 text-[9px] font-bold border border-emerald-400/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="tracking-wider uppercase">OPTIMIZED</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <button 
                        onClick={() => handleReplenishStock(stk.id, stk.name)}
                        className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold rounded-lg transition-all"
                      >
                        {t.replenishStock}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
