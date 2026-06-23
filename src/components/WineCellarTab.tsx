import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wine as WineIcon, 
  Thermometer, 
  Droplet, 
  Activity, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Check, 
  RefreshCw, 
  PlusCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import confetti from 'canvas-confetti';

// Interface representing a Wine Bottle entry in "La Cave des Souverains"
export interface WineBottle {
  id: string;
  cuvee: string;
  vintage: number;
  appellation: string;
  region: string;
  country: string;
  color: 'RED' | 'WHITE' | 'ROSE' | 'CHAMPAGNE' | 'SPIRIT';
  rarity: 'STANDARD' | 'RESERVE' | 'COLLECTION' | 'EXCEPTIONAL';
  bottleCount: number;
  storageLocation: string;
  idealTemp: number; // in Celsius
  idealHumidity: number; // in %
  bottlePrice: number; // in EUR
  authenticityHash: string; // Cryptographic SHA signature
  sommelierNotes: string;
  pairingNotes: string;
}

interface WineCellarTabProps {
  language: 'EN' | 'FR' | 'RU';
  addAuditLog?: (action: string, reason: string, status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT', roleStr?: string) => void;
  fontStyle?: 'standard' | 'cyberpunk' | 'luxury';
}

const INITIAL_WINES: WineBottle[] = [
  {
    id: "WINE-001",
    cuvee: "Château Pétrus",
    vintage: 1989,
    appellation: "Pomerol Grand Cru",
    region: "Bordeaux",
    country: "France",
    color: "RED",
    rarity: "EXCEPTIONAL",
    bottleCount: 3,
    storageLocation: "Acajou Vault A - Casier 04",
    idealTemp: 13,
    idealHumidity: 72,
    bottlePrice: 4200,
    authenticityHash: "0x89e2c69fc1a2a4b8adbe55919e3cf73a5585b2ad0dbec7a44f9104fae01934bc",
    sommelierNotes: "Legendary vintage. Absolute symmetry of truffles, black cherries, and sweet spices. Extremely long and velvety finish.",
    pairingNotes: "Saddle of French venison, Périgord black truffles, dry-aged Charolais."
  },
  {
    id: "WINE-002",
    cuvee: "Domaine de la Romanée-Conti",
    vintage: 1997,
    appellation: "Grand Cru",
    region: "Bourgogne",
    country: "France",
    color: "RED",
    rarity: "EXCEPTIONAL",
    bottleCount: 2,
    storageLocation: "Acajou Vault A - Casier 01",
    idealTemp: 12,
    idealHumidity: 70,
    bottlePrice: 18500,
    authenticityHash: "0x4ca790be908cfbc0f12adba8e309fc2ff3daed44fb8dac04fb91ff85cc82119c",
    sommelierNotes: "Seductive rose petal, rich oriental spice, and wild mushroom aroma. Sublime complexity on the palate.",
    pairingNotes: "Roasted roasted Bresse chicken with autumn chanterelles, pan-seared duck breast."
  },
  {
    id: "WINE-003",
    cuvee: "Dom Pérignon Plénitude 2",
    vintage: 2002,
    appellation: "Champagne Grand Cru",
    region: "Champagne",
    country: "France",
    color: "CHAMPAGNE",
    rarity: "COLLECTION",
    bottleCount: 6,
    storageLocation: "Chambre Froide B - Casier 14",
    idealTemp: 9,
    idealHumidity: 75,
    bottlePrice: 480,
    authenticityHash: "0xf3da90be103cfac0882adba8f229fc12d4faed00fb8cac24fc91ef95cc91102a",
    sommelierNotes: "Double maturity maturation. Intensely toasted brioche, candied citrus, mineral energy, and vibrant salinity.",
    pairingNotes: "Brittany lobster carpaccio, imperial sturgeon caviar, saffron sea bass."
  },
  {
    id: "WINE-004",
    cuvee: "Château d'Yquem",
    vintage: 2005,
    appellation: "Sauternes Premier Cru Supérieur",
    region: "Bordeaux",
    country: "France",
    color: "WHITE",
    rarity: "COLLECTION",
    bottleCount: 4,
    storageLocation: "Acajou Vault B - Casier 09",
    idealTemp: 11,
    idealHumidity: 70,
    bottlePrice: 750,
    authenticityHash: "0xd5be2c4fc1a2a4b8adba55919e3cf73a5585b2ad0dbec7a44f9104fae01934bc",
    sommelierNotes: "Symphony of honeyed apricot, saffron, orange marmalade, and delicate floral vanilla. Perfect balanced acidity.",
    pairingNotes: "Seared French foie gras, Roquefort Papillon blue cheese, mango tatin tart."
  },
  {
    id: "WINE-005",
    cuvee: "Krug Clos d'Ambonnay",
    vintage: 1998,
    appellation: "Champagne Brut",
    region: "Champagne",
    country: "France",
    color: "CHAMPAGNE",
    rarity: "EXCEPTIONAL",
    bottleCount: 1,
    storageLocation: "Chambre Froide B - Casier 01",
    idealTemp: 8,
    idealHumidity: 76,
    bottlePrice: 3200,
    authenticityHash: "0xb7a109be908cfbc0f12adba8e309fc2ff3daed44fb8dac04fb91ff85cc82119d",
    sommelierNotes: "Pure Pinot Noir jewel from a 0.68ha vineyard block. Majestic richness, roasted coffee beans, and red berry persistence.",
    pairingNotes: "Seared turbot with black winter truffle butter, wild mushroom cream broth."
  },
  {
    id: "WINE-006",
    cuvee: "Gaja Barbaresco Sori San Lorenzo",
    vintage: 2011,
    appellation: "Piedmont DOCG",
    region: "Sardegna / Piemonte",
    country: "Italy",
    color: "RED",
    rarity: "RESERVE",
    bottleCount: 5,
    storageLocation: "Acajou Vault C - Casier 02",
    idealTemp: 14,
    idealHumidity: 71,
    bottlePrice: 380,
    authenticityHash: "0xc889e2a14b301cdfe98eba18274381907cbffef112ea115fb3da619dbe802ff",
    sommelierNotes: "Youthful and powerful. Direct dark berries, leather, toasted cedar, robust dry tannins with supreme cellaring potential.",
    pairingNotes: "Tuscan wild boar stew, porcini risotto, truffle pecorino crumbles."
  }
];

export const WineCellarTab: React.FC<WineCellarTabProps> = ({ language, addAuditLog, fontStyle }) => {
  // Locale translations dictionary
  const t = {
    EN: {
      vaultTitle: "La Cave des Souverains",
      vaultSubtitle: "Sovereign Elite Oenology Collection & Real-Time Bio-Cellar Guardian",
      searchPlaceholder: "Search vintage, region, appellation or cuvée...",
      colCuvee: "Cuvée / Appellation",
      colRegion: "Origin & Class",
      colIdeal: "Ideal Limits",
      colStatus: "Sensors Active",
      colPrice: "Valuation",
      colStock: "Reserve Stock",
      addBtn: "Cure New Vintage",
      consumeBtn: "Log Pouring",
      restockBtn: "Restock",
      authTitle: "Sovereign Proof of Origin Authenticity Scanner",
      authDesc: "Validate cryptographic origin signatures of elite vintages mapped on our distributed hospitality registry. Protects against counterfeit premium acquisitions.",
      authBtn: "Verify Integrity Signature",
      sensorTitle: "Live IoT Cellar Guardian - Vault A",
      sensorDesc: "Atmospheric logs from high-definition acoustic, humidity, and temperature sensors monitoring grand reserves.",
      sommelierTitle: "Royal Sommelier AI Course Pairing",
      sommelierDesc: "Select active courses from the Palace Kitchen to automatically compile recommended premium vintage matches based on structural oenology rules.",
      selectCourse: "Select Active Course",
      affinityScore: "Oenological Match Score",
      addWineModal: "Log New Wine Lot",
      cuveeLbl: "Cuvée Name",
      vintageLbl: "Vintage Year",
      regionLbl: "Region",
      countryLbl: "Country",
      priceLbl: "Bottle Price (€)",
      stockLbl: "Initial Count",
      appellationLbl: "Appellation",
      rarityLbl: "Rarity",
      locationLbl: "Cellar Location Tag",
      idealTempLbl: "Ideal Temperature (°C)",
      idealHumidityLbl: "Ideal Humidity (%)",
      notesLbl: "Sommelier Evaluation Notes",
      pairingsLbl: "Suggested Food Pairings",
      submitLot: "Seal in Cellar Vault A",
      cancel: "Cancel",
      authSucceeded: "ORIGIN VERIFIED: Sovereign genuine certificate confirmed! No chemical anomalies detected.",
      authFailed: "WARNING: CRYPTOGRAPHIC SIGNATURE MATCH REJECTED. Potential counterfeit risk detected.",
      currentTemp: "Cellar Temp",
      currentHumidity: "Cellar Humidity",
      currentVibe: "Acoustic Noise",
      avgRange: "Normal Guardrail Range: 10°C - 14°C"
    },
    FR: {
      vaultTitle: "La Cave des Souverains",
      vaultSubtitle: "Collection d'Œnologie d'Élite & Gardien de Cave IoT en Temps Réel",
      searchPlaceholder: "Rechercher millésime, région, appellation ou cuvée...",
      colCuvee: "Cuvée / Appellation",
      colRegion: "Origine & Classe",
      colIdeal: "Limites Idéales",
      colStatus: "Capteurs IoT",
      colPrice: "Estimation",
      colStock: "Réserve Stock",
      addBtn: "Enregistrer Millésime",
      consumeBtn: "Servir Coupe",
      restockBtn: "Réapprovisionner",
      authTitle: "Scanner d'Authenticité & Preuve d'Origine",
      authDesc: "Valider les signatures cryptographiques de bouteilles de prestige et éliminer le risque de contrefaçon.",
      authBtn: "Vérifier l'Intégrité",
      sensorTitle: "Gardien de Cave IoT - Salles de Garde A & B",
      sensorDesc: "Suivi atmosphérique des capteurs acoustiques, vibratoires et d'humidité préservant les grands crus.",
      sommelierTitle: "Sommelier Royal : Accords Mets-Vins",
      sommelierDesc: "Sélectionnez un plat du palais pour que le sommelier sélectionne l'accord d'affinité optimal.",
      selectCourse: "Sélectionner un Plat",
      affinityScore: "Score d'Affinité Œnologique",
      addWineModal: "Ajouter Lot de Cave",
      cuveeLbl: "Nom de la Cuvée",
      vintageLbl: "Année du Millésime",
      regionLbl: "Région",
      countryLbl: "Pays",
      priceLbl: "Prix par Bouteille (€)",
      stockLbl: "Quantité Initiale",
      appellationLbl: "Appellation",
      rarityLbl: "Rareté",
      locationLbl: "Rangement Securisé",
      idealTempLbl: "Température Idéale (°C)",
      idealHumidityLbl: "Humidité Idéale (%)",
      notesLbl: "Notes d'Évaluation du Sommelier",
      pairingsLbl: "Accords Mets Suggérés",
      submitLot: "Sceller dans la Cave",
      cancel: "Annuler",
      authSucceeded: "AUTHENTIQUE : Signature d'origine validée avec succès. Sceau royal intact !",
      authFailed: "ALERTE : SIGNATURE DE SÉCURITÉ INVALIDE. Risque potentiel de contrefaçon !",
      currentTemp: "Temp. Cave",
      currentHumidity: "Humidité Cave",
      currentVibe: "Niveau Vibrations",
      avgRange: "Plage Normale de Garde : 10°C - 14°C"
    },
    RU: {
      vaultTitle: "Королевский Винный Погреб",
      vaultSubtitle: "Элитная Коллекция Сомелье и Страж Микроклимата IoT в Реальном Времени",
      searchPlaceholder: "Поиск миллезима, сорта или винодельни...",
      colCuvee: "Кюве / Аппелласьон",
      colRegion: "Класс и Происхождение",
      colIdeal: "Идеальные Лимиты",
      colStatus: "Состояние Датчиков",
      colPrice: "Оценка",
      colStock: "Запас Бутылок",
      addBtn: "Новый Миллезим",
      consumeBtn: "Зарегистрировать Налив",
      restockBtn: "Пополнить",
      authTitle: "Криптографический Сканер Подлинности Виз",
      authDesc: "Проверка распределенных хеш-сигнатур великих вин для подтверждения их происхождения и пресечения фальсификата.",
      authBtn: "Проверить Сигнатуру",
      sensorTitle: "Страж Микроклимата IoT - Погреб А",
      sensorDesc: "Реальные показатели датчиков шума, вибраций, влажности и температур винохранилища.",
      sommelierTitle: "Интеллектуальный Подбор Сомелье",
      sommelierDesc: "Выбор блюд из главного меню кухни для вычисления идеальных сочетаний по правилам классического сомелье.",
      selectCourse: "Выбрать Блюдо Меню",
      affinityScore: "Индекс Совместимости",
      addWineModal: "Добавить Вино",
      cuveeLbl: "Название Вина",
      vintageLbl: "Год Урожая",
      regionLbl: "Регион",
      countryLbl: "Страна",
      priceLbl: "Цена за Бутылку (€)",
      stockLbl: "Начальный Запас",
      appellationLbl: "Аппелласьон",
      rarityLbl: "Категория",
      locationLbl: "Код Ячейки",
      idealTempLbl: "Идеальная Температура (°C)",
      idealHumidityLbl: "Идеальная Влажность (%)",
      notesLbl: "Дегустационные Заметки",
      pairingsLbl: "Рекомендуемые Блюда",
      submitLot: "Запечатать в закрома",
      cancel: "Отмена",
      authSucceeded: "ОРИГИНАЛИЗОВАН : Верификация подтверждена! Бутылка является суверенной ценностью.",
      authFailed: "ВНИМАНИЕ : СИГНАТУРА НЕ СОВПАДАЕТ. Риск контрафактной продукции!",
      currentTemp: "Темп. Погреба",
      currentHumidity: "Влажность",
      currentVibe: "Уровень Вибраций",
      avgRange: "Допустимый Интервал: 10°C - 14°C"
    }
  }[language];

  // 1) Current wine inventory state
  const [wines, setWines] = useState<WineBottle[]>(INITIAL_WINES);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 2) Authentication signature testing
  const [testHash, setTestHash] = useState('');
  const [authResult, setAuthResult] = useState<{ status: 'idle' | 'checking' | 'success' | 'failed'; message: string }>({ status: 'idle', message: '' });

