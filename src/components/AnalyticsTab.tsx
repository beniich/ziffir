import { useState, useMemo } from 'react';
import {
  Line, Bar, Doughnut
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import {
  TrendingUp, Package, AlertTriangle,
  BarChart2, ChefHat, ArrowUp, ArrowDown,
  Minus as MinusIcon, Star, RefreshCw, Filter,
  DollarSign, Activity, Layers
} from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
);

// ─── Mock data helpers ─────────────────────────────────────────────────────

const last7Labels = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }));
  }
  return days;
};

const movingAvg = (data: number[], window = 3) =>
  data.map((_, i, arr) => {
    const slice = arr.slice(Math.max(0, i - window + 1), i + 1);
    return +(slice.reduce((a, b) => a + b, 0) / slice.length).toFixed(1);
  });

// ─── Stock data ────────────────────────────────────────────────────────────

interface StockItem {
  id: string;
  sku: string;
  name: string;
  unit: string;
  category: 'protein' | 'produce' | 'dairy' | 'beverage' | 'pantry';
  currentStock: number;
  reorderLevel: number;
  maxCapacity: number;
  usageHistory: number[]; // last 7 days
  cost: number; // per unit
  emoji: string;
}

const STOCK_DATA: StockItem[] = [
  { id: 's1', sku: 'WAG-A5-JP', name: 'Wagyu A5 (Japon)', unit: 'kg', category: 'protein', currentStock: 8.5, reorderLevel: 5, maxCapacity: 25, usageHistory: [2.1, 1.8, 2.4, 1.9, 2.2, 2.0, 1.7], cost: 420, emoji: '🥩' },
  { id: 's2', sku: 'AGN-LOZ-FR', name: 'Agneau Lozère', unit: 'kg', category: 'protein', currentStock: 12, reorderLevel: 8, maxCapacity: 30, usageHistory: [1.5, 1.2, 1.8, 1.4, 1.6, 1.3, 1.5], cost: 68, emoji: '🍖' },
  { id: 's3', sku: 'FGA-FR-VEN', name: 'Foie Gras Vendée', unit: 'kg', category: 'protein', currentStock: 3.2, reorderLevel: 4, maxCapacity: 15, usageHistory: [0.8, 0.7, 0.9, 0.8, 0.7, 0.9, 0.6], cost: 185, emoji: '🦆' },
  { id: 's4', sku: 'CAV-OSC-30', name: 'Caviar Osciètre', unit: 'g', category: 'protein', currentStock: 450, reorderLevel: 300, maxCapacity: 1000, usageHistory: [90, 75, 105, 80, 95, 70, 85], cost: 3.8, emoji: '🐟' },
  { id: 's5', sku: 'TRF-BLK-PER', name: 'Truffe Noire Périgord', unit: 'g', category: 'produce', currentStock: 180, reorderLevel: 200, maxCapacity: 500, usageHistory: [45, 38, 52, 40, 48, 35, 42], cost: 12, emoji: '🍄' },
  { id: 's6', sku: 'BEU-AOP-NOR', name: 'Beurre AOP Normandie', unit: 'kg', category: 'dairy', currentStock: 22, reorderLevel: 10, maxCapacity: 50, usageHistory: [2.5, 2.2, 2.8, 2.4, 2.6, 2.3, 2.1], cost: 18, emoji: '🧈' },
  { id: 's7', sku: 'DOM-PER-2015', name: 'Dom Pérignon 2015', unit: 'btl', category: 'beverage', currentStock: 24, reorderLevel: 12, maxCapacity: 60, usageHistory: [3, 2, 4, 3, 2, 4, 3], cost: 185, emoji: '🥂' },
  { id: 's8', sku: 'PET-2010', name: 'Pétrus 2010', unit: 'btl', category: 'beverage', currentStock: 4, reorderLevel: 6, maxCapacity: 24, usageHistory: [0, 1, 0, 1, 0, 1, 1], cost: 3200, emoji: '🍷' },
];

// ─── Dish profitability data ───────────────────────────────────────────────

interface DishProfit {
  id: string;
  name: string;
  emoji: string;
  category: string;
  sellingPrice: number;
  foodCost: number;       // raw ingredient cost
  coversThisWeek: number;
  trend: 'up' | 'down' | 'flat';
  trendPct: number;
  ratings: number[];      // last 7 days ratings (avg)
}

