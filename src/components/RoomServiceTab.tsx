import React, { useState, useEffect } from 'react';
import { 
  Utensils, CheckCircle, ChevronRight, Receipt, CreditCard, RefreshCw, Shield,
  SlidersHorizontal, ArrowUpDown, Search, LayoutGrid, Kanban, ArrowUp, ArrowDown, 
  HelpCircle, Sparkles, Plus, X, AlertTriangle, Landmark
} from 'lucide-react';
import { RoomServiceOrder } from '../types';
import confetti from 'canvas-confetti';

interface RoomServiceTabProps {
  roomOrders: RoomServiceOrder[];
  advanceOrderStatus: (id: string) => void;
  addAuditLog?: (action: string, reason: string, status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT', role?: string) => void;
  language?: 'EN' | 'FR' | 'RU';
}

interface SimulatedInvoice {
  id: string;
  orderId: string;
  guest: string;
  room: string;
  details: string;
  baseAmount: number;
  vat: number;
  serviceCharge: number;
  total: number;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'REFUNDED';
  refundReason?: string;
  refundAmount?: number;
}

// Highly stylized SVG Illustrations representing our bespoke culinary plates
export const CulinaryVectorSVG: React.FC<{ orderId: string }> = ({ orderId }) => {
  switch (orderId) {
    case 'order-1': // Gourmet French Breakfast Platter
      return (
        <svg viewBox="0 0 300 180" className="w-full h-full object-cover">
          <defs>
            <radialGradient id="plateShadow" cx="50%" cy="55%" r="50%">
              <stop offset="60%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </radialGradient>
            <linearGradient id="eggYolk" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="ojGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#fb923c" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="plateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fafaf9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="300" height="180" fill="#0f172a" />
          <path d="M 0,110 Q 150,120 300,110 L 300,180 L 0,180 Z" fill="#1e293b" opacity="0.4" />
          
          <ellipse cx="140" cy="115" rx="76" ry="42" fill="black" opacity="0.45" />
          <ellipse cx="140" cy="110" rx="72" ry="38" fill="url(#plateGrad)" stroke="#c19a6b" strokeWidth="1.5" />
          <ellipse cx="140" cy="110" rx="58" ry="29" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
          
          <g filter="url(#glow)">
            <path d="M 105,108 C 90,108 85,92 100,85 C 115,80 125,90 120,102 C 118,106 112,112 105,108 Z" fill="#fafafa" stroke="#eab308" strokeWidth="0.5" />
            <circle cx="106" cy="94" r="9" fill="url(#eggYolk)" />
            <ellipse cx="103" cy="91" rx="2.5" ry="1.5" fill="#ffffff" opacity="0.8" />
            
            <path d="M 135,115 C 122,118 118,105 125,98 C 132,92 148,94 146,108 C 145,114 140,116 135,115 Z" fill="#fafafa" stroke="#d97706" strokeWidth="0.5" />
            <circle cx="134" cy="104" r="8" fill="url(#eggYolk)" />
            <ellipse cx="132" cy="101" rx="2.2" ry="1.2" fill="#ffffff" opacity="0.8" />
          </g>
          
          <path d="M75,122 Q95,105 115,124 T155,108" stroke="#7f1d1d" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <path d="M75,122 Q95,105 115,124 T155,108" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="14,6" />
          <path d="M82,128 Q102,112 122,130 T162,114" stroke="#9a3412" strokeWidth="4.5" strokeLinecap="round" fill="none" />

          <g>
            <circle cx="178" cy="100" r="8" fill="#ef4444" />
            <circle cx="178" cy="100" r="7.5" fill="none" stroke="#7f1d1d" strokeWidth="0.5" />
            <path d="M174,98 Q178,94 182,98" stroke="#15803d" strokeWidth="1.5" fill="none" />
            <ellipse cx="180" cy="103" rx="2" ry="1" fill="#450a0a" opacity="0.8" />
            <circle cx="168" cy="112" r="7" fill="#b91c1c" />
          </g>

          <polygon points="65,75 98,75 80,105" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
          <polygon points="62,72 94,72 78,98" fill="#fed7aa" opacity="0.95" />

          <circle cx="118" cy="120" r="1.5" fill="#22c55e" />
          <circle cx="152" cy="100" r="1.2" fill="#15803d" />

          <g transform="translate(225, 40)">
            <ellipse cx="18" cy="72" rx="14" ry="6" fill="#000000" opacity="0.4" />
            <path d="M 5,10 L 31,10 L 26,70 C 25,73 11,73 10,70 Z" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.75" />
            <path d="M 7,22 L 29,22 L 25,68 C 24,70 12,70 11,68 Z" fill="url(#ojGrad)" />
            <path d="M 1,12 A 12,12 0 0,1 15,1" stroke="#f97316" strokeWidth="2.5" fill="none" />
            <line x1="18" y1="-2" x2="16" y2="55" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'order-2': // Chef Selection Premium Sushi Platter
      return (
        <svg viewBox="0 0 300 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="salmonColor" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="40%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="tunaColor" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="50%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
            <linearGradient id="shrimpColor" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="60%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#ff8552" />
            </linearGradient>
            <linearGradient id="goldAcc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="1.2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="300" height="180" fill="#0b0f19" />
          <rect x="42" y="47" width="216" height="96" rx="8" fill="#000000" opacity="0.65" />
          <rect x="38" y="42" width="216" height="92" rx="6" fill="#1e293b" stroke="#c19a6b" strokeWidth="1" />
          <rect x="42" y="46" width="208" height="84" rx="4" fill="#090d16" />
          
          <path d="M 42,65 Q 120,40 250,55" stroke="url(#goldAcc)" strokeWidth="0.75" fill="none" opacity="0.65" />

          <g transform="translate(62, 74)">
            <rect x="2" y="10" width="36" height="15" rx="5" fill="#f8fafc" />
            <rect x="0" y="2" width="40" height="14" rx="4" fill="url(#salmonColor)" />
            <path d="M 4,4 L 14,14 M 14,4 L 24,14 M 24,4 L 34,14" stroke="#ffe4e6" strokeWidth="1" opacity="0.65" />
          </g>

          <g transform="translate(122, 74)">
            <rect x="2" y="10" width="36" height="15" rx="5" fill="#f8fafc" />
            <rect x="0" y="2" width="40" height="14" rx="4" fill="url(#tunaColor)" />
            <line x1="4" y1="4" x2="36" y2="10" stroke="#fda4af" strokeWidth="0.75" opacity="0.25" />
          </g>

          <g transform="translate(182, 74)">
            <rect x="2" y="10" width="36" height="15" rx="5" fill="#f8fafc" />
            <path d="M 0,9 Q 15,2 35,6 L 43,1 L 40,8 L 35,11 Q 15,16 0,9 Z" fill="url(#shrimpColor)" />
          </g>

          <g transform="translate(110, 110)">
            <circle cx="12" cy="12" r="10" fill="#042f1a" />
            <circle cx="12" cy="12" r="8" fill="#fafaf9" />
            <circle cx="12" cy="12" r="3" fill="#ef4444" />
          </g>
          <g transform="translate(150, 110)">
            <circle cx="12" cy="12" r="10" fill="#042f1a" />
            <circle cx="12" cy="12" r="8" fill="#fafaf9" />
            <circle cx="12" cy="12" r="3" fill="#f59e0b" />
          </g>

          <path d="M 215,112 C 210,112 208,124 218,124 C 224,124 220,114 225,114 Z" fill="#a3e635" stroke="#65a30d" strokeWidth="0.5" />
          <path d="M 52,118 Q 44,116 48,112 T 56,112 Z" fill="#fda4af" stroke="#f43f5e" strokeWidth="0.5" />

          <line x1="55" y1="138" x2="245" y2="128" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="225" y1="129" x2="245" y2="128" stroke="url(#goldAcc)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'order-3': // Angus Steak Barolo wine dinner
      return (
        <svg viewBox="0 0 300 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="steakSeared" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#301402" />
              <stop offset="40%" stopColor="#1e0c01" />
              <stop offset="85%" stopColor="#411d08" />
              <stop offset="100%" stopColor="#541b01" />
            </linearGradient>
            <linearGradient id="skilletMetal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="goldHighlight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          <rect width="300" height="180" fill="#1b120c" />
          <ellipse cx="145" cy="90" rx="86" ry="46" fill="#000000" opacity="0.65" />
          <ellipse cx="145" cy="86" rx="82" ry="42" fill="url(#skilletMetal)" stroke="#475569" strokeWidth="1" />
          <ellipse cx="145" cy="86" rx="74" ry="35" fill="#0f172a" />
          
          <path d="M 43,86 L 15,84 L 15,88 L 43,86 Z" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 100,92 C 95,74 118,65 145,71 C 172,77 195,68 202,82 C 210,96 195,112 175,112 C 150,112 110,118 100,92 Z" fill="url(#steakSeared)" stroke="#271104" strokeWidth="1" />
          
          <path d="M 115,80 L 145,108 M 130,76 L 165,108 M 145,74 L 185,110" stroke="#000000" strokeWidth="3" opacity="0.85" strokeLinecap="round" />
          
          <g>
            <rect x="150" y="80" width="12" height="12" rx="2" fill="#fef08a" transform="rotate(15 150 80)" stroke="#eab308" strokeWidth="0.5" />
            <circle cx="152" cy="84" r="10" fill="#fef08a" opacity="0.35" />
          </g>

          <path d="M 115,106 Q 140,114 175,102" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 125,108 L 122,112 M 135,110 L 134,116" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />

          <g transform="translate(68, 52) rotate(-10)">
            <rect x="0" y="0" width="34" height="6.5" rx="1.5" fill="url(#goldHighlight)" stroke="#b45309" strokeWidth="0.5" />
            <rect x="4" y="6" width="30" height="6" rx="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
          </g>
        </svg>
      );

    case 'order-4': // Gourmet Pancakes
      return (
        <svg viewBox="0 0 300 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="pancakeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="35%" stopColor="#fbbf24" />
              <stop offset="90%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>
            <linearGradient id="syrupColor" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="10%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="porcelain" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <linearGradient id="coffeeDark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2c1401" />
              <stop offset="100%" stopColor="#120500" />
            </linearGradient>
          </defs>
          <rect width="300" height="180" fill="#f8fafc" />
          <ellipse cx="125" cy="115" rx="72" ry="38" fill="#000000" opacity="0.15" />
          <ellipse cx="125" cy="110" rx="68" ry="34" fill="url(#porcelain)" stroke="#c19a6b" strokeWidth="1.5" />
          <ellipse cx="125" cy="110" rx="52" ry="26" fill="#fafafa" stroke="#e2e8f0" strokeWidth="0.5" />

          <ellipse cx="125" cy="112" rx="42" ry="12" fill="url(#pancakeGrad)" stroke="#78350f" strokeWidth="0.5" />
          <ellipse cx="125" cy="100" rx="41" ry="11.5" fill="url(#pancakeGrad)" stroke="#78350f" strokeWidth="0.5" />
          <ellipse cx="125" cy="88" rx="38" ry="11" fill="url(#pancakeGrad)" stroke="#78350f" strokeWidth="0.5" />

          <path d="M 102,88 Q 112,112 114,102 Q 130,122 136,104" fill="none" stroke="url(#syrupColor)" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="114" cy="114" rx="3.5" ry="1.5" fill="url(#syrupColor)" />

          <g transform="translate(118, 74)">
            <rect x="0" y="0" width="12" height="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" transform="rotate(18 6 5)" />
          </g>

          <circle cx="106" cy="85" r="4.5" fill="#1e3a8a" />
          <circle cx="145" cy="88" r="4" fill="#1d4ed8" />

          <g transform="translate(225, 80)">
            <ellipse cx="20" cy="52" rx="24" ry="10" fill="#000000" opacity="0.2" />
            <ellipse cx="20" cy="48" rx="22" ry="8" fill="url(#porcelain)" stroke="#c19a6b" strokeWidth="1" />
            <path d="M 34,24 C 44,24 42,42 34,40" stroke="url(#porcelain)" strokeWidth="3" fill="none" />
            <ellipse cx="20" cy="30" rx="18" ry="12" fill="url(#porcelain)" stroke="#cbd5e1" strokeWidth="0.5" />
            <ellipse cx="20" cy="27" rx="15" ry="9" fill="url(#coffeeDark)" />
          </g>
        </svg>
      );

    case 'order-5': // Wagyu Beef Burger
      return (
        <svg viewBox="0 0 300 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="goldLeaf" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="brioche" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>
          <rect width="300" height="180" fill="#090d16" />
          <ellipse cx="150" cy="100" rx="88" ry="48" fill="#ca8a04" opacity="0.15" />
          <ellipse cx="150" cy="95" rx="82" ry="42" fill="#1e293b" stroke="url(#goldLeaf)" strokeWidth="2" />
          <ellipse cx="150" cy="95" rx="72" ry="34" fill="#0b0f19" />

          <path d="M 108,122 C 108,135 192,135 192,122 Z" fill="#9a3412" opacity="0.9" />
          <rect x="100" y="106" width="100" height="18" rx="6" fill="#271104" stroke="#100500" strokeWidth="1" />
          
          <path d="M 102,110 C 115,124 125,124 135,112 C 150,126 165,126 175,110" fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 98,105 Q 150,96 202,105 L 195,110 Q 150,102 105,110 Z" fill="#166534" stroke="#15803d" strokeWidth="0.5" />
          <rect x="106" y="98" width="88" height="7" rx="3.5" fill="#dc2626" />

          <path d="M 104,96 C 104,50 196,50 196,96 Z" fill="url(#brioche)" />
          
          <polygon points="132,68 142,60 148,72 138,76" fill="url(#goldLeaf)" />
          <circle cx="132" cy="74" r="1.5" fill="#ffffff" opacity="0.9" />
          <circle cx="158" cy="64" r="1.5" fill="#ffffff" opacity="0.85" />
        </svg>
      );

    case 'order-6': // Fettuccine Vongole
      return (
        <svg viewBox="0 0 300 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="clamInternal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="pastaRibbon" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#fcd34d" />
            </linearGradient>
          </defs>
          <rect width="300" height="180" fill="#1e293b" />
          <ellipse cx="150" cy="115" rx="82" ry="42" fill="#000000" opacity="0.3" />
          <ellipse cx="150" cy="108" rx="78" ry="38" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <ellipse cx="150" cy="108" rx="64" ry="29" fill="#fafafa" stroke="#e2e8f0" strokeWidth="0.5" />

          <g stroke="url(#pastaRibbon)" strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.95">
            <path d="M 115,100 Q 150,84 185,100 T 150,118 T 115,100" />
            <path d="M 110,108 Q 150,90 190,108 T 150,124 T 110,108" opacity="0.85" />
          </g>

          <g transform="translate(100, 85) rotate(-15)">
            <ellipse cx="10" cy="10" rx="9" ry="12" fill="url(#clamInternal)" stroke="#475569" strokeWidth="0.8" />
            <ellipse cx="10" cy="10" rx="6" ry="8" fill="#fee2e2" opacity="0.9" />
            <circle cx="10" cy="10" r="4" fill="#fda4af" />
          </g>
          <g transform="translate(175, 92) rotate(40)">
            <ellipse cx="10" cy="10" rx="9" ry="12" fill="url(#clamInternal)" stroke="#475569" strokeWidth="0.8" />
            <circle cx="10" cy="10" r="3.5" fill="#fecdd3" />
          </g>

          <circle cx="124" cy="98" r="1.5" fill="#166534" />
          <circle cx="140" cy="92" r="2" fill="#166534" />
          <polygon points="128,102 131,100 130,104" fill="#ef4444" />
        </svg>
      );

    default: // Custom Newly Created Order SVG
      return (
        <svg viewBox="0 0 300 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="clocheMetal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="warmLight" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fefaf0" />
              <stop offset="100%" stopColor="#faf2d5" />
            </linearGradient>
          </defs>
          <rect width="300" height="180" fill="#090d16" />
          <ellipse cx="150" cy="120" rx="90" ry="32" fill="#000000" opacity="0.6" />
          <ellipse cx="150" cy="116" rx="82" ry="28" fill="url(#clocheMetal)" />
          <ellipse cx="150" cy="114" rx="76" ry="24" fill="#475569" />
          <ellipse cx="150" cy="114" rx="72" ry="20" fill="url(#warmLight)" />

          {/* Cloche Dome */}
          <path d="M 90,110 C 90,62 210,62 210,110 Z" fill="url(#clocheMetal)" opacity="0.85" stroke="#94a3b8" strokeWidth="1" />
          <path d="M 100,109 C 100,70 200,70 200,109 Z" fill="none" stroke="#ffffff" strokeWidth="0.75" opacity="0.4" />
          <circle cx="150" cy="58" r="10" fill="url(#clocheMetal)" />
          <circle cx="150" cy="58" r="6" fill="#cbd5e1" />
          <rect x="146" y="65" width="8" height="6" fill="url(#clocheMetal)" />

          <path d="M 150,42 L 150,50" stroke="#c19a6b" strokeWidth="1.5" />
          <text x="150" y="102" fill="#7c5a30" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold" letterSpacing="1">ZAFIR OPERATIONS</text>
        </svg>
      );
  }
};

const tabTranslations = {
  EN: {
    title: "Zafir Room Service Orders",
    subtitle: "High-gastronomy logistics tracking, kitchen preparation pipeline, and live room-deliveries control",
    vipPlacements: "VIP Suite Orders Active",
    searchPlaceholder: "Search orders, guests, suites or items...",
    sortBy: "Sort by",
    sortId: "Chronology (ID)",
    sortStatus: "Milestone Stage",
    sortRoom: "Suite ID",
    sortGuest: "Guest Name",
    sortManual: "Custom Priority Queue",
    statusAll: "All Orders",
    viewMode: "Layout Mode",
    viewKanban: "Kanban Board",
    viewGrid: "Tactical Grid",
    preparationStage: "Preparation Milestone",
    authenticated: "Credential OK",
    advanceStatus: "Advance Stage",
    invoiceTitle: "Certified Gastronomy Invoice Statement",
    invoiceSubtitle: "Formal regulatory compliant statement. Synchronized with decentralized accounts.",
    invoiceStatus: "Invoice Status",
    itemizedRoomPlacements: "Itemized Suite Placements",
    vat: "Luxury Gastronomy VAT (20%)",
    surcharge: "Elite Suite Service Surcharge/Delivery",
    totalDue: "TOTAL DUE BALANCE (USD)",
    refundButton: "Trigger Sovereign Refund",
    checkoutTerminal: "Secure Elements Checkout Terminal (Stripe)",
    checkoutSubtitle: "Compliant transaction gateway utilizing secure credential tokenization.",
    cardholderName: "Cardholder Nom",
    cardNumber: "Token Card Structure",
    authorizeCharge: "Authorize Stripe Escrow",
    refundActionModal: "Sovereign Refund Mandate",
    refundReasonLabel: "Authorized Direct Refund Reason",
    refundAmountLabel: "Authorized Refund Quantity ($)",
    confirmRefund: "Authorize Refund",
    cancel: "Abort",
    stagePrep: "Preparation",
    stageQuality: "Quality Check",
    stageDelivery: "Out for Delivery",
    stageDelivered: "Suite Delivered",
    asc: "Ascending",
    desc: "Descending",
    movePrioritize: "Prioritize Order",
    moveDeprioritize: "Deprioritize Order",
    statsTitle: "Operational Matrix",
    noOrdersInStage: "Pipeline empty for this milestone",
    linkedInvoice: "Active Docket",
    invoicePaid: "SETTLED",
    invoicePending: "PENDING",
    newOrderBtn: "Submit Luxury Order",
    guestNameLabel: "Sovereign Guest Name",
    suiteLabel: "Target Suite/Villa",
    detailsLabel: "Gastronomic Specifications",
    priceLabel: "Calculated Value ($)",
    statusLabel: "Initial Milestone",
    closeBtn: "Close",
    createSuccess: "Culinary placement logged into hotel blockchain",
    validationError: "Fill in all suite details correctly!"
  },
  FR: {
    title: "Commandes de Service d'Étage Zafir",
    subtitle: "Suivi logistique de haute gastronomie, préparation en cuisine et livraison en temps réel",
    vipPlacements: "Commandes Suites VIP Actives",
    searchPlaceholder: "Rechercher commande, client, suite ou item...",
    sortBy: "Trier par",
    sortId: "Chronologique (ID)",
    sortStatus: "Étape Opérationnelle",
    sortRoom: "Numéro de Suite",
    sortGuest: "Nom du Client",
    sortManual: "File Prioritaire Manuelle",
    statusAll: "Toutes les Commandes",
    viewMode: "Mode d'affichage",
    viewKanban: "Pipeline Kanban",
    viewGrid: "Grille Tactique",
    preparationStage: "Étape de Préparation",
    authenticated: "Paiement Certifié",
    advanceStatus: "Avancer le Statut",
    invoiceTitle: "Facture de Haute Gastronomie",
    invoiceSubtitle: "Relevé certifié conforme. Synchronisé en temps réel avec les grands livres.",
    invoiceStatus: "Statut de la Facture",
    itemizedRoomPlacements: "Détails de la Facture",
    vat: "TVA Gastronomie de Luxe (20%)",
    surcharge: "Service & Livraison Élite en Suite",
    totalDue: "TOTAL DU RELEVÉ (USD)",
    refundButton: "Déclencher un Remboursement",
    checkoutTerminal: "Terminal Sécurisé Stripe Elements",
    checkoutSubtitle: "Passerelle de paiement chiffrée simulant des éléments tokenisés.",
    cardholderName: "Nom du Titulaire",
    cardNumber: "Numéro de Carte Sécurisé",
    authorizeCharge: "Autoriser le Chèque Stripe",
    refundActionModal: "Remboursement Souverain",
    refundReasonLabel: "Raison du Remboursement Autorisé",
    refundAmountLabel: "Montant à Déduire ($)",
    confirmRefund: "Confirmer le Remboursement",
    cancel: "Annuler",
    stagePrep: "En Cuisine",
    stageQuality: "Contrôle Qualité",
    stageDelivery: "En Livraison",
    stageDelivered: "Livré en Suite",
    asc: "Croissant",
    desc: "Décroissant",
    movePrioritize: "Prioriser l'ordre",
    moveDeprioritize: "Rétrograder l'ordre",
    statsTitle: "Distribution Opérationnelle",
    noOrdersInStage: "Aucune commande à cette étape du pipeline",
    linkedInvoice: "Dossier Rattaché",
    invoicePaid: "RÉGLÉ",
    invoicePending: "NON PAYÉ",
    newOrderBtn: "Ajouter une Commande Élite",
    guestNameLabel: "Nom du Client Souverain",
    suiteLabel: "Suite ou Villa Cible",
    detailsLabel: "Spécifications Gastronomiques",
    priceLabel: "Valeur Estimée ($)",
    statusLabel: "Filière Initiale",
    closeBtn: "Fermer",
    createSuccess: "Placement culinaire enregistré sur les registres",
    validationError: "Veuillez remplir tous les champs requis !"
  },
  RU: {
    title: "Обслуживание номеров Zafir",
    subtitle: "Логистический контроль высокой кухни, статус приготовления и доставка в реальном времени",
    vipPlacements: "VIP Заказов Активно",
    searchPlaceholder: "Поиск заказа, гостя или сюиты...",
    sortBy: "Сортировать по",
    sortId: "Хронология (ID)",
    sortStatus: "Этап подготовки",
    sortRoom: "Номер комнаты",
    sortGuest: "Имя гостя",
    sortManual: "Пользовательская очередь",
    statusAll: "Все заказы",
    viewMode: "Режим просмотра",
    viewKanban: "Канбан пайплайн",
    viewGrid: "Тактическая сетка",
    preparationStage: "Этап подготовки",
    authenticated: "Проверено",
    advanceStatus: "Продвинуть статус",
    invoiceTitle: "Сертифицированный гастрономический счет",
    invoiceSubtitle: "Официальный платежный отчет. Синхронизирован с децентрализованными реестрами.",
    invoiceStatus: "Статус счета",
    itemizedRoomPlacements: "Детализация счета",
    vat: "НДС на роскошную кухню (20%)",
    surcharge: "Сбор за обслуживание Elite Class",
    totalDue: "ИТОГО К ОПЛАТЕ (USD)",
    refundButton: "Инициировать возврат",
    checkoutTerminal: "Безопасный терминал оплаты (Stripe Sandbox)",
    checkoutSubtitle: "Имитатор платежей, использующий токенизированные элементы.",
    cardholderName: "Имя владельца карты",
    cardNumber: "Номер заблокированной карты",
    authorizeCharge: "Авторизовать платеж Stripe",
    refundActionModal: "Возврат средств",
    refundReasonLabel: "Официальная причина возврата",
    refundAmountLabel: "Сумма возврата ($)",
    confirmRefund: "Подтвердить возврат",
    cancel: "Отмена",
    stagePrep: "Приготовление",
    stageQuality: "Контроль качества",
    stageDelivery: "В пути",
    stageDelivered: "Доставлено в номер",
    asc: "По возрастанию",
    desc: "По убыванию",
    movePrioritize: "Повысить приоритет",
    moveDeprioritize: "Понизить приоритет",
    statsTitle: "Операции",
    noOrdersInStage: "Очередь по данному этапу пуста",
    linkedInvoice: "Счет привязан",
    invoicePaid: "ОПЛАЧЕНО",
    invoicePending: "ОЖИДАЕТСЯ",
    newOrderBtn: "Создать новый заказ",
    guestNameLabel: "Имя суверенного гостя",
    suiteLabel: "Сюита или вилла",
    detailsLabel: "Гастрономическое меню",
    priceLabel: "Стоимость ($)",
    statusLabel: "Первоначальный статус",
    closeBtn: "Закрыть",
    createSuccess: "Кулинарный заказ зафиксирован в реестре гостиницы",
    validationError: "Пожалуйста, корректно заполните все поля!"
  }
};

export const RoomServiceTab: React.FC<RoomServiceTabProps> = ({ roomOrders, advanceOrderStatus, addAuditLog, language }) => {
  const currentLang = language || 'EN';
  const t = tabTranslations[currentLang] || tabTranslations.EN;

  // Invoices mapping
  const [invoices, setInvoices] = useState<SimulatedInvoice[]>([
    { id: 'INV-2026-041', orderId: 'order-1', guest: 'Mr. Chen', room: 'Suite 201', details: 'Gourmet French Breakfast Platter', baseAmount: 48, vat: 9.6, serviceCharge: 15, total: 72.6, status: 'PENDING' },
    { id: 'INV-2026-042', orderId: 'order-2', guest: 'Ms. Al-Fayed', room: 'Suite 202', details: 'Chef Selection Premium Sushi Platter', baseAmount: 95, vat: 19.0, serviceCharge: 15, total: 129.0, status: 'PAID' },
    { id: 'INV-2026-043', orderId: 'order-3', guest: 'Dr. Rossi', room: 'Suite 203', details: 'Angus Steak Barolo wine dinner', baseAmount: 140, vat: 28.0, serviceCharge: 15, total: 183.0, status: 'PENDING' },
    { id: 'INV-2026-044', orderId: 'order-4', guest: 'Al Gtore', room: 'Villa 1', details: 'Buttermilk Pancakes & Espresso', baseAmount: 35, vat: 7.0, serviceCharge: 15, total: 57.0, status: 'PENDING' },
    { id: 'INV-2026-045', orderId: 'order-5', guest: 'Contarah', room: 'Villa 2', details: 'Wagyu Beef Cheeseburger', baseAmount: 65, vat: 13.0, serviceCharge: 15, total: 93.0, status: 'PAID' },
    { id: 'INV-2026-046', orderId: 'order-6', guest: 'Fonuhery', room: 'Suite 304', details: 'Fettuccine Vongole & Pinot', baseAmount: 55, vat: 11.0, serviceCharge: 15, total: 81.0, status: 'PENDING' }
  ]);

  // Integrated newly-added local orders (allows the user to completely test the form)
  const [localOrders, setLocalOrders] = useState<RoomServiceOrder[]>([]);
  const combinedOrders = [...roomOrders, ...localOrders];

  // Active Selected Invoice logic
  const [activeInvId, setActiveInvId] = useState('INV-2026-041');
  const currentInvoice = invoices.find(inv => inv.id === activeInvId) || invoices[0];

  // Credit Card Secure Terminal state
  const [payMethod, setPayMethod] = useState<'CARD' | 'BANK_TRANSFER' | 'CASH'>('CARD');
  const [cardName, setCardName] = useState('CHEN S.');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const cardExpiry = '09 / 29';
  const [cardCvc, setCardCvc] = useState('981');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  // Administrative Refund portal state (Sprint 15 RefundModal)
  const [showRefundPrompt, setShowRefundPrompt] = useState(false);
  const [refundReason, setRefundReason] = useState('Disappointing culinary caviar serving temperature');
  const [refundValue, setRefundValue] = useState<number>(30);

  // Layout filter and prioritization controls
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Preparation' | 'Quality Check' | 'Out for Delivery' | 'Delivered'>('All');
  const [sortBy, setSortBy] = useState<'id' | 'status' | 'room' | 'guest' | 'manual'>('status');
  const [isAsc, setIsAsc] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'grid'>('kanban');

  // Manual list sorting order sequence
  const [manualOrderIds, setManualOrderIds] = useState<string[]>([]);

  // Modal order creation popup state
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [formGuest, setFormGuest] = useState('');
  const [formSuite, setFormSuite] = useState('Suite 101');
  const [formDetails, setFormDetails] = useState('');
  const [formPrice, setFormPrice] = useState(45);
  const [formStatus, setFormStatus] = useState<'Preparation' | 'Quality Check'>('Preparation');
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize manual priorities on load or state update
  useEffect(() => {
    if (combinedOrders.length > 0) {
      setManualOrderIds(prev => {
        const existingIds = new Set(prev);
        const newIds = combinedOrders.map(o => o.id);
        const updated = [...prev];
        newIds.forEach(id => {
          if (!existingIds.has(id)) {
            updated.push(id);
          }
        });
        return updated.filter(id => newIds.includes(id));
      });
    }
  }, [combinedOrders.length]);

  // Handle priority swapping of items (moving them up/down hierarchy)
  const moveOrder = (id: string, direction: 'up' | 'down') => {
    setManualOrderIds(prev => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;

      const newOrderIds = [...prev];
      const temp = newOrderIds[idx];
      newOrderIds[idx] = newOrderIds[targetIdx];
      newOrderIds[targetIdx] = temp;

      if (addAuditLog) {
        addAuditLog(
          'ORDER_REARRANGED',
          `Order priority updated. Moved ${id} ${direction}. Culinary queue recalibrated on hotel core matrix.`,
          'AUTHORIZED'
        );
      }
      return newOrderIds;
    });
    setSortBy('manual'); // focus immediately to priority sorting display
  };

  // Perform advancing of specific order status
  const handleAdvanceStatus = (id: string) => {
    const isLocal = localOrders.some(o => o.id === id);
    if (!isLocal) {
      advanceOrderStatus(id);
    } else {
      // Local orders advance logic
      setLocalOrders(prev => prev.map(order => {
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
    }

    if (addAuditLog) {
      const updatedOrder = combinedOrders.find(o => o.id === id);
      addAuditLog(
        'ORDER_STATUS_ADVANCED',
        `Milestone transition executed for order ${id}. Room alignment: ${updatedOrder?.room}.`,
        'AUTHORIZED'
      );
    }
  };

  // Compile and return the list of orders with filters and sorts
  const getProcessedOrders = () => {
    let items = combinedOrders.filter(order => {
      const matchesSearch = 
        order.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortBy === 'manual') {
      items.sort((a, b) => {
        const idxA = manualOrderIds.indexOf(a.id);
        const idxB = manualOrderIds.indexOf(b.id);
        const posA = idxA === -1 ? 999 : idxA;
        const posB = idxB === -1 ? 999 : idxB;
        return (posA - posB) * (isAsc ? 1 : -1);
      });
    } else if (sortBy === 'status') {
      const statusRank = { 'Preparation': 1, 'Quality Check': 2, 'Out for Delivery': 3, 'Delivered': 4 };
      items.sort((a, b) => {
        const rankA = statusRank[a.status] || 0;
        const rankB = statusRank[b.status] || 0;
        return (rankA - rankB) * (isAsc ? 1 : -1);
      });
    } else if (sortBy === 'room') {
      items.sort((a, b) => a.room.localeCompare(b.room) * (isAsc ? 1 : -1));
    } else if (sortBy === 'guest') {
      items.sort((a, b) => a.guest.localeCompare(b.guest) * (isAsc ? 1 : -1));
    } else { // Chronology / ID
      items.sort((a, b) => a.id.localeCompare(b.id) * (isAsc ? 1 : -1));
    }

    return items;
  };

  const processedOrders = getProcessedOrders();

  // Counts for statistics metrics block
  const prepCount = combinedOrders.filter(o => o.status === 'Preparation').length;
  const qualityCount = combinedOrders.filter(o => o.status === 'Quality Check').length;
  const deliveryCount = combinedOrders.filter(o => o.status === 'Out for Delivery').length;
  const deliveredCount = combinedOrders.filter(o => o.status === 'Delivered').length;

  const handleSelectInvoiceByOrderId = (orderId: string, order: RoomServiceOrder) => {
    const exists = invoices.find(inv => inv.orderId === orderId);
    if (!exists) {
      const randBase = orderId.includes('5') ? 65 : orderId.includes('4') ? 35 : orderId.includes('6') ? 55 : 45;
      const vat = Math.round(randBase * 0.2 * 10) / 10;
      const service = 15;
      const invId = `INV-2026-05${Math.floor(10 + Math.random() * 89)}`;
      const newInv: SimulatedInvoice = {
        id: invId,
        orderId,
        guest: order.guest.split(' ')[0],
        room: order.room,
        details: order.details,
        baseAmount: randBase,
        vat,
        serviceCharge: service,
        total: randBase + vat + service,
        status: 'PENDING'
      };
      setInvoices(prev => [...prev, newInv]);
      setActiveInvId(invId);
    } else {
      setActiveInvId(exists.id);
    }
  };

  // Perform Stripe sandbox transaction charge
  const handleStripeChargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInvoice.status === 'PAID') return;

    setIsProcessingPayment(true);
    setPaymentMessage("Connecting Stripe API Sandbox tunnels... Sending tokenized secure elements payload");
    
    setTimeout(() => {
      setPaymentMessage("Sovereign element authorized. Capture amount: $" + currentInvoice.total.toFixed(2));
      
      setTimeout(() => {
        setInvoices(prev => prev.map(inv => {
          if (inv.id === activeInvId) {
            return {
              ...inv,
              status: 'PAID'
            };
          }
          return inv;
        }));

        setIsProcessingPayment(false);
        setPaymentMessage(null);

        if (addAuditLog) {
          addAuditLog(
            'INVOICE_BILLING_CAPTURED',
            `Stripe capture successful for Room ${currentInvoice.room} (${currentInvoice.guest}). Paid value: $${currentInvoice.total.toFixed(2)}. Ticket: ${currentInvoice.id}.`,
            'AUTHORIZED'
          );
        }

        confetti({ particleCount: 35, spread: 50, colors: ['#c19a6b', '#ffffff', '#ffd700'] });
      }, 900);
    }, 1100);
  };

  // Handle direct administrative complaint refund
  const handleIssueRefund = () => {
    if (refundValue > currentInvoice.total) {
      alert("Error: Credit note cannot exceed current invoice payload!");
      return;
    }

    setInvoices(prev => prev.map(inv => {
      if (inv.id === activeInvId) {
        return {
          ...inv,
          status: 'REFUNDED',
          refundReason: refundReason,
          refundAmount: refundValue,
          total: currentInvoice.total - refundValue
        };
      }
      return inv;
    }));

    setShowRefundPrompt(false);

    if (addAuditLog) {
      addAuditLog(
        'REFUND_ISSUED',
        `Authorized Stripe Refund of $${refundValue.toFixed(2)} for ${currentInvoice.id}. Issue reason: "${refundReason}". Ledger updated.`,
        'AUTHORIZED'
      );
    }

    confetti({ particleCount: 15, spread: 25, colors: ['#ff4444', '#ffffff'] });
  };

  // Handle client-side submitting of new custom orders
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGuest.trim() || !formDetails.trim()) {
      setFormError(t.validationError);
      return;
    }

    const newId = `order-${Date.now()}`;
    const newOrder: RoomServiceOrder = {
      id: newId,
      guest: formGuest,
      room: formSuite,
      details: formDetails,
      status: formStatus,
      imgUrl: ''
    };

    // Calculate invoice components on the fly
    const baseVal = Number(formPrice) || 40;
    const vat = Math.round(baseVal * 0.2 * 10) / 10;
    const service = 15;
    const invId = `INV-2026-05${Math.floor(10 + Math.random() * 89)}`;

    const associatedInvoice: SimulatedInvoice = {
      id: invId,
      orderId: newId,
      guest: formGuest.split(' ')[0],
      room: formSuite,
      details: formDetails,
      baseAmount: baseVal,
      vat,
      serviceCharge: service,
      total: baseVal + vat + service,
      status: 'PENDING'
    };

    // Save states
    setLocalOrders(prev => [...prev, newOrder]);
    setInvoices(prev => [...prev, associatedInvoice]);
    setActiveInvId(invId);

    // Reset fields
    setFormGuest('');
    setFormDetails('');
    setFormPrice(45);
    setFormError(null);
    setShowNewOrderModal(false);

    if (addAuditLog) {
      addAuditLog(
        'NEW_ROOM_SERVICE_CREATED',
        `New culinary placement registered inside sovereign docket. Target suite: ${formSuite}. Guest: ${formGuest}.`,
        'AUTHORIZED'
      );
    }

    setToastMessage(t.createSuccess);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);

    confetti({ particleCount: 20, spread: 40, colors: ['#d49619', '#ffffff'] });
  };

  return (
    <div className="space-y-6 animate-fade-in" id="room-service-tab">
      
      {/* Toast alert & processing logs feedback banner */}
      {paymentMessage && (
        <div className="p-3 bg-[#c19a6b]/10 border border-[#c19a6b]/30 rounded-2xl text-[#7c5a30] font-mono text-xs flex items-center justify-between shadow-lg relative overflow-hidden animation-pulse">
          <span className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#c19a6b]" />
            {paymentMessage}
          </span>
        </div>
      )}

      {toastMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/35 rounded-2xl text-emerald-300 font-mono text-xs flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control tower block wrapper */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-slate-900/40 border border-slate-800 shadow-xl space-y-6">
        
        {/* Header Block in Golden accents & Velvet slate */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-2xl font-serif-luxury font-bold text-slate-100 flex items-center gap-2 tracking-tight">
              <Utensils className="w-6 h-6 text-[#c19a6b]" /> {t.title}
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">{t.subtitle}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="flex items-center gap-1 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition shadow-lg hover:shadow-gold-500/10 active:scale-95 duration-150 cursor-pointer border border-gold-300/20"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              {t.newOrderBtn}
            </button>
            <span className="text-[10px] font-mono text-gold-300 bg-gold-500/10 px-3 py-2.5 rounded-xl border border-gold-500/20 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              {combinedOrders.length} {t.vipPlacements}
            </span>
          </div>
        </div>

        {/* Operational counters stats display row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5 shadow-inner">
          <div className="space-y-1 border-r border-white/5">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1">
              🍳 {t.stagePrep}
            </span>
            <p className="text-xl font-serif-luxury font-bold text-slate-200">
              {prepCount} <span className="text-[10px] font-mono text-slate-500 font-normal">active</span>
            </p>
          </div>
          <div className="space-y-1 border-r border-white/5 pl-4">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1">
              🚀 {t.stageQuality}
            </span>
            <p className="text-xl font-serif-luxury font-bold text-amber-400">
              {qualityCount} <span className="text-[10px] font-mono text-slate-500 font-normal font-bold">verified</span>
            </p>
          </div>
          <div className="space-y-1 border-r border-white/5 pl-4">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1">
              🚚 {t.stageDelivery}
            </span>
            <p className="text-xl font-serif-luxury font-bold text-sky-400">
              {deliveryCount} <span className="text-[10px] font-mono text-slate-500 font-normal">transit</span>
            </p>
          </div>
          <div className="space-y-1 pl-4">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1">
              📦 {t.stageDelivered}
            </span>
            <p className="text-xl font-serif-luxury font-bold text-emerald-400">
              {deliveredCount} <span className="text-[10px] font-mono text-slate-500 font-normal">arrived</span>
            </p>
          </div>
        </div>

        {/* Dynamic Controls, Sorting & Filters bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-950/20 p-4 rounded-2xl border border-white/5 shadow-sm">
          
          {/* Left Block: Search & Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-700/60 bg-slate-900/60 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#c19a6b] transition-all"
              />
            </div>

            {/* Quick Status Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['All', 'Preparation', 'Quality Check', 'Out for Delivery', 'Delivered'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-medium transition cursor-pointer border ${
                    statusFilter === st 
                      ? 'bg-[#c19a6b]/20 border-[#c19a6b]/50 text-[#c19a6b] font-bold' 
                      : 'bg-transparent border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'All' ? t.statusAll : st === 'Preparation' ? t.stagePrep : st === 'Quality Check' ? t.stageQuality : st === 'Out for Delivery' ? t.stageDelivery : t.stageDelivered}
                </button>
              ))}
            </div>
          </div>

          {/* Right Block: Sorter & View Toggle */}
          <div className="flex flex-wrap items-center gap-3 justify-end">
            
            {/* Sorting alignment selector */}
            <div className="flex items-center gap-2 border border-slate-800 bg-slate-950/60 rounded-xl px-2.5 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs font-mono text-slate-300 focus:outline-none font-medium cursor-pointer"
              >
                <option value="status" className="bg-slate-900">📋 {t.sortStatus}</option>
                <option value="room" className="bg-slate-900">Suite: {t.sortRoom}</option>
                <option value="guest" className="bg-slate-900">Guest: {t.sortGuest}</option>
                <option value="id" className="bg-slate-900">ID: {t.sortId}</option>
                <option value="manual" className="bg-slate-900">🎯 {t.sortManual}</option>
              </select>

              {/* Ascending toggle */}
              <button
                onClick={() => setIsAsc(!isAsc)}
                title={isAsc ? t.desc : t.asc}
                className="p-1 hover:bg-slate-800 rounded transition text-slate-400 border border-slate-800 cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />
              </button>
            </div>

            {/* View Mode segmented control */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'kanban' 
                    ? 'bg-slate-800 text-[#c19a6b] shadow-md' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title={t.viewKanban}
              >
                <Kanban className="w-3.5 h-3.5 text-[#c19a6b]" />
                <span className="hidden sm:inline">{t.viewKanban}</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-slate-800 text-[#c19a6b] shadow-md' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title={t.viewGrid}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#c19a6b]" />
                <span className="hidden sm:inline">{t.viewGrid}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Kanban Board Layout Mode */}
        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {(['Preparation', 'Quality Check', 'Out for Delivery', 'Delivered'] as const).map((stage) => {
              const itemsInStage = combinedOrders.filter(o => o.status === stage && (
                o.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.details.toLowerCase().includes(searchTerm.toLowerCase())
              ));

              // Internal sorting within columns
              if (sortBy === 'manual') {
                itemsInStage.sort((a, b) => {
                  const idxA = manualOrderIds.indexOf(a.id);
                  const idxB = manualOrderIds.indexOf(b.id);
                  const posA = idxA === -1 ? 999 : idxA;
                  const posB = idxB === -1 ? 999 : idxB;
                  return (posA - posB) * (isAsc ? 1 : -1);
                });
              } else if (sortBy === 'room') {
                itemsInStage.sort((a, b) => a.room.localeCompare(b.room) * (isAsc ? 1 : -1));
              } else if (sortBy === 'guest') {
                itemsInStage.sort((a, b) => a.guest.localeCompare(b.guest) * (isAsc ? 1 : -1));
              } else {
                itemsInStage.sort((a, b) => a.id.localeCompare(b.id) * (isAsc ? 1 : -1));
              }

              const isPrep = stage === 'Preparation';
              const isQuality = stage === 'Quality Check';
              const isDelivery = stage === 'Out for Delivery';
              const indicatorClasses = isPrep 
                ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                : isQuality 
                  ? 'border-yellow-500/20 bg-yellow-400/10 text-yellow-300'
                  : isDelivery 
                    ? 'border-sky-500/20 bg-sky-500/10 text-sky-300'
                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';

              return (
                <div key={stage} className="flex flex-col gap-3 p-4 bg-slate-950/30 border border-white/5 rounded-2xl shadow-inner min-h-[420px]">
                  
                  {/* Column Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5 font-sans font-bold text-xs text-slate-200">
                      <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono ${indicatorClasses}`}>
                        {isPrep ? '🍳' : isQuality ? '🔬' : isDelivery ? '🚚' : '📦'}
                      </span>
                      {stage === 'Preparation' ? t.stagePrep : stage === 'Quality Check' ? t.stageQuality : stage === 'Out for Delivery' ? t.stageDelivery : t.stageDelivered}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold bg-white/5 px-2 py-0.5 rounded-full">
                      {itemsInStage.length}
                    </span>
                  </div>

                  {/* Column Content Items */}
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[580px] pr-1">
                    {itemsInStage.length === 0 ? (
                      <div className="min-h-[100px] flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-800 rounded-xl text-center text-[10px] font-mono text-slate-500 bg-white/5">
                        <HelpCircle className="w-4 h-4 text-slate-600 mb-1" />
                        <span>{t.noOrdersInStage}</span>
                      </div>
                    ) : (
                      itemsInStage.map((order) => {
                        const linkedInv = invoices.find(inv => inv.orderId === order.id);
                        const isCurrentActive = currentInvoice.orderId === order.id;

                        return (
                          <div 
                            key={order.id}
                            onClick={() => handleSelectInvoiceByOrderId(order.id, order)}
                            className={`group border rounded-xl overflow-hidden shadow-md flex flex-col justify-between hover:border-gold-500/60 transition-all duration-300 bg-slate-900 border-slate-800/80 cursor-pointer relative ${
                              isCurrentActive ? 'border-gold-500/80 ring-1 ring-gold-500/20 bg-slate-850' : ''
                            }`}
                          >
                            {/* SVG Culinary illustration */}
                            <div className="h-28 w-full relative overflow-hidden">
                              <CulinaryVectorSVG orderId={order.id} />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-95" />
                              <span className="absolute top-2 left-2 bg-slate-950/90 backdrop-blur-md text-slate-300 text-[9px] font-mono px-2 py-0.5 rounded border border-white/5 shadow-md">
                                {order.room}
                              </span>

                              {/* Order prioritization controls overlay */}
                              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-950/95 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-lg z-15">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); moveOrder(order.id, 'up'); }}
                                  className="p-1 hover:bg-slate-800 text-slate-300 hover:text-gold-400 rounded transition cursor-pointer"
                                  title={t.movePrioritize}
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); moveOrder(order.id, 'down'); }}
                                  className="p-1 hover:bg-slate-800 text-slate-300 hover:text-gold-400 rounded transition cursor-pointer"
                                  title={t.moveDeprioritize}
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Info Body */}
                            <div className="p-3 space-y-2">
                              <div>
                                <p className="text-[9px] font-semibold text-gold-300/80 font-mono tracking-wide">Guest: {order.guest}</p>
                                <p className="text-xs font-bold text-slate-100 leading-tight mt-0.5 line-clamp-2">{order.details}</p>
                              </div>

                              {linkedInv && (
                                <div className="text-[9px] font-mono flex items-center justify-between bg-slate-950/40 p-1.5 rounded border border-white/5">
                                  <span className="text-slate-500">{t.linkedInvoice}:</span>
                                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                                    linkedInv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                  }`}>
                                    {linkedInv.status === 'PAID' ? t.invoicePaid : t.invoicePending}
                                  </span>
                                </div>
                              )}

                              {/* Progress trigger */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                                <span className="text-[9px] text-emerald-400 font-mono font-medium flex items-center gap-0.5">
                                  <CheckCircle className="w-3 h-3 text-emerald-500" /> {t.authenticated}
                                </span>
                                
                                {order.status !== 'Delivered' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAdvanceStatus(order.id);
                                    }}
                                    className="text-[9px] bg-slate-850 hover:bg-gold-500 hover:text-slate-950 text-gold-300 border border-slate-800 font-mono font-bold px-2 py-1 rounded transition-all flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <span>{t.advanceStatus}</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Tactical grid Layout Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedOrders.map((order) => {
              const linkedInv = invoices.find(inv => inv.orderId === order.id);
              const isCurrentActive = currentInvoice.orderId === order.id;

              return (
                <div 
                  key={order.id} 
                  onClick={() => handleSelectInvoiceByOrderId(order.id, order)}
                  className={`group border rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-gold-500/80 transition-all duration-300 cursor-pointer bg-slate-900 border-slate-800 ${
                    isCurrentActive ? 'border-gold-500 ring-1 ring-gold-500/20' : ''
                  }`}
                >
                  <div className="h-44 w-full relative overflow-hidden">
                    <CulinaryVectorSVG orderId={order.id} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-95" />
                    
                    <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-gold-300 text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-xl border border-gold-500/20 shadow-md">
                      {order.room}
                    </span>

                    {/* Order prioritization controls */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-lg z-15">
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveOrder(order.id, 'up'); }}
                        className="p-1 hover:bg-slate-800 text-slate-300 hover:text-gold-400 rounded transition cursor-pointer"
                        title={t.movePrioritize}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveOrder(order.id, 'down'); }}
                        className="p-1 hover:bg-slate-800 text-slate-300 hover:text-gold-400 rounded transition cursor-pointer"
                        title={t.moveDeprioritize}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="absolute bottom-3 left-4 right-4 z-10">
                      <p className="text-xs font-semibold text-gold-400 font-mono">Guest: {order.guest}</p>
                      <p className="text-sm font-bold text-slate-100 mt-0.5 truncate">{order.details}</p>
                    </div>
                  </div>

                  {/* Culinary milestone sliders */}
                  <div className="p-4 space-y-4 bg-slate-950/40">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">{t.preparationStage}</span>
                      
                      {/* Interactive Milestones timeline */}
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 py-1">
                        <span className={`${order.status === 'Preparation' ? 'text-gold-400 font-bold' : 'text-slate-500'}`}>Prep</span>
                        <span className="h-[1px] flex-1 bg-white/5 mx-1 border-dashed" />
                        <span className={`${order.status === 'Quality Check' ? 'text-yellow-400 font-bold' : 'text-slate-500'}`}>Quality</span>
                        <span className="h-[1px] flex-1 bg-white/5 mx-1 border-dashed" />
                        <span className={`${order.status === 'Out for Delivery' ? 'text-sky-400 font-bold' : 'text-slate-500'}`}>Transit</span>
                        <span className="h-[1px] flex-1 bg-white/5 mx-1 border-dashed" />
                        <span className={`${order.status === 'Delivered' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>Delivered</span>
                      </div>

                      {/* Level progress bar */}
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${
                          order.status === 'Preparation' ? 'w-1/4 bg-gold-500' :
                          order.status === 'Quality Check' ? 'w-2/4 bg-yellow-400' : 
                          order.status === 'Out for Delivery' ? 'w-3/4 bg-sky-400' : 'w-full bg-emerald-500'
                        }`} />
                      </div>
                    </div>

                    {linkedInv && (
                      <div className="text-[10px] font-mono text-slate-400 flex justify-between items-center py-1.5 bg-slate-950 px-2 rounded-lg border border-white/5">
                        <span>{t.linkedInvoice}:</span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>{linkedInv.id}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                            linkedInv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-[#c19a6b] border border-amber-500/20'
                          }`}>
                            {linkedInv.status === 'PAID' ? t.invoicePaid : t.invoicePending}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Dispatch controls list */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                      <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> {t.authenticated}
                      </span>
                      
                      {order.status !== 'Delivered' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdvanceStatus(order.id);
                          }}
                          className="text-xs bg-slate-900 hover:bg-gold-50 hover:text-slate-950 text-gold-300 border border-slate-800 font-mono font-bold px-3 py-1.5 rounded-xl transition-all shadow flex items-center gap-1 cursor-pointer"
                        >
                          <span>{t.advanceStatus}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Luxury Invoicing and Stripe Payment section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="billing-payment-hub">
        
        {/* Left slot: Printable Invoice docket */}
        <section className="lg:col-span-7 glass-panel rounded-3xl p-6 bg-slate-900/40 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif-luxury text-slate-100 font-bold mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#c19a6b]" /> {t.invoiceTitle}
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-sans leading-relaxed">{t.invoiceSubtitle}</p>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-xs font-mono text-slate-300 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#c19a6b]/15 px-3 py-1 border-b border-l border-[#c19a6b]/30 rounded-bl text-[9px] font-bold text-[#c19a6b] uppercase tracking-wider">
                {currentInvoice.status}
              </div>

              <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-start">
                <div>
                  <h4 className="font-serif-luxury font-bold text-slate-200 text-sm tracking-wide">ZAFIR HOTELS & RESORTS</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Sovereign Luxury Operational Hub</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#c19a6b] leading-tight text-sm">{currentInvoice.id}</p>
                  <p className="text-[8px] text-slate-500 mt-1">ISSUED DATE: 2026-06-20</p>
                </div>
              </div>

              <div className="space-y-1 pb-4 border-b border-slate-800 mb-4 text-[10px] text-slate-400 leading-normal">
                <p><span className="text-slate-500 uppercase tracking-widest text-[8px] block sm:inline">Suite Reference:</span> <strong className="text-slate-200 font-sans ml-1">{currentInvoice.room}</strong></p>
                <p><span className="text-slate-500 uppercase tracking-widest text-[8px] block sm:inline font-bold">Bill to Sovereign:</span> <strong className="text-slate-200 font-sans ml-1">{currentInvoice.guest}</strong></p>
                <p><span className="text-slate-500 uppercase tracking-widest text-[8px] block sm:inline">Transaction Sign:</span> <strong className="text-[#c19a6b]">OK_SECURE_ELEMENT_COMPLIANT</strong></p>
              </div>

              <div className="space-y-2 mb-6">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">{t.itemizedRoomPlacements}</span>
                <div className="flex justify-between border-b border-slate-900 pb-2 text-[11px]">
                  <span className="text-slate-300">{currentInvoice.details}</span>
                  <span className="font-bold text-slate-100">${currentInvoice.baseAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2 text-slate-400 text-[10px]">
                  <span>{t.vat}</span>
                  <span>${currentInvoice.vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2 text-slate-400 text-[10px]">
                  <span>{t.surcharge}</span>
                  <span>${currentInvoice.serviceCharge.toFixed(2)}</span>
                </div>

                {currentInvoice.refundAmount && (
                  <div className="flex justify-between text-red-400 border-b border-red-950 pb-2 font-bold text-[10px]">
                    <span>Refund Deduction Credit</span>
                    <span>-${currentInvoice.refundAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-xs border-t border-slate-850 pt-4 font-bold text-slate-100">
                <span>{t.totalDue}</span>
                <span className="text-lg text-[#c19a6b]">${currentInvoice.total.toFixed(2)}</span>
              </div>

              {currentInvoice.status === 'REFUNDED' && currentInvoice.refundReason && (
                <div className="mt-4 p-3 bg-red-950/20 text-red-300 rounded-xl border border-red-500/20 text-[10px] leading-relaxed">
                  <strong>⚠ COMPLAINT REFUND DIRECTIVE ISSUED:</strong> {currentInvoice.refundReason}
                </div>
              )}
            </div>
          </div>

          {/* Refund issuance trigger */}
          {currentInvoice.status === 'PAID' && (
            <div className="pt-6 border-t border-slate-800 mt-6 flex justify-start animate-fade-in">
              <button 
                onClick={() => setShowRefundPrompt(true)}
                className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 font-mono cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{t.refundButton}</span>
              </button>
            </div>
          )}

          {/* Refund prompt drawer dialog */}
          {showRefundPrompt && (
            <div className="bg-slate-950/60 border border-red-500/20 rounded-2xl p-4 mt-4 space-y-4 animate-fade-in text-xs font-mono text-slate-300 shadow-lg">
              <h4 className="font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                {t.refundActionModal}
              </h4>
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider font-sans">{t.refundReasonLabel}</label>
                  <input 
                    type="text" 
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="p-2 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:outline-none focus:border-red-500/60 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider font-sans">{t.refundAmountLabel}</label>
                  <input 
                    type="number" 
                    value={refundValue}
                    onChange={(e) => setRefundValue(Number(e.target.value))}
                    max={currentInvoice.total}
                    className="p-2 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:outline-none focus:border-red-500/60 text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleIssueRefund} 
                  className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 text-[10px] font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  {t.confirmRefund}
                </button>
                <button 
                  onClick={() => setShowRefundPrompt(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 text-[10px] font-bold px-4 py-2 rounded-xl transition cursor-pointer border border-slate-800"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}

        </section>

        {/* Right slot: Credit Card Sandbox elements terminal */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-3xl p-6 bg-slate-900/40 border border-slate-800 shadow-xl space-y-4">
            
            <div className="border-b border-white/5 pb-2">
              <h4 className="text-xs font-mono font-bold text-gold-300 uppercase tracking-widest flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#c19a6b]" /> {t.checkoutTerminal}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{t.checkoutSubtitle}</p>
            </div>

            {/* Pay method selector tabs */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <button 
                onClick={() => setPayMethod('CARD')}
                className={`py-2 text-[9px] font-mono font-bold uppercase border rounded-xl transition-all cursor-pointer ${
                  payMethod === 'CARD' ? 'border-[#c19a6b] bg-[#c19a6b]/10 text-[#c19a6b] font-bold' : 'border-slate-800 bg-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                Card
              </button>
              <button 
                onClick={() => setPayMethod('BANK_TRANSFER')}
                className={`py-2 text-[9px] font-mono font-bold uppercase border rounded-xl transition-all cursor-pointer ${
                  payMethod === 'BANK_TRANSFER' ? 'border-[#c19a6b] bg-[#c19a6b]/10 text-[#c19a6b] font-bold' : 'border-slate-800 bg-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                SWIFT Wire
              </button>
              <button 
                onClick={() => setPayMethod('CASH')}
                className={`py-2 text-[9px] font-mono font-bold uppercase border rounded-xl transition-all cursor-pointer ${
                  payMethod === 'CASH' ? 'border-[#c19a6b] bg-[#c19a6b]/10 text-[#c19a6b] font-bold' : 'border-slate-800 bg-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                Cash
              </button>
            </div>

            {payMethod === 'CARD' ? (
              <form onSubmit={handleStripeChargeSubmit} className="space-y-3 pt-1">
                
                {/* Simulated Glass Credit Card design */}
                <div className="bg-gradient-to-tr from-stone-900 to-slate-850 border border-slate-750 rounded-2xl p-5 text-white font-mono shadow-xl relative overflow-hidden h-36 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-[#c19a6b] font-bold uppercase tracking-widest">Sovereign Token Card</span>
                    <Shield className="w-5 h-5 text-gold-400" />
                  </div>
                  
                  <div className="text-xs sm:text-sm font-semibold tracking-widest text-[#FFF3DE]">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-end text-[8px] uppercase text-slate-400 leading-tight">
                    <div>
                      <span className="text-[6px] text-slate-500 block">Cardholder</span>
                      <span className="text-slate-200">{cardName || 'GUEST SOVEREIGN'}</span>
                    </div>
                    <div>
                      <span className="text-[6px] text-slate-500 block">Expires</span>
                      <span className="text-slate-200">{cardExpiry}</span>
                    </div>
                    <div>
                      <span className="text-[6px] text-slate-500 block">CVC</span>
                      <span className="text-slate-200">{cardCvc || '•••'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">{t.cardholderName}</label>
                    <input 
                      type="text" 
                      value={cardName} 
                      onChange={(e) => setCardName(e.target.value.toUpperCase())} 
                      required 
                      className="p-2 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:outline-none focus:border-[#c19a6b] text-xs font-mono" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">{t.cardNumber}</label>
                      <input 
                        type="text" 
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(e.target.value)} 
                        required 
                        className="p-2 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:outline-none focus:border-[#c19a6b] text-xs font-mono" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">CVV</label>
                      <input 
                        type="password" 
                        value={cardCvc} 
                        onChange={(e) => setCardCvc(e.target.value)} 
                        required 
                        maxLength={3} 
                        className="p-2 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:outline-none focus:border-[#c19a6b] text-xs font-mono" 
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={currentInvoice.status === 'PAID' || isProcessingPayment}
                  className={`w-full py-2.5 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 border shadow-lg cursor-pointer ${
                    currentInvoice.status === 'PAID' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-not-allowed'
                      : 'bg-[#c19a6b] border-[#c19a6b] hover:bg-[#a67d4e] hover:border-[#a67d4e] text-slate-950 active:scale-95 duration-150'
                  }`}
                >
                  {isProcessingPayment ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : <CreditCard className="w-4 h-4 text-slate-950" />}
                  <span>
                    {currentInvoice.status === 'PAID' ? '✓ Paid and Settled' : t.authorizeCharge}
                  </span>
                </button>

              </form>
            ) : (
              <div className="py-6 text-center space-y-4 animate-fade-in font-mono text-xs">
                <span className="w-12 h-12 rounded-full bg-[#c19a6b]/20 flex items-center justify-center mx-auto text-[#c19a6b]">
                  {payMethod === 'CASH' ? <Landmark className="w-6 h-6 text-[#c19a6b]" /> : <Landmark className="w-6 h-6 text-[#c19a6b] animate-pulse" />}
                </span>
                <div>
                  <p className="font-semibold text-slate-200">
                    {payMethod === 'CASH' ? 'Awaiting Escrow Allocation Release' : 'Awaiting SWIFT Wire Routing'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal max-w-xs mx-auto">
                    Manually confirm offline payment and trigger dispatch releasing funds onto certified ledgers instantly.
                  </p>
                </div>
                
                <button 
                  type="button"
                  onClick={() => {
                    setInvoices(prev => prev.map(inv => {
                      if (inv.id === activeInvId) {
                        return { ...inv, status: 'PAID' };
                      }
                      return inv;
                    }));
                    if (addAuditLog) {
                      addAuditLog('OFFLINE_BILLING_SETTLED', `Received offline currency settlement for ${currentInvoice.id}. Value: $${currentInvoice.total.toFixed(2)}.`, 'AUTHORIZED');
                    }
                    confetti({ particleCount: 20 });
                  }}
                  className="px-4 py-2.5 bg-[#c19a6b] hover:bg-[#a67d4e] text-slate-950 font-bold rounded-xl transition cursor-pointer text-xs"
                >
                  Confirm Escrow Release
                </button>
              </div>
            )}

            {/* Visual credential footer */}
            <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[8px] font-mono text-slate-500">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-[#c19a6b]" /> SECURE ELEMENTS ENDPOINT ACTIVE</span>
              <span>STRIPE_ELEMENTS_v4_SANDBOX</span>
            </div>

          </div>
        </div>

      </div>

      {/* Creation Modal for a new order placement popup */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <header className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-[#c19a6b]" /> {t.newOrderBtn}
              </h3>
              <button 
                onClick={() => setShowNewOrderModal(false)}
                className="text-slate-400 hover:text-slate-200 transition bg-slate-950 p-1.5 rounded-lg border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            {formError && (
              <div className="p-2.5 bg-red-500/15 border border-red-500/30 text-red-300 text-[10px] rounded-lg font-mono">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-sans">{t.guestNameLabel}</label>
                <input 
                  type="text"
                  placeholder="e.g. Mr. Chen, Ms. Al-Fayed"
                  value={formGuest}
                  onChange={(e) => setFormGuest(e.target.value)}
                  className="w-full p-2.5 border border-slate-800 bg-slate-950 text-slate-100 rounded-xl focus:outline-none focus:border-[#c19a6b] font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase font-sans">{t.suiteLabel}</label>
                  <select 
                    value={formSuite}
                    onChange={(e) => setFormSuite(e.target.value)}
                    className="w-full p-2.5 border border-slate-800 bg-slate-950 text-slate-100 rounded-xl focus:outline-none font-mono text-xs cursor-pointer"
                  >
                    <option value="Suite 201" className="bg-slate-900">Suite 201</option>
                    <option value="Suite 202" className="bg-slate-900">Suite 202</option>
                    <option value="Suite 203" className="bg-slate-900">Suite 203</option>
                    <option value="Suite 304" className="bg-slate-900">Suite 304</option>
                    <option value="Villa 1" className="bg-slate-900">Villa 1</option>
                    <option value="Villa 2" className="bg-slate-900 font-sans">Villa 2</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase font-sans">{t.priceLabel}</label>
                  <input 
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-800 bg-slate-950 text-slate-100 rounded-xl focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-sans">{t.detailsLabel}</label>
                <textarea 
                  rows={2}
                  placeholder="Insert premium ingredients or oenology reference specifications..."
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  className="w-full p-2.5 border border-slate-800 bg-slate-950 text-slate-100 rounded-xl focus:outline-none focus:border-[#c19a6b] font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-sans">{t.statusLabel}</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setFormStatus('Preparation')}
                    className={`flex-1 py-2 text-[10px] border font-mono font-bold uppercase rounded-xl cursor-pointer ${
                      formStatus === 'Preparation' ? 'border-[#c19a6b] bg-[#c19a6b]/10 text-[#c19a6b]' : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    🍳 Preparation
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormStatus('Quality Check')}
                    className={`flex-1 py-2 text-[10px] border font-mono font-bold uppercase rounded-xl cursor-pointer ${
                      formStatus === 'Quality Check' ? 'border-[#c19a6b] bg-[#c19a6b]/10 text-[#c19a6b]' : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    🔬 Quality Check
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/5">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 font-bold rounded-xl shadow-lg transition-all hover:opacity-90 active:scale-95 text-xs font-sans uppercase tracking-wider cursor-pointer"
                >
                  Confirm Placement
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="flex-1 py-2.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold rounded-xl transition text-xs font-sans uppercase tracking-wider cursor-pointer"
                >
                  {t.closeBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