  // 3) Interactive IoT Sensors simulations
  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [currentTemp, setCurrentTemp] = useState(12.2);
  const [currentHumidity, setCurrentHumidity] = useState(72.1);
  const [currentVibe, setCurrentVibe] = useState(0.12);

  // 4) Add wine state modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWineForm, setNewWineForm] = useState<Partial<WineBottle>>({
    cuvee: '',
    vintage: 2015,
    appellation: 'Pauillac Grand Cru',
    region: 'Bordeaux',
    country: 'France',
    color: 'RED',
    rarity: 'RESERVE',
    bottleCount: 6,
    storageLocation: 'Acajou Vault B - Casier 12',
    idealTemp: 13,
    idealHumidity: 70,
    bottlePrice: 350,
    sommelierNotes: 'Polished tannins, ripe mulberry and graphite accents. Long ageing cellaring power.',
    pairingNotes: 'Prime beef ribeye, rosemary roasted lamb shoulder.'
  });

  // 5) Sommelier Active pairing course selector
  const activePalaceCourses = [
    { code: "CRS-918", name: "Saddle of French Venison & Jus d'Airelles", category: "Red Meat", weight: "rich" },
    { code: "CRS-202", name: "Roasted Duck Breast with Wild Blueberries", category: "Poultry", weight: "rich" },
    { code: "CRS-612", name: "Brittany Blue Lobster Carpaccio with Gold Leaves", category: "Seafood", weight: "light" },
    { code: "CRS-504", name: "Seared Dover Sole with Saffron Butter Foam", category: "Fish", weight: "light" },
    { code: "CRS-112", name: "Imperial Sturgeon Caviar on Crème Fraîche Blinis", category: "Seafood", weight: "light" },
    { code: "CRS-881", name: "Valrhona Chocolate Torte with Candied Kumquat", category: "Dessert", weight: "sweet" },
    { code: "CRS-303", name: "Roquefort Papillon Blue Cheese & Pear Tatin", category: "Cheese", weight: "sweet" }
  ];
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(activePalaceCourses[0].code);

  // Initialize and update time series sensor mock feed
  useEffect(() => {
    // Generate initial 20 minutes back
    const now = new Date();
    const seeds = [];
    for (let i = 19; i >= 0; i--) {
      const past = new Date(now.getTime() - i * 60 * 1000);
      const randSeed = Math.sin(i * 0.5);
      seeds.push({
        time: past.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temp: +(12.0 + randSeed * 0.4 + (Math.random() * 0.1)).toFixed(2),
        humidity: +(71.5 + randSeed * 1.1 + (Math.random() * 0.2)).toFixed(2),
        vibe: +(0.1 + Math.abs(randSeed) * 0.08 + (Math.random() * 0.05)).toFixed(3)
      });
    }
    setTimeSeries(seeds);

    // Dynamic Sensor updates
    const interval = setInterval(() => {
      setTimeSeries(prev => {
        const nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const delta = Math.sin(Date.now() / 25000) * 0.3;
        const nextTemp = +(12.1 + delta + Math.random() * 0.15).toFixed(2);
        const nextHumidity = +(71.8 + delta * 2.5 + Math.random() * 0.4).toFixed(2);
        const nextVibe = +(0.08 + Math.abs(Math.cos(Date.now() / 8000)) * 0.05 + Math.random() * 0.04).toFixed(3);
        
        setCurrentTemp(nextTemp);
        setCurrentHumidity(nextHumidity);
        setCurrentVibe(nextVibe);

        const updated = [...prev.slice(1), {
          time: nextTime,
          temp: nextTemp,
          humidity: nextHumidity,
          vibe: nextVibe
        }];
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Filtered Wines search
  const filteredWines = useMemo(() => {
    if (!searchQuery.trim()) return wines;
    const sq = searchQuery.toLowerCase();
    return wines.filter(w => 
      w.cuvee.toLowerCase().includes(sq) ||
      w.appellation.toLowerCase().includes(sq) ||
      w.region.toLowerCase().includes(sq) ||
      w.country.toLowerCase().includes(sq) ||
      String(w.vintage).includes(sq)
    );
  }, [wines, searchQuery]);

  // Calculate Cellar Analytics
  const totals = useMemo(() => {
    const totalCount = wines.reduce((acc, w) => acc + w.bottleCount, 0);
    const totalValue = wines.reduce((acc, w) => acc + (w.bottleCount * w.bottlePrice), 0);
    const exceptionalCount = wines.filter(w => w.rarity === 'EXCEPTIONAL').reduce((acc, w) => acc + w.bottleCount, 0);
    return { totalCount, totalValue, exceptionalCount };
  }, [wines]);

  // Food pairing recommender logic
  const matchResult = useMemo(() => {
    const activeCourse = activePalaceCourses.find(c => c.code === selectedCourseCode);
    if (!activeCourse) return null;

    // Compute affinity match for every wine bottle
    const mapped = wines.map(w => {
      let affinity = 50; // base score out of 100
      let reasoning = "";

      // 1. Colour Matches
      if (activeCourse.weight === "light") {
        if (w.color === 'CHAMPAGNE') {
          affinity += 40;
          reasoning = language === 'FR' ? "L'effervescence crayeuse s'accorde intensément avec la texture délicate de ce mets d'exception." :
                     language === 'RU' ? "Утончённая шипучесть благородного шампанского оживляет изящный вкус морепродуктов." :
                     "Sparkling mineral bubbles perfectly lift and harmonize with direct cold delicate fats and seafood zest.";
        } else if (w.color === 'WHITE') {
          affinity += 35;
          reasoning = language === 'FR' ? "L'acidité citronnée et florale tranche idéalement avec la chair tendre." :
                     language === 'RU' ? "Свежая цитрусовая кислотность белого вина раскрывает изысканную нежность блюда." :
                     "Vibrant mineral acidity and floral citrus profile slices cleanly through delicate marine proteins.";
        } else if (w.color === 'RED') {
          affinity -= 25;
          reasoning = language === 'FR' ? "Les tanins d'un rouge peuvent brusquer ou masquer la chair fragile de ce poisson." :
                     language === 'RU' ? "Танины красного вина могут подавить деликатный вкус этого блюда." :
                     "Heavy robust red grape tannins risk overwhelming and clashing with fragile cold marine flesh.";
        }
      } else if (activeCourse.weight === "rich") {
        if (w.color === 'RED') {
          affinity += 45;
          if (w.rarity === 'EXCEPTIONAL') {
            affinity += 5;
            reasoning = language === 'FR' ? "Grand cru d'une amplitude exceptionnelle. Les tanins soyeux soutiennent la venaison." :
                       language === 'RU' ? "Королевский винтаж исключительной глубины. Шелковистые танины ласкают дичь." :
                       "A majestic exceptional red vintage. Supreme structure and velvety tannins embrace the rich venison textures.";
          } else {
            reasoning = language === 'FR' ? "Structure tannique noble et boisée, épousant le caractère intense de la viande." :
                       language === 'RU' ? "Благородная древесная структура идеальна для дичи богатых вкусов." :
                       "Noble tannic structure and spiced accents echo the forest-floor depths of game meats.";
          }
        } else if (w.color === 'CHAMPAGNE') {
          affinity -= 10;
          reasoning = language === 'FR' ? "L'effervescence pourrait s'effacer face à l'intensité de la venaison de chasse." :
                     language === 'RU' ? "Лёгкая игристость этого шампанского может померкнуть перед плотным вкусом дичи." :
                     "Delicate premium bubbles feel overwhelmed by the intense dense weight of game sauces.";
        }
      } else if (activeCourse.weight === "sweet") {
        if (w.color === 'WHITE' && w.appellation.includes("Sauternes")) {
          affinity += 48;
          reasoning = language === 'FR' ? "Alliance mythique. L'onctuosité confite de l'abricot et du safran épouse le Roquefort de sève unique." :
                     language === 'RU' ? "Легендарное сочетание. Медовый букет абрикоса и шафрана роскошно дополняет горгонзолу." :
                     "Legendary matches. High botrytised sweetness, apricot skin and saffron notes counterpoints blue cheese salty arrays beautifully.";
        } else if (w.color === 'RED') {
          affinity += 15;
          reasoning = language === 'FR' ? "Les notes de sous-bois et de cerise confite s'unissent sagement." :
                     language === 'RU' ? "Ароматы вишнёвой косточки и подлеска создают интригующий контраст." :
                     "Matured black fruit and dark cherry skins offer a curious balanced contrast.";
        }
      }

      return {
        wine: w,
        score: Math.max(10, Math.min(100, affinity)),
        reason: reasoning || (language === 'FR' ? "Un accord classique équilibré respectant les équilibres d'arômes." : "Classic balanced traditional pairing.")
      };
    });

    return mapped.sort((a, b) => b.score - a.score)[0];
  }, [wines, selectedCourseCode, language]);

  // Verification simulation
  const handleVerifyOrigin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testHash.trim()) return;

    setAuthResult({ status: 'checking', message: 'Initializing cryptographic check on distributed distributed hyper-ledger...' });

    setTimeout(() => {
      // Find matches in current cellar database
      const match = wines.find(w => w.authenticityHash.toLowerCase() === testHash.toLowerCase().trim());
      if (match) {
        setAuthResult({
          status: 'success',
          message: `${t.authSucceeded} [Cuvée Match: ${match.cuvee} ${match.vintage} // Safe ID: ${match.id} // Vault Cellar: ${match.storageLocation}]`
        });
        if (addAuditLog) {
          addAuditLog(
            'CELLAR_PREMIUM_INTEGRITY_SUCCESS',
            `Verified cryptographically genuine certificate lock on ${match.cuvee} vintage ${match.vintage}. Bottle confirmed genuine.`,
            'AUTHORIZED',
            'MANAGER'
          );
        }
        confetti({ particleCount: 30, colors: ['#c19a6b', '#ffffff'] });
      } else {
        setAuthResult({
          status: 'failed',
          message: t.authFailed
        });
        if (addAuditLog) {
          addAuditLog(
            'CELLAR_ANOMALY_ALARM',
            `SUSPECT BOTTLE INTRODUCED. Tested signature [${testHash.slice(0,12)}...] failed registry verification check!`,
            'RESTRICTED_ATTEMPT',
            'MANAGER'
          );
        }
      }
    }, 1800);
  };

  // Consume bottle handler
  const handleConsumeBottle = (id: string) => {
    setWines(prev => prev.map(w => {
      if (w.id === id) {
        if (w.bottleCount <= 0) return w;
        
        if (addAuditLog) {
          addAuditLog(
            'WINE_RESERVE_CONSUMPTION',
            `Pouring logged for elite bottle ${w.cuvee} (${w.vintage}). Stock adjusted to ${w.bottleCount - 1} units.`,
            'AUTHORIZED',
            'MANAGER'
          );
        }
        return { ...w, bottleCount: w.bottleCount - 1 };
      }
      return w;
    }));
    confetti({ particleCount: 15, colors: ['#4f46e5', '#7c5a30'] });
  };

  // Restock bottle handler
  const handleRestockBottle = (id: string) => {
    setWines(prev => prev.map(w => {
      if (w.id === id) {
        if (addAuditLog) {
          addAuditLog(
            'WINE_RESERVE_RESTOCK',
            `Acquisition of bottle lot ${w.cuvee} (${w.vintage}) logged (+1 unit). Location: ${w.storageLocation}.`,
            'AUTHORIZED',
            'MANAGER'
          );
        }
        return { ...w, bottleCount: w.bottleCount + 1 };
      }
      return w;
    }));
    confetti({ particleCount: 15, colors: ['#10b981', '#ffffff'] });
  };

  // Create new bottle lot lot
  const handleInitNewBottle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWineForm.cuvee || !newWineForm.vintage || !newWineForm.bottlePrice) return;

    const newId = `WINE-0${wines.length + 1}`;
    // Simple mock SHA256 generator based on inputs so each lot is verified
    const generatedHash = "0x" + Array.from({length:64}, () => Math.floor(Math.random()*16).toString(16)).join("");

    const completeBottle: WineBottle = {
      id: newId,
      cuvee: newWineForm.cuvee,
      vintage: Number(newWineForm.vintage),
      appellation: newWineForm.appellation || 'Grand Cru',
      region: newWineForm.region || 'Unknown',
      country: newWineForm.country || 'France',
      color: newWineForm.color as any,
      rarity: newWineForm.rarity as any,
      bottleCount: Number(newWineForm.bottleCount || 1),
      storageLocation: newWineForm.storageLocation || 'Vault A Casier 99',
      idealTemp: Number(newWineForm.idealTemp || 13),
      idealHumidity: Number(newWineForm.idealHumidity || 72),
      bottlePrice: Number(newWineForm.bottlePrice),
      authenticityHash: generatedHash,
      sommelierNotes: newWineForm.sommelierNotes || 'Excellent lot potential.',
      pairingNotes: newWineForm.pairingNotes || 'Roasted meats, venison stew.'
    };

    setWines(prev => [completeBottle, ...prev]);
    setIsModalOpen(false);

    if (addAuditLog) {
      addAuditLog(
        'WINE_LOT_VAULT_SEALED',
        `Acquired and sealed new elite lot: ${completeBottle.cuvee} (${completeBottle.vintage}) - ${completeBottle.bottleCount} bottles. Valuation: €${completeBottle.bottlePrice}/unit. Signature Registry ID: ${generatedHash.slice(0, 14)}...`,
        'AUTHORIZED',
        'MANAGER'
      );
    }
    
    // Clear form except default static tags
    setNewWineForm({
      cuvee: '',
      vintage: 2015,
      appellation: 'Pauillac Grand Cru',
      region: 'Bordeaux',
      country: 'France',
      color: 'RED',
      rarity: 'RESERVE',
      bottleCount: 6,
      storageLocation: 'Acajou Vault B - Casier 12',
      idealTemp: 13,
      idealHumidity: 70,
      bottlePrice: 350,
      sommelierNotes: 'Polished tannins, ripe mulberry and graphite accents. Long ageing cellaring power.',
      pairingNotes: 'Prime beef ribeye, rosemary roasted lamb shoulder.'
    });

    confetti({ particleCount: 30, colors: ['#c19a6b', '#ffd700'] });
  };

  return (
    <div className={`space-y-8 animate-fade-in ${fontStyle === 'cyberpunk' ? 'font-mono' : 'font-sans-luxury'}`} id="wine-cellar-tab-panel">
      
      {/* HEADER BANNER OF THE SOVEREIGN CELLAR */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#c19a6b]/30 bg-gradient-to-br from-[#1a1410] via-[#3d1f0f] to-[#1a1410] text-[#eae4d5] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-gradient-to-br from-[#722f37] to-[#3d1f0f] rounded-2xl border border-amber-500/30 text-amber-300 shadow-lg animate-pulse">
            <WineIcon className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2.5xl md:text-3xl font-serif text-amber-200 tracking-tight font-extrabold flex items-center gap-2">
              {t.vaultTitle}
              <span className="text-[10px] font-mono tracking-widest uppercase bg-[#722f37] text-white border border-amber-500/40 p-1 px-2.5 rounded-full shadow">
                SECURE GRAND ARCHIVE
              </span>
            </h1>
            <p className="text-xs text-amber-100/75 mt-1 font-mono tracking-wide">
              {t.vaultSubtitle}
            </p>
          </div>
        </div>

        {/* Dynamic statistics counts */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col justify-center min-w-[100px] text-center shadow-inner">
            <span className="text-[8.5px] font-mono uppercase tracking-widest text-[#c19a6b] font-bold">TOTAL VINTAGES</span>
            <span className="text-lg font-bold font-mono text-amber-300 mt-1">{wines.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col justify-center min-w-[100px] text-center shadow-inner">
            <span className="text-[8.5px] font-mono uppercase tracking-widest text-[#c19a6b] font-bold">BOTTLES RESERV</span>
            <span className="text-lg font-bold font-mono text-amber-300 mt-1">{totals.totalCount}</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col justify-center min-w-[100px] text-center shadow-inner">
            <span className="text-[8.5px] font-mono uppercase tracking-widest text-[#c19a6b] font-bold">TOTAL VALUE</span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-1">€{totals.totalValue.toLocaleString('fr-FR')}</span>
          </div>
        </div>
      </div>

      {/* TOP METRIC GUARDIAN & INTELLIGENT ACCORDS IN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ATMOSPHERIC IoT GUARDIAN GRAPH (8 columns on large) */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-3xl bg-white/40 border border-white/60 shadow-xl flex flex-col justify-between" style={{ minHeight: '340px' }}>
          <div>
            <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl">
                  <Activity className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">{t.sensorTitle}</h3>
                  <p className="text-[10px] text-slate-500 leading-snug">{t.sensorDesc}</p>
                </div>
              </div>

              {/* Dynamic Warning indicator if variables out of ideal range */}
              <div className="flex gap-1">
                <span className="text-[9.5px] font-mono uppercase font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 p-1 px-2 rounded-lg animate-pulse flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  No Anomalies
                </span>
              </div>
            </div>

            {/* Micro Sensors values row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-2 px-3.5 bg-slate-100/60 border border-black/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-rose-500" />
                  <span className="text-[10.5px] font-mono text-slate-600 font-bold">{t.currentTemp}</span>
                </div>
                <span className="text-sm font-bold font-mono text-slate-900">{currentTemp.toFixed(1)}°C</span>
              </div>

              <div className="p-2 px-3.5 bg-slate-100/60 border border-black/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  <span className="text-[10.5px] font-mono text-slate-600 font-bold">{t.currentHumidity}</span>
                </div>
                <span className="text-sm font-bold font-mono text-slate-900">{currentHumidity.toFixed(1)}%</span>
              </div>

              <div className="p-2 px-3.5 bg-slate-100/60 border border-black/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <span className="text-[10.5px] font-mono text-slate-600 font-bold">{t.currentVibe}</span>
                </div>
                <span className="text-sm font-bold font-mono text-slate-900">{currentVibe.toFixed(3)} g</span>
              </div>
            </div>
          </div>

          {/* Time Series Recharts Display */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timeSeries}
                margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCellarTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorCellarHumidity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 8, fill: '#64748b', fontFamily: 'monospace' }} 
                />
                <YAxis 
                  domain={[6, 80]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 8, fill: '#64748b', fontFamily: 'monospace' }} 
                />
                <RechartsTooltip />
                {/* Safe Guard limits */}
                <ReferenceLine y={10} stroke="#94a3b8" strokeDasharray="3 3"/>
                <ReferenceLine y={14} stroke="#94a3b8" strokeDasharray="3 3"/>
                <Area 
                  type="monotone" 
                  name="Temperature (°C)"
                  dataKey="temp" 
                  stroke="#ef4444" 
                  strokeWidth={1.5}
                  fillOpacity={1} 
                  fill="url(#colorCellarTemp)" 
                />
                <Area 
                  type="monotone" 
                  name="Humidity (%)"
                  dataKey="humidity" 
                  stroke="#3b82f6" 
                  strokeWidth={1.5}
                  fillOpacity={1} 
                  fill="url(#colorCellarHumidity)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex text-[8.5px] font-mono text-slate-400 justify-between mt-1 select-none">
            <span>🔴 ACTIVE PLOT TEMPERATURE TRACK</span>
            <span>{t.avgRange}</span>
            <span>🔵 LIVE METRIC STREAM</span>
          </div>
        </div>

        {/* SOMMELIER AI RECOMMENDATION ENGINE CARD (4 columns on large) */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-3xl bg-[#fdfaf5] border border-amber-200/55 shadow-xl flex flex-col justify-between" style={{ minHeight: '340px' }}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#c19a6b]/20 pb-2">
              <span className="p-2 bg-[#722f37]/10 text-[#722f37] rounded-xl">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#7c5a30]">{t.sommelierTitle}</h3>
                <p className="text-[10px] text-slate-500 leading-snug">{t.sommelierDesc}</p>
              </div>
            </div>

            {/* Selected active dish dropdown */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono uppercase font-bold text-slate-500">{t.selectCourse}</label>
              <select
                value={selectedCourseCode}
                onChange={(e) => setSelectedCourseCode(e.target.value)}
                className="w-full text-xs font-medium font-mono p-2.5 rounded-xl border border-[#c19a6b]/35 bg-white text-slate-800 outline-none hover:border-[#7c5a30] transition-colors shadow-sm cursor-pointer"
              >
                {activePalaceCourses.map(item => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Matches Output Container */}
          {matchResult ? (
            <div className="bg-white border border-[#c19a6b]/25 rounded-2.5xl p-3.5 space-y-2 mt-3 shadow-inner">
              <div className="flex justify-between items-center bg-slate-50/70 p-2 rounded-xl">
                <div>
                  <span className="text-[8px] font-mono uppercase font-bold text-slate-400">{t.affinityScore}</span>
                  <div className="text-lg font-mono font-extrabold text-[#7c5a30] flex items-baseline gap-0.5">
                    {matchResult.score} <span className="text-[10px] text-slate-400 font-normal">/100</span>
                  </div>
                </div>
                <div className={`p-1 px-3.5 rounded-full text-[9px] font-bold font-mono ${
                  matchResult.score >= 90 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  matchResult.score >= 70 ? 'bg-[#c19a6b]/20 text-[#7c5a30] border border-[#c19a6b]/30' :
                  'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  ★ {matchResult.score >= 90 ? 'Perfect Harmony' : 'Excellent Concord'}
                </div>
              </div>

              {/* Matching Wine specifications card */}
              <div className="flex items-center gap-3 bg-[#722f37]/5 p-2 rounded-xl border border-[#722f37]/10">
                <div className="w-8 h-8 rounded-lg bg-[#722f37]/10 flex items-center justify-center text-[#722f37]">
                  <WineIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{matchResult.wine.cuvee}</h4>
                  <p className="text-[9.5px] font-mono text-slate-500">
                    {matchResult.wine.vintage} • {matchResult.wine.appellation} {matchResult.wine.region}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 font-mono leading-relaxed italic">
                &ldquo;{matchResult.reason}&rdquo;
              </p>
            </div>
          ) : (
            <div className="text-center p-4 text-xs font-mono text-slate-400">Loading Sommelier Concord...</div>
          )}
        </div>
      </div>

      {/* DETECTIVE SCAN PANEL FOR CRYPTO CERTIFICATES ORIGIN */}
      <div className="glass-panel p-5 rounded-3xl bg-white/40 border border-white/60 shadow-xl" id="crypto-authenticity-deck">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-black/5">
          <span className="p-2 bg-indigo-100 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 rounded-xl">
            <ShieldCheck className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">{t.authTitle}</h3>
            <p className="text-[10px] text-slate-500 leading-snug">{t.authDesc}</p>
          </div>
        </div>

        {/* Hash Input verification form */}
        <form onSubmit={handleVerifyOrigin} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-8 space-y-1">
            <label className="text-[9px] font-mono uppercase font-bold text-slate-500 flex justify-between">
              <span>Paste Bottle SHA-256 Ledger Signature Tag</span>
              <span className="text-[#7c5a30] hover:underline cursor-pointer" onClick={() => setTestHash(wines[0].authenticityHash)}>
                💡 Quick Paste Petrus 1989 Code
              </span>
            </label>
            <input
              type="text"
              value={testHash}
              onChange={(e) => setTestHash(e.target.value)}
              placeholder="e.g. 0x89e2c69fc1a2a4b8adbe55919e3cf73a5585b2ad0dbec7a44f9104fae01934bc..."
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-350 bg-white/90 text-slate-800 placeholder-slate-400 focus:border-[#c19a6b] outline-none shadow-sm transition"
            />
          </div>

          <div className="md:col-span-4 select-none">
            <button
              type="submit"
              disabled={authResult.status === 'checking'}
              className="w-full bg-[#1a1410] hover:bg-[#3d1f0f] active:bg-[#1a1410] text-[#eae4d5] border border-[#c19a6b]/35 font-mono text-[10px] uppercase font-bold p-3 rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {authResult.status === 'checking' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />}
              {authResult.status !== 'checking' && <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />}
              <span>{t.authBtn}</span>
            </button>
          </div>
        </form>

        {/* Scanner result panel */}
        {authResult.status !== 'idle' && (
          <div className={`mt-4 p-3.5 rounded-2xl border font-mono text-[10px] leading-relaxed transition-all shadow-inner ${
            authResult.status === 'checking' ? 'bg-slate-50 text-slate-600 border-slate-200' :
            authResult.status === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-250' :
            'bg-rose-50 text-rose-800 border-rose-250 animate-shake'
          }`}>
            <div className="flex items-start gap-2.5">
              {authResult.status === 'checking' && <RefreshCw className="w-4 h-4 text-slate-400 animate-spin mt-0.5" />}
              {authResult.status === 'success' && <Check className="w-4 h-4 text-emerald-600 mt-0.5" />}
              {authResult.status === 'failed' && <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 animate-bounce" />}
              <p className="flex-1 font-mono tracking-wide">{authResult.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* REAL INVENTORY RESIDENTIAL STOCK TABLE */}
      <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl overflow-hidden relative" id="cellar-reserves-registry">
        
        {/* Table header controllers */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-black/5 pb-4 mb-6">
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-800 tracking-tight flex items-center gap-2">
              🍷 {language === 'FR' ? "Registre de Cave des Souverains" : "Sovereign Fine Vintages Registry"}
            </h2>
            <p className="text-xs text-slate-500 leading-snug">
              {language === 'FR' ? "Consommations de bouteilles exclusives et enregistrement de nouveaux lots." : "Live tracking of cellar units, allocation channels, physical locations, and bottle pourings."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full text-xs p-2.5 pl-10 rounded-xl border border-slate-350 bg-white/95 text-slate-800 placeholder-slate-400 focus:border-[#c19a6b] outline-none shadow-sm transition"
              />
            </div>

            {/* Add Bottle Lot Lot Trigger Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#722f37] hover:bg-[#582027] text-white font-mono text-[10px] uppercase font-bold p-3 px-4 rounded-xl transition shadow active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.addBtn}</span>
            </button>
          </div>
        </div>

        {/* Reserves Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4 font-bold">{t.colCuvee}</th>
                <th className="py-3 px-4 font-bold">{t.colRegion}</th>
                <th className="py-3 px-4 font-bold">{t.colIdeal}</th>
                <th className="py-3 px-4 font-bold">{t.colPrice}</th>
                <th className="py-3 px-4 font-bold shrink-0">{t.colStock}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs font-mono">
              {filteredWines.map((wine) => {
                const isCriticalStock = wine.bottleCount <= 1;
                return (
                  <tr key={wine.id} className="hover:bg-slate-50/70 transition-colors group">
                    
                    {/* Cuvée & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-[#722f37]/10 flex items-center justify-center font-bold ${
                          wine.color === 'RED' ? 'text-[#722f37]' :
                          wine.color === 'CHAMPAGNE' ? 'text-amber-600' :
                          'text-indigo-600'
                        }`}>
                          <WineIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            {wine.cuvee}
                            <span className="text-[10px] text-slate-400 font-normal">({wine.vintage})</span>
                            {wine.rarity === 'EXCEPTIONAL' && (
                              <span className="text-[8px] bg-amber-100 text-amber-700 border border-amber-200 font-mono font-bold p-0.5 px-2 rounded-full animate-pulse uppercase">
                                Sovereign Rare
                              </span>
                            )}
                          </div>
                          <div className="text-[9.5px] text-slate-500 mt-0.5 max-w-sm truncate text-slate-450" title={wine.sommelierNotes}>
                            &ldquo;{wine.sommelierNotes}&rdquo;
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Appellation & Origin */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-bold">{wine.appellation}</div>
                      <div className="text-[9.5px] text-slate-500 mt-0.5 uppercase tracking-wide">
                        {wine.region}, {wine.country}
                      </div>
                    </td>

                    {/* Ideal Guards Physical variables */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>Temp ideal: <span className="text-slate-800 font-bold font-mono">{wine.idealTemp}°C</span></div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">Humid: {wine.idealHumidity}% // Loc: {wine.storageLocation}</div>
                    </td>

                    {/* Valuation & Appraisal */}
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div className="text-[#7c5a30]">€{wine.bottlePrice.toLocaleString('fr-FR')}</div>
                      <div className="text-[9.5px] text-slate-400 font-normal mt-0.5">Total lot: €{(wine.bottleCount * wine.bottlePrice).toLocaleString('fr-FR')}</div>
                    </td>

                    {/* Reservation count controllers */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-3">
                        <span className={`w-14 text-center py-1 rounded-xl text-xs font-bold border ${
                          isCriticalStock 
                            ? 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse' 
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {wine.bottleCount} units
                        </span>

                        {/* Interactive decrementor & incremental restocker */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleConsumeBottle(wine.id)}
                            disabled={wine.bottleCount <= 0}
                            title={t.consumeBtn}
                            className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 active:scale-95 transition-all text-[11px] font-bold cursor-pointer disabled:opacity-30 flex items-center gap-0.5"
                          >
                            <Minus className="w-2.5 h-2.5" />
                            <span>Pour</span>
                          </button>
                          <button
                            onClick={() => handleRestockBottle(wine.id)}
                            title={t.restockBtn}
                            className="p-1 px-2.5 bg-[#7c5a30]/10 hover:bg-[#7c5a30]/25 text-[#7c5a30] rounded-lg border border-[#c19a6b]/35 active:scale-95 transition-all text-[11px] font-bold cursor-pointer flex items-center gap-0.5"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* COORD SECURE LOT DEPOSIT SHEET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="add-wine-modal-deck">
          <div className="bg-[#fcfaf7] dark:bg-stone-900 rounded-3xl border border-[#c19a6b]/35 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-[#c19a6b]/20 pb-4 mb-4">
              <h2 className="text-[#7c5a30] text-lg font-serif font-bold flex items-center gap-2">
                <WineIcon className="w-5 h-5 text-[#722f37]" />
                {t.addWineModal}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-700">
                Cancel
              </button>
            </div>

            <form onSubmit={handleInitNewBottle} className="space-y-4 font-mono text-[10px] text-slate-600">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase font-bold text-slate-500">{t.cuveeLbl}</label>
                  <input
                    type="text"
                    required
                    value={newWineForm.cuvee}
                    onChange={(e) => setNewWineForm(prev => ({ ...prev, cuvee: e.target.value }))}
                    placeholder="Château Margaux"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-350 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase font-bold text-slate-500">{t.vintageLbl}</label>
                  <input
                    type="number"
                    required
                    value={newWineForm.vintage}
                    onChange={(e) => setNewWineForm(prev => ({ ...prev, vintage: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-350 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="uppercase font-bold text-slate-500">{t.appellationLbl}</label>
                  <input
                    type="text"
                    value={newWineForm.appellation}
                    onChange={(e) => setNewWineForm(prev => ({ ...prev, appellation: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-350 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase font-bold text-slate-500">{t.regionLbl}</label>
                  <input
                    type="text"
                    value={newWineForm.region}
                    onChange={(e) => setNewWineForm(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-350 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase font-bold text-slate-500">{t.countryLbl}</label>
                  <input
                    type="text"
                    value={newWineForm.country}
                    onChange={(e) => setNewWineForm(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-350 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="uppercase font-bold text-slate-500">{t.priceLbl}</label>
                  <input
                    type="number"
                    required
                    value={newWineForm.bottlePrice}
                    onChange={(e) => setNewWineForm(prev => ({ ...prev, bottlePrice: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-350 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase font-bold text-slate-500">{t.stockLbl}</label>
                  <input
                    type="number"
                    value={newWineForm.bottleCount}
                    onChange={(e) => setNewWineForm(prev => ({ ...prev, bottleCount: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-350 bg-white"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="uppercase font-bold text-slate-500">{t.rarityLbl}</label>
                  <select
                    value={newWineForm.rarity}
                    onChange={(e) => setNewWineForm(prev => ({ ...prev, rarity: e.target.value as any }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-350 bg-white"
                  >
                    <option value="STANDARD">Standard Selection</option>
                    <option value="RESERVE">Premium Reserve</option>
                    <option value="COLLECTION">Exclusive Collection</option>
                    <option value="EXCEPTIONAL">Imperial Exceptional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="uppercase font-bold text-slate-500">{t.idealTempLbl}</label>
                  <input
                    type="number"
                    value={newWineForm.idealTemp}
                    onChange={(e) => setNewWineForm(prev => ({ ...prev, idealTemp: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-350 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase font-bold text-slate-500">{t.idealHumidityLbl}</label>
                  <input
                    type="number"
                    value={newWineForm.idealHumidity}
                    onChange={(e) => setNewWineForm(prev => ({ ...prev, idealHumidity: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-350 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase font-bold text-slate-500">{t.locationLbl}</label>
                  <input
                    type="text"
                    value={newWineForm.storageLocation}
                    onChange={(e) => setNewWineForm(prev => ({ ...prev, storageLocation: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-350 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase font-bold text-slate-500">{t.notesLbl}</label>
                <textarea
                  value={newWineForm.sommelierNotes}
                  onChange={(e) => setNewWineForm(prev => ({ ...prev, sommelierNotes: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-350 bg-white h-16 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase font-bold text-slate-500">{t.pairingsLbl}</label>
                <input
                  type="text"
                  value={newWineForm.pairingNotes}
                  onChange={(e) => setNewWineForm(prev => ({ ...prev, pairingNotes: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-350 bg-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2.5 px-4 border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer active:scale-95 transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="p-2.5 px-5 bg-[#722f37] hover:bg-[#582027] text-white font-bold rounded-xl cursor-pointer active:scale-95 transition shadow-md"
                >
                  {t.submitLot}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