const DISH_PROFIT: DishProfit[] = [
  { id: 'd1', name: 'Wagyu A5 Ribeye 300g', emoji: '🥩', category: 'Plats', sellingPrice: 185, foodCost: 126, coversThisWeek: 42, trend: 'up', trendPct: 18, ratings: [4.9, 5.0, 4.8, 4.9, 5.0, 4.9, 5.0] },
  { id: 'd2', name: 'Caviar Osciètre 30g', emoji: '🐟', category: 'Entrées', sellingPrice: 95, foodCost: 114, coversThisWeek: 31, trend: 'up', trendPct: 12, ratings: [5.0, 5.0, 5.0, 4.9, 5.0, 5.0, 5.0] },
  { id: 'd3', name: 'Foie Gras Torchon', emoji: '🦆', category: 'Entrées', sellingPrice: 38, foodCost: 14.8, coversThisWeek: 67, trend: 'flat', trendPct: 2, ratings: [4.8, 4.7, 4.9, 4.8, 4.7, 4.9, 4.8] },
  { id: 'd4', name: 'Risotto Truffe Blanche', emoji: '🍚', category: 'Plats', sellingPrice: 85, foodCost: 52, coversThisWeek: 38, trend: 'up', trendPct: 7, ratings: [4.9, 4.8, 5.0, 4.9, 4.8, 5.0, 4.9] },
  { id: 'd5', name: 'Dom Pérignon 2015 (btl)', emoji: '🥂', category: 'Boissons', sellingPrice: 320, foodCost: 185, coversThisWeek: 18, trend: 'down', trendPct: 5, ratings: [4.9, 4.9, 4.9, 5.0, 4.9, 4.9, 4.9] },
  { id: 'd6', name: 'Soufflé Grand Marnier', emoji: '🍮', category: 'Desserts', sellingPrice: 24, foodCost: 6.2, coversThisWeek: 55, trend: 'up', trendPct: 22, ratings: [4.7, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7] },
  { id: 'd7', name: 'Agneau de Lozère', emoji: '🍖', category: 'Plats', sellingPrice: 68, foodCost: 36, coversThisWeek: 44, trend: 'down', trendPct: 8, ratings: [4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8] },
  { id: 'd8', name: 'Cocktail Signature Zafir', emoji: '🍹', category: 'Boissons', sellingPrice: 28, foodCost: 8.4, coversThisWeek: 89, trend: 'up', trendPct: 31, ratings: [4.8, 4.9, 4.8, 4.9, 4.9, 4.8, 4.9] },
];

// ─── Chart defaults ────────────────────────────────────────────────────────

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(12, 27, 51, 0.95)',
      titleColor: '#c19a6b',
      bodyColor: '#e2e8f0',
      borderColor: 'rgba(193,154,107,0.3)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 10,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { color: '#94a3b8', font: { size: 10, family: 'JetBrains Mono' } },
    },
    y: {
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { color: '#94a3b8', font: { size: 10, family: 'JetBrains Mono' } },
    },
  },
};

// ─── Component ─────────────────────────────────────────────────────────────

// Removed props interface as we now read from stores

type Section = 'overview' | 'stock' | 'profitability';

import { useAddAuditLog } from '../shared/store/auditStore';

