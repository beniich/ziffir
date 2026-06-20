import { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone,
  SplitSquareHorizontal, CheckCircle2, ChefHat, Clock, Users,
  UtensilsCrossed, Wine, Cake, Star, X,
  Receipt, Send, Wifi, WifiOff, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MenuItem {
  id: string;
  name: string;
  nameEn: string;
  nameFr: string;
  price: number;
  category: 'starter' | 'main' | 'dessert' | 'drinks';
  available: boolean;
  prepTime: number; // minutes
  allergens: string[];
  rating: number;
  emoji: string;
}

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  note: string;
}

interface KitchenOrder {
  id: string;
  table: string;
  items: OrderItem[];
  status: 'sent' | 'acknowledged' | 'preparing' | 'ready';
  sentAt: Date;
  estimatedReady: Date;
}

interface SplitBillGuest {
  id: string;
  name: string;
  items: OrderItem[];
  paymentMethod: 'card' | 'cash' | 'mobile';
  paid: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  // Starters
  { id: 'm1', name: 'Foie Gras Torchon', nameEn: 'Duck Foie Gras', nameFr: 'Foie Gras Torchon', price: 38, category: 'starter', available: true, prepTime: 8, allergens: ['gluten'], rating: 4.9, emoji: '🦆' },
  { id: 'm2', name: 'Caviar Oscietra', nameEn: 'Oscietra Caviar 30g', nameFr: 'Caviar Osciètre 30g', price: 95, category: 'starter', available: true, prepTime: 5, allergens: ['fish'], rating: 5.0, emoji: '🐟' },
  { id: 'm3', name: 'Truffe Noire Périgord', nameEn: 'Black Truffle Bruschetta', nameFr: 'Bruschetta Truffe Noire', price: 55, category: 'starter', available: false, prepTime: 10, allergens: ['gluten'], rating: 4.8, emoji: '🍄' },
  { id: 'm4', name: 'Homard Bleu Breton', nameEn: 'Brittany Blue Lobster Bisque', nameFr: 'Bisque Homard Bleu', price: 48, category: 'starter', available: true, prepTime: 12, allergens: ['shellfish'], rating: 4.7, emoji: '🦞' },
  // Mains
  { id: 'm5', name: 'Wagyu A5 Ribeye', nameEn: 'Wagyu A5 Ribeye 300g', nameFr: 'Wagyu A5 Entrecôte 300g', price: 185, category: 'main', available: true, prepTime: 22, allergens: [], rating: 5.0, emoji: '🥩' },
  { id: 'm6', name: 'Sole de Douvres', nameEn: 'Dover Sole Meunière', nameFr: 'Sole de Douvres Meunière', price: 72, category: 'main', available: true, prepTime: 18, allergens: ['fish', 'dairy'], rating: 4.6, emoji: '🐠' },
  { id: 'm7', name: 'Agneau de Lozère', nameEn: 'Lozère Lamb Rack', nameFr: 'Carré d\'Agneau de Lozère', price: 68, category: 'main', available: true, prepTime: 25, allergens: [], rating: 4.8, emoji: '🍖' },
  { id: 'm8', name: 'Risotto Truffe Blanche', nameEn: 'White Truffle Risotto', nameFr: 'Risotto Truffe Blanche', price: 85, category: 'main', available: true, prepTime: 20, allergens: ['dairy', 'gluten'], rating: 4.9, emoji: '🍚' },
  // Desserts
  { id: 'm9', name: 'Soufflé Grand Marnier', nameEn: 'Grand Marnier Soufflé', nameFr: 'Soufflé Grand Marnier', price: 24, category: 'dessert', available: true, prepTime: 15, allergens: ['eggs', 'dairy', 'gluten'], rating: 4.7, emoji: '🍮' },
  { id: 'm10', name: 'Valrhona Manjari', nameEn: 'Valrhona Manjari Fondant', nameFr: 'Fondant Valrhona Manjari', price: 22, category: 'dessert', available: true, prepTime: 8, allergens: ['dairy', 'gluten'], rating: 4.8, emoji: '🍫' },
  // Drinks
  { id: 'm11', name: 'Pétrus 2010', nameEn: 'Pétrus 2010 (btl)', nameFr: 'Pétrus 2010 (btl)', price: 4200, category: 'drinks', available: true, prepTime: 3, allergens: ['sulphites'], rating: 5.0, emoji: '🍷' },
  { id: 'm12', name: 'Dom Pérignon 2015', nameEn: 'Dom Pérignon 2015 (btl)', nameFr: 'Dom Pérignon 2015 (btl)', price: 320, category: 'drinks', available: true, prepTime: 2, allergens: ['sulphites'], rating: 4.9, emoji: '🥂' },
  { id: 'm13', name: 'Cocktail Signature', nameEn: 'Zafir Signature Cocktail', nameFr: 'Cocktail Signature Zafir', price: 28, category: 'drinks', available: true, prepTime: 6, allergens: [], rating: 4.8, emoji: '🍹' },
  { id: 'm14', name: 'Café Arabica Grand Cru', nameEn: 'Grand Cru Arabica Coffee', nameFr: 'Café Arabica Grand Cru', price: 12, category: 'drinks', available: true, prepTime: 4, allergens: [], rating: 4.6, emoji: '☕' },
];