export function AnalyticsTab() {
  const language = 'EN';
  const addAuditLog = useAddAuditLog();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [stockCategoryFilter, setStockCategoryFilter] = useState<StockItem['category'] | 'all'>('all');
  const [profitSort, setProfitSort] = useState<'margin' | 'revenue' | 'covers'>('revenue');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    setRefreshing(false);
    addAuditLog('ANALYTICS_REFRESH', 'Analytics dashboard data refreshed from backend services.', 'AUTHORIZED');
  };

  // ── Overview KPIs ────────────────────────────────────────────────────────
  const totalRevenue = DISH_PROFIT.reduce((a, d) => a + d.sellingPrice * d.coversThisWeek, 0);
  const totalFoodCost = DISH_PROFIT.reduce((a, d) => a + d.foodCost * d.coversThisWeek, 0);
  const grossMargin = ((totalRevenue - totalFoodCost) / totalRevenue * 100);
  const criticalStocks = STOCK_DATA.filter(s => s.currentStock <= s.reorderLevel);
  const topDish = [...DISH_PROFIT].sort((a, b) => (b.sellingPrice - b.foodCost) * b.coversThisWeek - (a.sellingPrice - a.foodCost) * a.coversThisWeek)[0];
  const weeklyCovers = DISH_PROFIT.reduce((a, d) => a + d.coversThisWeek, 0);

  // ── Revenue chart (weekly) ────────────────────────────────────────────────
  const revenueByDay = [12800, 9400, 14200, 11600, 15800, 18400, 16200];
  const revChartData = {
    labels: last7Labels(),
    datasets: [
      {
        label: 'Chiffre d\'affaires (€)',
        data: revenueByDay,
        fill: true,
        backgroundColor: 'rgba(193,154,107,0.1)',
        borderColor: '#c19a6b',
        borderWidth: 2,
        pointBackgroundColor: '#c19a6b',
        pointRadius: 4,
        tension: 0.4,
      },
      {
        label: 'Moy. mobile',
        data: movingAvg(revenueByDay),
        fill: false,
        borderColor: 'rgba(99,102,241,0.7)',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  };

  // ── Top dishes bar chart ─────────────────────────────────────────────────
  const sortedDishes = useMemo(() => {
    return [...DISH_PROFIT].sort((a, b) => {
      if (profitSort === 'margin') return ((b.sellingPrice - b.foodCost) / b.sellingPrice) - ((a.sellingPrice - a.foodCost) / a.sellingPrice);
      if (profitSort === 'revenue') return (b.sellingPrice * b.coversThisWeek) - (a.sellingPrice * a.coversThisWeek);
      return b.coversThisWeek - a.coversThisWeek;
    });
  }, [profitSort]);

  const dishBarData = {
    labels: sortedDishes.slice(0, 6).map(d => d.emoji + ' ' + d.name.split(' ').slice(0, 2).join(' ')),
    datasets: [
      {
        label: 'CA (€)',
        data: sortedDishes.slice(0, 6).map(d => d.sellingPrice * d.coversThisWeek),
        backgroundColor: sortedDishes.slice(0, 6).map((_, i) =>
          i === 0 ? 'rgba(193,154,107,0.85)' : `rgba(193,154,107,${0.4 - i * 0.04})`
        ),
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Coût matière (€)',
        data: sortedDishes.slice(0, 6).map(d => d.foodCost * d.coversThisWeek),
        backgroundColor: 'rgba(239,68,68,0.2)',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // ── Category donut ────────────────────────────────────────────────────────
  const categoryRevMap: Record<string, number> = {};
  DISH_PROFIT.forEach(d => {
    categoryRevMap[d.category] = (categoryRevMap[d.category] || 0) + d.sellingPrice * d.coversThisWeek;
  });
  const donutData = {
    labels: Object.keys(categoryRevMap),
    datasets: [{
      data: Object.values(categoryRevMap),
      backgroundColor: ['rgba(193,154,107,0.8)', 'rgba(99,102,241,0.7)', 'rgba(16,185,129,0.7)', 'rgba(245,158,11,0.7)'],
      borderColor: 'rgba(255,255,255,0.8)',
      borderWidth: 2,
    }],
  };

  // ── Stock forecast chart ──────────────────────────────────────────────────
  const filteredStock = stockCategoryFilter === 'all'
    ? STOCK_DATA
    : STOCK_DATA.filter(s => s.category === stockCategoryFilter);

  const forecastChartData = (item: StockItem) => {
    const history = item.usageHistory;
    const avgUsage = history.reduce((a, b) => a + b, 0) / history.length;
    const forecast = [3, 5, 7].map(d => +(item.currentStock - avgUsage * d).toFixed(1));
    const labels = [...last7Labels(), 'J+3', 'J+5', 'J+7'];
    const stockLevel = [
      ...history.map((_, i, arr) => +(item.currentStock + arr.slice(i).reduce((a, b) => a + b, 0) - arr.reduce((a, b) => a + b, 0)).toFixed(1)),
      ...forecast,
    ];
    return {
      labels,
      datasets: [
        {
          label: 'Niveau stock',
          data: stockLevel,
          fill: true,
          backgroundColor: 'rgba(193,154,107,0.08)',
          borderColor: '#c19a6b',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#c19a6b',
        },
        {
          label: 'Seuil critique',
          data: Array(labels.length).fill(item.reorderLevel),
          borderColor: 'rgba(239,68,68,0.6)',
          borderWidth: 1.5,
          borderDash: [6, 3],
          pointRadius: 0,
          fill: false,
          tension: 0,
        },
        {
          label: 'Moy. mobile usage',
          data: [
            ...movingAvg(history),
            avgUsage, avgUsage, avgUsage,
          ],
          borderColor: 'rgba(99,102,241,0.5)',
          borderWidth: 1,
          borderDash: [3, 3],
          pointRadius: 0,
          fill: false,
          tension: 0.4,
        },
      ],
    };
  };

  const stockStatus = (item: StockItem) => {
    const ratio = item.currentStock / item.reorderLevel;
    if (ratio <= 1) return { label: 'CRITIQUE', color: 'text-red-600', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500 animate-pulse' };
    if (ratio <= 1.5) return { label: 'FAIBLE', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500 animate-pulse' };
    return { label: 'OK', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' };
  };

  const marginColor = (d: DishProfit) => {
    const m = (d.sellingPrice - d.foodCost) / d.sellingPrice;
    if (m < 0) return 'text-red-600';
    if (m < 0.3) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const sections: { key: Section; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Vue d\'ensemble', icon: Activity },
    { key: 'stock', label: 'Prévision Stocks', icon: Package },
    { key: 'profitability', label: 'Rentabilité Plats', icon: BarChart2 },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-5 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-100 to-indigo-50 border border-indigo-200 flex items-center justify-center shadow-sm">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-display-luxury text-base font-bold text-slate-800">Analytics & Intelligence</h2>
            <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Prévision · Rentabilité · KPIs</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-mono">Dernière synchro: {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg bg-white/60 border border-slate-200 text-slate-500 hover:text-[#7c5a30] hover:border-[#c19a6b]/40 transition ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Section nav */}
      <div className="flex gap-2 flex-wrap">
        {sections.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
              activeSection === key
                ? 'bg-[#c19a6b]/15 border-[#c19a6b]/50 text-[#7c5a30] shadow-sm'
                : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white/80 hover:border-slate-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
      {activeSection === 'overview' && (
        <div className="flex flex-col gap-5">
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'CA Semaine', value: `€${(totalRevenue / 1000).toFixed(1)}k`, sub: '+14% vs. S-1', icon: DollarSign, color: 'text-[#7c5a30]', bg: 'from-amber-50 to-white' },
              { label: 'Marge Brute', value: `${grossMargin.toFixed(1)}%`, sub: `€${((totalRevenue - totalFoodCost) / 1000).toFixed(1)}k net`, icon: TrendingUp, color: 'text-emerald-600', bg: 'from-emerald-50 to-white' },
              { label: 'Couverts / sem.', value: weeklyCovers.toString(), sub: 'Tous menus confondus', icon: ChefHat, color: 'text-indigo-600', bg: 'from-indigo-50 to-white' },
              { label: 'Stocks critiques', value: criticalStocks.length.toString(), sub: criticalStocks.length > 0 ? criticalStocks.map(s => s.sku).join(', ') : 'Aucun', icon: AlertTriangle, color: criticalStocks.length > 0 ? 'text-red-600' : 'text-emerald-600', bg: criticalStocks.length > 0 ? 'from-red-50 to-white' : 'from-emerald-50 to-white' },
            ].map((kpi, i) => (
              <div key={i} className={`glass-card p-4 bg-gradient-to-br ${kpi.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{kpi.label}</p>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                <p className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[10px] text-slate-400 mt-1 truncate">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Revenue chart + donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass-panel p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">CA Journalier — 7 derniers jours</h3>
                <div className="flex gap-3 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#c19a6b] rounded inline-block" /> CA réel</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-400 rounded inline-block border-dashed border-t border-indigo-400" /> Moy. 3j</span>
                </div>
              </div>
              <div className="h-52">
                <Line
                  data={revChartData}
                  options={{
                    ...CHART_DEFAULTS,
                    plugins: {
                      ...CHART_DEFAULTS.plugins,
                      tooltip: {
                        ...CHART_DEFAULTS.plugins.tooltip,
                        callbacks: {
                          label: (ctx: any) => ` €${ctx.parsed.y.toLocaleString('fr-FR')}`,
                        },
                      },
                    },
                  } as any}
                />
              </div>
            </div>

            <div className="glass-panel p-5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-4">CA par Catégorie</h3>
              <div className="h-44">
                <Doughnut
                  data={donutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'bottom' as const,
                        labels: {
                          color: '#64748b',
                          font: { size: 10, family: 'JetBrains Mono' },
                          padding: 10,
                          boxWidth: 10,
                        },
                      },
                      tooltip: CHART_DEFAULTS.plugins.tooltip,
                    },
                    cutout: '65%',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Top dish highlight */}
          {topDish && (
            <div className="glass-panel p-5 border border-[#c19a6b]/20 bg-gradient-to-br from-amber-50/40 to-white/60">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{topDish.emoji}</span>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#7c5a30] font-bold mb-0.5">⭐ Meilleure rentabilité cette semaine</p>
                  <p className="text-sm font-bold text-slate-800">{topDish.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {topDish.coversThisWeek} couverts · CA: €{(topDish.sellingPrice * topDish.coversThisWeek).toLocaleString('fr-FR')} ·
                    Marge: <span className="text-emerald-600 font-bold">{(((topDish.sellingPrice - topDish.foodCost) / topDish.sellingPrice) * 100).toFixed(0)}%</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STOCK FORECAST ───────────────────────────────────────────────── */}
      {activeSection === 'stock' && (
        <div className="flex flex-col gap-5">
          {/* Filter bar */}
          <div className="glass-panel p-4 flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] font-mono text-slate-500 font-bold uppercase">Catégorie :</span>
            {(['all', 'protein', 'produce', 'dairy', 'beverage', 'pantry'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setStockCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition ${stockCategoryFilter === cat ? 'bg-[#c19a6b]/15 border-[#c19a6b]/50 text-[#7c5a30]' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white/50'}`}
              >
                {cat === 'all' ? 'Tout' : cat}
              </button>
            ))}
            {criticalStocks.length > 0 && (
              <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[10px] font-mono font-bold text-red-600">{criticalStocks.length} article{criticalStocks.length > 1 ? 's' : ''} critique{criticalStocks.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Stock grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredStock.map(item => {
              const status = stockStatus(item);
              const pct = Math.min(100, (item.currentStock / item.maxCapacity) * 100);
              const avgUsage = item.usageHistory.reduce((a, b) => a + b, 0) / item.usageHistory.length;
              const daysLeft = +(item.currentStock / avgUsage).toFixed(1);
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedStock(selectedStock?.id === item.id ? null : item)}
                  className={`glass-card p-4 text-left border-2 transition-all ${
                    selectedStock?.id === item.id
                      ? 'border-[#c19a6b]/60 shadow-lg'
                      : item.currentStock <= item.reorderLevel
                        ? 'border-red-200 hover:border-red-300'
                        : 'border-white hover:border-[#c19a6b]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.emoji}</span>
                      <div>
                        <p className="text-[11px] font-bold text-slate-700 leading-tight">{item.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{item.sku}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${status.bg} ${status.color}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${status.dot} mr-1`} />
                      {status.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.currentStock <= item.reorderLevel ? 'bg-red-400' : item.currentStock / item.maxCapacity < 0.4 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-500">
                    <div><span className="font-bold text-slate-700">{item.currentStock}</span> {item.unit}</div>
                    <div>Seuil: {item.reorderLevel}</div>
                    <div className={daysLeft <= 3 ? 'text-red-500 font-bold' : ''}>~{daysLeft}j restants</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Expanded forecast chart */}
          {selectedStock && (
            <div className="glass-panel p-6 border border-[#c19a6b]/20 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedStock.emoji}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{selectedStock.name}</h3>
                    <p className="text-[10px] font-mono text-slate-400">
                      Prévision moving average (fenêtre 3j) · Coût unitaire: €{selectedStock.cost}/{selectedStock.unit}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#c19a6b] rounded inline-block" /> Niveau stock</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400 rounded inline-block" /> Seuil critique</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-400 rounded inline-block" /> Usage moy.</span>
                </div>
              </div>
              <div className="h-56">
                <Line
                  data={forecastChartData(selectedStock)}
                  options={{
                    ...CHART_DEFAULTS,
                    plugins: {
                      ...CHART_DEFAULTS.plugins,
                      legend: { display: false },
                    },
                    scales: {
                      ...CHART_DEFAULTS.scales,
                      y: {
                        ...CHART_DEFAULTS.scales.y,
                        title: { display: true, text: selectedStock.unit, color: '#94a3b8', font: { size: 10 } },
                      },
                    },
                  } as any}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PROFITABILITY ─────────────────────────────────────────────────── */}
      {activeSection === 'profitability' && (
        <div className="flex flex-col gap-5">
          {/* Sort bar */}
          <div className="glass-panel p-4 flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-mono text-slate-500 font-bold uppercase">Trier par :</span>
            {([
              { key: 'revenue', label: 'CA Total' },
              { key: 'margin', label: 'Taux de marge' },
              { key: 'covers', label: 'Couverts' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setProfitSort(key)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition ${profitSort === key ? 'bg-[#c19a6b]/15 border-[#c19a6b]/50 text-[#7c5a30]' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white/50'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Bar chart */}
          <div className="glass-panel p-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#7c5a30]" />
              Top 6 Plats — CA vs. Coût Matière
            </h3>
            <div className="h-60">
              <Bar
                data={dishBarData}
                options={{
                  ...CHART_DEFAULTS,
                  plugins: {
                    ...CHART_DEFAULTS.plugins,
                    legend: {
                      display: true,
                      position: 'top' as const,
                      labels: { color: '#64748b', font: { size: 10 }, padding: 12, boxWidth: 10 },
                    },
                    tooltip: {
                      ...CHART_DEFAULTS.plugins.tooltip,
                      callbacks: { label: (ctx: any) => ` €${ctx.parsed.y.toLocaleString('fr-FR')}` },
                    },
                  },
                  scales: {
                    ...CHART_DEFAULTS.scales,
                    x: { ...CHART_DEFAULTS.scales.x, stacked: false },
                    y: { ...CHART_DEFAULTS.scales.y, stacked: false },
                  },
                } as any}
              />
            </div>
          </div>

          {/* Dish table */}
          <div className="glass-panel p-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-4">
              Détail Rentabilité par Plat
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['Plat', 'Catégorie', 'PV', 'Coût mat.', 'Marge', 'Couverts', 'CA', 'Tendance'].map(h => (
                      <th key={h} className="text-[10px] font-mono uppercase tracking-wider text-slate-400 text-left py-2 px-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedDishes.map((dish, i) => {
                    const margin = (dish.sellingPrice - dish.foodCost) / dish.sellingPrice;
                    const revenue = dish.sellingPrice * dish.coversThisWeek;
                    return (
                      <tr key={dish.id} className={`border-b border-slate-100 transition hover:bg-white/60 ${i === 0 ? 'bg-[#c19a6b]/5' : ''}`}>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span>{dish.emoji}</span>
                            <span className="font-medium text-slate-700 truncate max-w-[130px]">{dish.name}</span>
                            {i === 0 && <Star className="w-3 h-3 text-amber-500 fill-current shrink-0" />}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{dish.category}</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">€{dish.sellingPrice}</td>
                        <td className="py-3 px-3 font-mono text-slate-500">€{dish.foodCost}</td>
                        <td className={`py-3 px-3 font-mono font-bold ${marginColor(dish)}`}>
                          {margin < 0 ? '▼ ' : ''}{(margin * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">{dish.coversThisWeek}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">€{revenue.toLocaleString('fr-FR')}</td>
                        <td className="py-3 px-3">
                          <div className={`flex items-center gap-1 text-[10px] font-mono font-bold ${dish.trend === 'up' ? 'text-emerald-600' : dish.trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
                            {dish.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : dish.trend === 'down' ? <ArrowDown className="w-3 h-3" /> : <MinusIcon className="w-3 h-3" />}
                            {dish.trendPct}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