const TABLES = ['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'V-01', 'V-02', 'Bar'];

const CATEGORY_META = {
  starter: { label: 'Entrées', icon: UtensilsCrossed, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  main: { label: 'Plats', icon: ChefHat, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  dessert: { label: 'Desserts', icon: Cake, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200' },
  drinks: { label: 'Boissons', icon: Wine, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
};

// Removed props interface as we now read from stores

import { useAddAuditLog } from '../shared/store/auditStore';

export function POSTab() {
  const language = 'EN';
  const addAuditLog = useAddAuditLog();
  const [selectedTable, setSelectedTable] = useState<string>('T-01');
  const [activeCategory, setActiveCategory] = useState<MenuItem['category']>('starter');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [wsConnected, setWsConnected] = useState(true);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'mobile'>('card');
  const [sendingOrder, setSendingOrder] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [splitGuests, setSplitGuests] = useState<SplitBillGuest[]>([]);
  const [guestCount, setGuestCount] = useState(2);
  const wsRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated WebSocket reconnection
  useEffect(() => {
    const simulateWs = () => {
      const rand = Math.random();
      if (rand > 0.97) {
        setWsConnected(false);
        setTimeout(() => setWsConnected(true), 3000);
      }
    };
    wsRef.current = setInterval(simulateWs, 5000);
    return () => { if (wsRef.current) clearInterval(wsRef.current); };
  }, []);

  // Auto-advance kitchen order statuses
  useEffect(() => {
    if (kitchenOrders.length === 0) return;
    const interval = setInterval(() => {
      setKitchenOrders(prev => prev.map(order => {
        const elapsed = (Date.now() - order.sentAt.getTime()) / 1000;
        if (elapsed > 60 && order.status === 'sent') return { ...order, status: 'acknowledged' };
        if (elapsed > 120 && order.status === 'acknowledged') return { ...order, status: 'preparing' };
        if (elapsed > 240 && order.status === 'preparing') return { ...order, status: 'ready' };
        return order;
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, [kitchenOrders]);

  const filteredItems = MENU_ITEMS.filter(i => i.category === activeCategory);

  const addItem = (item: MenuItem) => {
    if (!item.available) return;
    setOrderItems(prev => {
      const existing = prev.find(o => o.menuItem.id === item.id);
      if (existing) return prev.map(o => o.menuItem.id === item.id ? { ...o, quantity: o.quantity + 1 } : o);
      return [...prev, { menuItem: item, quantity: 1, note: '' }];
    });
  };

  const removeItem = (id: string) => setOrderItems(prev => prev.filter(o => o.menuItem.id !== id));
  const adjustQty = (id: string, delta: number) => {
    setOrderItems(prev => prev.map(o => {
      if (o.menuItem.id !== id) return o;
      const newQty = o.quantity + delta;
      if (newQty <= 0) return o;
      return { ...o, quantity: newQty };
    }));
  };

  const subtotal = orderItems.reduce((acc, o) => acc + o.menuItem.price * o.quantity, 0);
  const tax = subtotal * 0.2;
  const serviceCharge = subtotal * 0.12;
  const total = subtotal + tax + serviceCharge;

  const sendToKitchen = async () => {
    if (orderItems.length === 0 || sendingOrder) return;
    setSendingOrder(true);
    await new Promise(r => setTimeout(r, 1800));
    const order: KitchenOrder = {
      id: `KO-${Date.now()}`,
      table: selectedTable,
      items: [...orderItems],
      status: 'sent',
      sentAt: new Date(),
      estimatedReady: new Date(Date.now() + Math.max(...orderItems.map(o => o.menuItem.prepTime)) * 60000),
    };
    setKitchenOrders(prev => [order, ...prev]);
    addAuditLog('POS_ORDER_SENT', `Order ${order.id} sent to kitchen for table ${selectedTable} — ${orderItems.length} items — Total: €${total.toFixed(2)}`, 'AUTHORIZED');
    setOrderItems([]);
    setSendingOrder(false);
    setOrderSent(true);
    confetti({ particleCount: 60, spread: 55, colors: ['#c19a6b', '#ffffff', '#10b981'] });
    setTimeout(() => setOrderSent(false), 3000);
  };

  const initSplit = () => {
    const guests: SplitBillGuest[] = Array.from({ length: guestCount }, (_, i) => ({
      id: `guest-${i}`,
      name: `Guest ${i + 1}`,
      items: [],
      paymentMethod: 'card',
      paid: false,
    }));
    setSplitGuests(guests);
    setShowSplitModal(true);
  };

  const processPayment = () => {
    setShowPaymentModal(false);
    addAuditLog('POS_PAYMENT_PROCESSED', `Payment of €${total.toFixed(2)} processed via ${paymentMethod.toUpperCase()} for table ${selectedTable}`, 'AUTHORIZED');
    confetti({ particleCount: 120, spread: 80, colors: ['#c19a6b', '#ffffff', '#ffd700'] });
    setOrderItems([]);
  };

  const statusConfig = {
    sent: { label: 'Envoyé', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200', dot: 'bg-sky-500 animate-pulse' },
    acknowledged: { label: 'Reçu', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500 animate-pulse' },
    preparing: { label: 'En préparation', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500 animate-pulse' },
    ready: { label: '✓ Prêt', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-5 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-100 to-amber-50 border border-amber-200 flex items-center justify-center shadow-sm">
            <ShoppingCart className="w-5 h-5 text-[#7c5a30]" />
          </div>
          <div>
            <h2 className="font-display-luxury text-base font-bold text-slate-800">Point de Vente — POS Tactile</h2>
            <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Zafir Restaurant Command</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* WS Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${wsConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {wsConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 animate-pulse" />}
            {wsConnected ? 'Kitchen Live' : 'Reconnecting...'}
          </div>
          {/* Table Selector */}
          <div className="flex flex-wrap gap-1.5">
            {TABLES.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTable(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${selectedTable === t ? 'bg-[#c19a6b] text-white border-[#c19a6b] shadow-sm' : 'bg-white/60 border-slate-200 text-slate-600 hover:border-[#c19a6b]/40 hover:text-[#7c5a30]'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* MENU PANEL */}
        <div className="lg:col-span-2 glass-panel p-5 flex flex-col gap-4">
          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(CATEGORY_META) as MenuItem['category'][]).map(cat => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${activeCategory === cat ? `${meta.bg} ${meta.color} shadow-sm` : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white/80'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {meta.label}
                  <span className="text-[9px] opacity-70">({MENU_ITEMS.filter(i => i.category === cat).length})</span>
                </button>
              );
            })}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredItems.map(item => {
              const inOrder = orderItems.find(o => o.menuItem.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => addItem(item)}
                  disabled={!item.available}
                  className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 group ${
                    !item.available
                      ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                      : inOrder
                        ? 'bg-[#c19a6b]/8 border-[#c19a6b]/60 shadow-md'
                        : 'bg-white/70 border-white/80 hover:border-[#c19a6b]/40 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{item.emoji}</span>
                        {!item.available && (
                          <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono uppercase">Indisponible</span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                        {language === 'FR' ? item.nameFr : item.nameEn}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          {item.rating}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-mono">
                          <Clock className="w-3 h-3" />
                          {item.prepTime}m
                        </span>
                        {item.allergens.length > 0 && (
                          <span className="text-[9px] text-orange-500 font-mono">{item.allergens.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#7c5a30] font-mono">
                        €{item.price >= 1000 ? `${(item.price/1000).toFixed(1)}k` : item.price}
                      </p>
                      {inOrder && (
                        <span className="text-[9px] bg-[#c19a6b]/20 text-[#7c5a30] px-1.5 py-0.5 rounded font-mono font-bold">×{inOrder.quantity}</span>
                      )}
                    </div>
                  </div>
                  {item.available && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-5 h-5 rounded-full bg-[#c19a6b] flex items-center justify-center">
                        <Plus className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ORDER PANEL */}
        <div className="glass-panel p-5 flex flex-col gap-4 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#7c5a30]" />
              Commande — {selectedTable}
            </h3>
            {orderItems.length > 0 && (
              <button onClick={() => setOrderItems([])} className="text-[10px] text-red-400 hover:text-red-600 font-mono flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Vider
              </button>
            )}
          </div>

          {orderItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <ShoppingCart className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs font-mono">Aucun article</p>
              <p className="text-[10px] opacity-60">Appuyez sur un plat pour ajouter</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {orderItems.map(o => (
                <div key={o.menuItem.id} className="glass-card p-3 flex items-center gap-3">
                  <span className="text-base">{o.menuItem.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-700 truncate">{language === 'FR' ? o.menuItem.nameFr : o.menuItem.nameEn}</p>
                    <p className="text-[10px] text-[#7c5a30] font-mono">€{(o.menuItem.price * o.quantity).toFixed(0)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => adjustQty(o.menuItem.id, -1)} className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
                      <Minus className="w-3 h-3 text-slate-600" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-700">{o.quantity}</span>
                    <button onClick={() => adjustQty(o.menuItem.id, 1)} className="w-6 h-6 rounded-lg bg-[#c19a6b]/20 hover:bg-[#c19a6b]/40 flex items-center justify-center transition">
                      <Plus className="w-3 h-3 text-[#7c5a30]" />
                    </button>
                    <button onClick={() => removeItem(o.menuItem.id)} className="w-6 h-6 rounded-lg hover:bg-red-50 flex items-center justify-center transition">
                      <X className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          {orderItems.length > 0 && (
            <div className="border-t border-slate-200/80 pt-3 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>Sous-total</span><span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>TVA (20%)</span><span>€{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>Service (12%)</span><span>€{serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-800 font-mono border-t border-slate-200 pt-2">
                <span>TOTAL</span><span className="text-[#7c5a30]">€{total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={sendToKitchen}
              disabled={orderItems.length === 0 || sendingOrder || !wsConnected}
              className={`w-full py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                orderSent
                  ? 'bg-emerald-500 text-white'
                  : orderItems.length === 0 || !wsConnected
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-[#c19a6b] hover:bg-[#a67b4d] text-white shadow-md hover:shadow-lg active:scale-95'
              }`}
            >
              {sendingOrder ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Envoi en cours...</>
              ) : orderSent ? (
                <><CheckCircle2 className="w-4 h-4" /> Envoyé à la cuisine !</>
              ) : (
                <><Send className="w-4 h-4" /> Envoyer à la cuisine</>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={orderItems.length === 0}
                className="py-2.5 rounded-xl border-2 border-emerald-300 bg-emerald-50 text-emerald-700 font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-3.5 h-3.5" /> Payer
              </button>
              <button
                onClick={initSplit}
                disabled={orderItems.length === 0}
                className="py-2.5 rounded-xl border-2 border-indigo-300 bg-indigo-50 text-indigo-700 font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-indigo-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <SplitSquareHorizontal className="w-3.5 h-3.5" /> Split
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KITCHEN ORDERS MONITOR */}
      {kitchenOrders.length > 0 && (
        <div className="glass-panel p-5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-4">
            <ChefHat className="w-4 h-4 text-[#7c5a30]" />
            Suivi Cuisine — {kitchenOrders.length} commande{kitchenOrders.length > 1 ? 's' : ''}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {kitchenOrders.map(order => {
              const sc = statusConfig[order.status];
              return (
                <div key={order.id} className={`glass-card p-4 border ${sc.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                      <span className="text-xs font-mono font-bold text-slate-700">{order.table}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{order.id}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${sc.color}`}>{sc.label}</span>
                  </div>
                  <div className="space-y-0.5 mb-2">
                    {order.items.map(i => (
                      <p key={i.menuItem.id} className="text-[11px] text-slate-600">
                        {i.menuItem.emoji} {i.menuItem.nameFr} <span className="text-slate-400">×{i.quantity}</span>
                      </p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-200/60 pt-2">
                    <span><Clock className="w-3 h-3 inline mr-1" />{order.sentAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Prêt ~{order.estimatedReady.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel p-8 max-w-sm w-full mx-4 shadow-2xl border border-[#c19a6b]/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-800 font-display-luxury">Encaissement</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-4 mb-5">
              <div className="flex justify-between text-xs text-slate-500 font-mono mb-1"><span>Table</span><span className="font-bold text-slate-700">{selectedTable}</span></div>
              <div className="flex justify-between text-xs text-slate-500 font-mono mb-1"><span>Articles</span><span>{orderItems.reduce((a, o) => a + o.quantity, 0)}</span></div>
              <div className="flex justify-between text-base font-bold text-slate-800 font-mono border-t border-slate-200 pt-2 mt-2">
                <span>À payer</span><span className="text-[#7c5a30]">€{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {([
                { key: 'card', label: 'Carte', icon: CreditCard },
                { key: 'cash', label: 'Espèces', icon: Banknote },
                { key: 'mobile', label: 'Mobile', icon: Smartphone },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setPaymentMethod(key)}
                  className={`flex flex-col items-center gap-2 py-3 rounded-xl border-2 text-xs font-mono font-bold transition-all ${paymentMethod === key ? 'bg-[#c19a6b]/10 border-[#c19a6b] text-[#7c5a30]' : 'border-slate-200 text-slate-500 hover:border-[#c19a6b]/30'}`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={processPayment}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
            >
              <CheckCircle2 className="w-5 h-5" />
              Valider le paiement
            </button>
          </div>
        </div>
      )}

      {/* SPLIT BILL MODAL */}
      {showSplitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[#c19a6b]/30">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display-luxury flex items-center gap-2">
                  <SplitSquareHorizontal className="w-4 h-4 text-indigo-600" />
                  Partage d'addition — {selectedTable}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">Total: €{total.toFixed(2)}</p>
              </div>
              <button onClick={() => setShowSplitModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guest count selector */}
            <div className="flex items-center gap-3 mb-5 p-3 bg-slate-50/80 rounded-xl">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-mono text-slate-600">Nombre de convives :</span>
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => setGuestCount(Math.max(2, guestCount - 1))} className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-sm font-bold font-mono">{guestCount}</span>
                <button onClick={() => setGuestCount(Math.min(8, guestCount + 1))} className="w-7 h-7 rounded-lg bg-[#c19a6b]/20 hover:bg-[#c19a6b]/40 flex items-center justify-center transition">
                  <Plus className="w-3 h-3 text-[#7c5a30]" />
                </button>
              </div>
              <button
                onClick={initSplit}
                className="ml-2 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold hover:bg-indigo-600 transition"
              >
                Appliquer
              </button>
            </div>

            {/* Split per guest */}
            {splitGuests.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {splitGuests.map((guest) => {
                    const equalShare = total / splitGuests.length;
                    return (
                      <div key={guest.id} className={`glass-card p-4 border-2 ${guest.paid ? 'border-emerald-300 bg-emerald-50/50' : 'border-white'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-700 font-mono">{guest.name}</span>
                          <span className="text-sm font-bold text-[#7c5a30] font-mono">€{equalShare.toFixed(2)}</span>
                        </div>
                        {/* Payment method */}
                        <div className="flex gap-1.5 mb-3">
                          {(['card', 'cash', 'mobile'] as const).map(method => (
                            <button
                              key={method}
                              onClick={() => setSplitGuests(prev => prev.map(g => g.id === guest.id ? { ...g, paymentMethod: method } : g))}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition ${guest.paymentMethod === method ? 'bg-[#c19a6b]/20 border-[#c19a6b] text-[#7c5a30]' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                            >
                              {method === 'card' ? '💳' : method === 'cash' ? '💵' : '📱'}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setSplitGuests(prev => prev.map(g => g.id === guest.id ? { ...g, paid: true } : g));
                            addAuditLog('POS_SPLIT_PAYMENT', `Split payment from ${guest.name} — €${equalShare.toFixed(2)} via ${guest.paymentMethod.toUpperCase()}`, 'AUTHORIZED');
                            confetti({ particleCount: 30, spread: 40, colors: ['#10b981', '#ffffff'] });
                          }}
                          disabled={guest.paid}
                          className={`w-full py-2 rounded-xl text-[11px] font-mono font-bold uppercase flex items-center justify-center gap-1.5 transition-all ${guest.paid ? 'bg-emerald-100 text-emerald-600 border border-emerald-300' : 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95'}`}
                        >
                          {guest.paid ? <><CheckCircle2 className="w-3.5 h-3.5" /> Payé</> : 'Encaisser'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {splitGuests.every(g => g.paid) && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xs font-bold text-emerald-700 font-mono">Tous les paiements validés !</p>
                    <button
                      onClick={() => { setShowSplitModal(false); setOrderItems([]); }}
                      className="mt-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold hover:bg-emerald-600 transition"
                    >
                      Fermer & vider la commande
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
