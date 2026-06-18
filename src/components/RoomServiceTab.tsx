import React from 'react';
import { Utensils, CheckCircle, ChevronRight } from 'lucide-react';
import { RoomServiceOrder } from '../types';

interface RoomServiceTabProps {
  roomOrders: RoomServiceOrder[];
  advanceOrderStatus: (id: string) => void;
}

// Custom vector culinary illustration renderer based on order ID
export const CulinaryVectorSVG: React.FC<{ orderId: string }> = ({ orderId }) => {
  switch (orderId) {
    case 'order-1': // Gourmet Breakfast Platter
      return (
        <svg viewBox="0 0 300 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="eggYolk" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
            <linearGradient id="plateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
          </defs>
          {/* Warm Sand Tablecloth */}
          <rect width="300" height="180" fill="#fcf6ec" />
          <circle cx="150" cy="180" r="140" fill="none" stroke="#e8dcc4" strokeWidth="1" strokeDasharray="5,4" />
          
          {/* Ceramic Rimmed Plate */}
          <circle cx="150" cy="90" r="70" fill="url(#plateGrad)" stroke="#c19a6b" strokeWidth="2" />
          <circle cx="150" cy="90" r="55" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
          
          {/* Fried Eggs */}
          <circle cx="125" cy="85" r="16" fill="#ffffff" />
          <circle cx="125" cy="85" r="7" fill="url(#eggYolk)" />
          
          <circle cx="155" cy="100" r="18" fill="#ffffff" />
          <circle cx="155" cy="100" r="8" fill="url(#eggYolk)" />
          
          {/* Crispy Bacon Strips */}
          <path d="M100,105 Q115,95 130,110 T160,100" stroke="#9a3412" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M105,112 Q120,102 135,117 T165,107" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" fill="none" />
          
          {/* Cherry Tomatoes */}
          <circle cx="178" cy="74" r="7" fill="#dc2626" />
          <circle cx="178" cy="74" r="2" fill="#fca5a5" />
          <circle cx="188" cy="83" r="6" fill="#b91c1c" />

          {/* Golden Toast Triangles */}
          <polygon points="85,60 115,60 100,90" fill="#f59e0b" stroke="#bc6c25" strokeWidth="1" />
          <polygon points="80,55 110,55 95,85" fill="#fcd34d" opacity="0.9" />

          {/* Fresh Parsley Leaf Garnish */}
          <path d="M 135,75 Q138,70 134,68" stroke="#16a34a" strokeWidth="2.5" fill="none" />
          <path d="M 160,82 Q163,77 159,75" stroke="#15803d" strokeWidth="2" fill="none" />
        </svg>
      );

    case 'order-2': // Chef Selection Sushi
      return (
        <svg viewBox="0 0 300 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="salmonColor" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
            <linearGradient id="tunaColor" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
          {/* Dark Stone Countertop */}
          <rect width="300" height="180" fill="#1e2530" />
          
          {/* Lacquered Wooden Sushi Board */}
          <rect x="50" y="35" width="200" height="110" rx="6" fill="#2d3748" stroke="#4a5568" strokeWidth="2" />
          <rect x="55" y="40" width="190" height="100" rx="3" fill="#0f172a" />
          
          {/* Salmon Nigiri (Sushi 1) */}
          <g transform="translate(70, 75)">
            <rect x="0" y="8" width="38" height="16" rx="6" fill="#f8fafc" />
            <rect x="-2" y="0" width="42" height="13" rx="4" fill="url(#salmonColor)" />
            <line x1="5" y1="3" x2="35" y2="10" stroke="#fee2e2" strokeWidth="1" opacity="0.6" strokeLinecap="round" />
            <line x1="10" y1="1" x2="38" y2="7" stroke="#fee2e2" strokeWidth="0.8" opacity="0.6" strokeLinecap="round" />
          </g>

          {/* Tuna Nigiri (Sushi 2) */}
          <g transform="translate(130, 75)">
            <rect x="0" y="8" width="38" height="16" rx="6" fill="#f8fafc" />
            <rect x="-2" y="0" width="42" height="13" rx="4" fill="url(#tunaColor)" />
            <line x1="5" y1="3" x2="35" y2="10" stroke="#fca5a5" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
          </g>

          {/* Maki Roll (Sushi 3) */}
          <g transform="translate(195, 80)">
            <circle cx="15" cy="10" r="14" fill="#065f46" />
            <circle cx="15" cy="10" r="11" fill="#f8fafc" />
            <circle cx="15" cy="10" r="5" fill="#f97316" />
            <circle cx="12" cy="11" r="3.5" fill="#22c55e" />
          </g>

          {/* Dollop of Wasabi & Pickled Ginger */}
          <circle cx="215" cy="56" r="8" fill="#84cc16" opacity="0.9" />
          <path d="M 68,52 Q 78,48 70,44 T 78,40" fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" />

          {/* Chopsticks */}
          <line x1="80" y1="125" x2="225" y2="110" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="80" y1="131" x2="225" y2="116" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'order-3': // Premium Ribeye Steak
      return (
        <svg viewBox="0 0 300 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="steakColor" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="50%" stopColor="#292524" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
          </defs>
          {/* Dark Walnut wood table */}
          <rect width="300" height="180" fill="#2e2724" />
          
          {/* Cast Iron Skillet Plate */}
          <circle cx="150" cy="90" r="76" fill="#292524" stroke="#44403c" strokeWidth="2" />
          <circle cx="150" cy="90" r="70" fill="#0f172a" />
          
          {/* Wooden Skillet Support */}
          <path d="M 68,90 A82,82 0 0,1 232,90 L 220,135 H 80 Z" fill="#854d0e" opacity="0.8" />

          {/* Grilled Angus Steak */}
          <path d="M102,96 C105,72 135,62 170,72 C205,82 210,102 195,116 C180,130 115,124 102,96 Z" fill="url(#steakColor)" stroke="#78350f" strokeWidth="1" />
          
          {/* Grate Sear Marks */}
          <line x1="120" y1="80" x2="178" y2="114" stroke="#000" strokeWidth="2" opacity="0.7" />
          <line x1="135" y1="75" x2="190" y2="108" stroke="#000" strokeWidth="2" opacity="0.7" />
          <line x1="110" y1="92" x2="160" y2="124" stroke="#000" strokeWidth="2" opacity="0.7" />

          {/* Melted Butter */}
          <rect x="145" y="85" width="10" height="10" transform="rotate(18 145 85)" fill="#eab308" />
          <circle cx="150" cy="91" r="9" fill="#eab308" opacity="0.3" />

          {/* Rosemary sprig */}
          <path d="M 160,112 Q185,118 200,98" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <line x1="170" y1="113" x2="168" y2="118" stroke="#15803d" strokeWidth="1.5" />
          <line x1="180" y1="114" x2="182" y2="108" stroke="#15803d" strokeWidth="1.5" />
          <line x1="190" y1="112" x2="194" y2="116" stroke="#15803d" strokeWidth="1.5" />

          {/* Crispy French Fries pile */}
          <rect x="90" y="52" width="28" height="5" transform="rotate(10 90 52)" fill="#f59e0b" />
          <rect x="100" y="46" width="34" height="4.5" transform="rotate(-15 100 46)" fill="#fbbf24" />
          <rect x="85" y="62" width="25" height="5.2" transform="rotate(40 85 62)" fill="#f59e0b" />
          <rect x="74" y="50" width="30" height="4.8" transform="rotate(-5 74 50)" fill="#fbbf24" />
        </svg>
      );

    case 'order-4': // Gourmet Pancakes & Espresso
      return (
        <svg viewBox="0 0 300 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="pancakeGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="syrupPool" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>
          {/* Sky-blue tablecloth */}
          <rect width="300" height="180" fill="#f4f9ff" />
          
          {/* Ceramic White Plate */}
          <circle cx="130" cy="95" r="66" fill="#ffffff" stroke="#c19a6b" strokeWidth="1.5" />
          <circle cx="130" cy="95" r="54" fill="#fafaf9" />

          {/* Stack of three golden pancakes */}
          <ellipse cx="130" cy="115" rx="44" ry="14" fill="url(#pancakeGlow)" />
          <ellipse cx="130" cy="114" rx="44" ry="14" fill="none" stroke="#78350f" strokeWidth="0.5" />

          <ellipse cx="130" cy="100" rx="42" ry="13.5" fill="url(#pancakeGlow)" />
          <ellipse cx="130" cy="99" rx="42" ry="13.5" fill="none" stroke="#78350f" strokeWidth="0.5" />

          <ellipse cx="130" cy="85" rx="38" ry="12.5" fill="url(#pancakeGlow)" />
          <ellipse cx="130" cy="84" rx="38" ry="12.5" fill="none" stroke="#78350f" strokeWidth="0.5" />

          {/* Syrup drip */}
          <path d="M110,84 C112,88 128,88 132,94 C134,97 142,91 146,85 C148,82 144,82 142,84 Z" fill="url(#syrupPool)" />
          
          {/* Butter Pad */}
          <rect x="122" y="75" width="14" height="10" fill="#fde047" stroke="#ca8a04" strokeWidth="0.5" transform="rotate(22 122 75)" />

          {/* Cup of Rich Espresso */}
          <circle cx="230" cy="85" r="24" fill="#fafaf9" stroke="#e2e8f0" strokeWidth="1" />
          <circle cx="230" cy="85" r="18" fill="#451a03" />
          <circle cx="230" cy="85" r="16" fill="none" stroke="#ca8a04" strokeWidth="1.5" opacity="0.4" />
          
          {/* Handle */}
          <path d="M250,75 C264,75 264,95 250,95" stroke="#fafaf9" strokeWidth="3.5" fill="none" />
        </svg>
      );

    case 'order-5': // Gold-Leaf Wagyu Burger
      return (
        <svg viewBox="0 0 300 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="goldLeaf" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          {/* Classic luxury slate background */}
          <rect width="300" height="180" fill="#1e2430" />
          
          {/* Golden Rimmed Black plate */}
          <circle cx="150" cy="90" r="72" fill="#2d3748" stroke="url(#goldLeaf)" strokeWidth="2.5" />
          <circle cx="150" cy="90" r="62" fill="#0f172a" />

          {/* Bottom Bun */}
          <path d="M 112,112 C112,126 188,126 188,112 Z" fill="#ca8a04" />

          {/* Wagyu Meat Patty */}
          <rect x="106" y="99" width="88" height="14" rx="4" fill="#3f2305" stroke="#291502" strokeWidth="1" />

          {/* Melted Cheddar Layers */}
          <path d="M108,102 Q150,116 192,102 L185,108 L115,108 Z" fill="#f59e0b" />

          {/* Gold Leaf Flakes garnish overlay */}
          <path d="M142,92 L146,88 L152,94 L148,96 Z" fill="url(#goldLeaf)" />
          <path d="M125,102 L131,99 L132,104 L127,105 Z" fill="url(#goldLeaf)" />
          <path d="M168,101 L173,103 L171,98 L166,99 Z" fill="url(#goldLeaf)" />

          {/* Crisp Lettuce & Tomato slice */}
          <rect x="110" y="92" width="80" height="4.5" rx="2" fill="#16a34a" />
          <rect x="114" y="87" width="72" height="5" rx="1" fill="#dc2626" />

          {/* Shiny Top Seeded Bun */}
          <path d="M 112,85 C112,50 188,50 188,85 Z" fill="#d97706" />

          {/* Sesame seeds */}
          <circle cx="132" cy="65" r="1.5" fill="#fef08a" />
          <circle cx="150" cy="58" r="1.5" fill="#fef08a" />
          <circle cx="168" cy="65" r="1.5" fill="#fef08a" />
          <circle cx="142" cy="71" r="1.5" fill="#fef08a" />
          <circle cx="158" cy="71" r="1.5" fill="#fef08a" />
        </svg>
      );

    case 'order-6': // Fettuccine Vongole Clam Pasta
      return (
        <svg viewBox="0 0 300 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="clamShell" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          <rect width="300" height="180" fill="#f8fafc" />
          <circle cx="150" cy="90" r="74" fill="#ffffff" stroke="#c19a6b" strokeWidth="1" />
          <circle cx="150" cy="90" r="66" fill="#fafaf9" />

          {/* Swirling Pasta Noodle nests */}
          <g stroke="#d97706" strokeWidth="2.5" fill="none" opacity="0.8">
            <path d="M 110,80 Q 150,55 190,80 T 150,110 T 110,80" />
            <path d="M 115,85 Q 150,65 185,85 T 150,105 T 115,85" />
            <path d="M 120,90 Q 150,75 180,90 T 150,100 T 120,90" />
          </g>

          {/* Clam Shells */}
          <g transform="translate(100, 68)">
            <ellipse cx="12" cy="12" rx="10" ry="7" fill="url(#clamShell)" stroke="#475569" strokeWidth="0.8" />
            <circle cx="10" cy="11" r="3" fill="#fda4af" />
          </g>
          <g transform="translate(170, 72) rotate(40)">
            <ellipse cx="12" cy="12" rx="11" ry="8" fill="url(#clamShell)" stroke="#475569" strokeWidth="0.8" />
          </g>
          <g transform="translate(140, 100) rotate(-15)">
            <ellipse cx="12" cy="12" rx="10" ry="7" fill="url(#clamShell)" stroke="#475569" strokeWidth="0.8" />
          </g>
          <g transform="translate(132, 60) rotate(80)">
            <ellipse cx="10" cy="10" rx="9" ry="6" fill="url(#clamShell)" />
          </g>

          {/* Garnish */}
          <circle cx="125" cy="85" r="2" fill="#15803d" />
          <circle cx="165" cy="92" r="1.5" fill="#15803d" />
          <circle cx="140" cy="98" r="2.2" fill="#15803d" />
          
          <circle cx="155" cy="74" r="1.5" fill="#dc2626" />
          <circle cx="130" cy="95" r="1.8" fill="#dc2626" />
        </svg>
      );

    default:
      return (
        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-500 font-mono text-xs">
          ZCA Culinary Plate SVG
        </div>
      );
  }
};

export const RoomServiceTab: React.FC<RoomServiceTabProps> = ({ roomOrders, advanceOrderStatus }) => {
  return (
    <div className="space-y-6 animate-fade-in" id="room-service-tab">
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-white/40 border border-white/60 shadow-xl">
        
        {/* Header Block in Camel & Slate */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-black/5 pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif-luxury font-bold text-slate-800 flex items-center gap-2">
              <Utensils className="w-6 h-6 text-[#c19a6b]" /> Zafir Room Service Orders
            </h2>
            <p className="text-xs text-slate-600">Track active high-gastronomy suite logistics, real-time prep & kitchen dispatch</p>
          </div>
          <span className="text-xs font-mono text-[#7c5a30] bg-[#c19a6b]/20 px-3 py-1.5 rounded border border-[#c19a6b]/30 font-bold uppercase tracking-wider shadow-sm">
            {roomOrders.length} VIP Suite Placements
          </span>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomOrders.map((order) => (
            <div key={order.id} className="bg-white/45 border border-white/60 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between hover:border-[#c19a6b]/70 transition-all duration-300">
              
              {/* Specialized visual custom SVG drawn directly instead of Unsplash */}
              <div className="h-44 w-full relative">
                <CulinaryVectorSVG orderId={order.id} />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent opacity-95" />
                
                {/* Room indicator pill styled in Camel */}
                <span className="absolute top-4 left-4 bg-white/80 backdrop-blur-md text-[#7c5a30] text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border border-[#c19a6b]/30 shadow">
                  {order.room}
                </span>
                
                <div className="absolute bottom-3 left-4 right-4 z-10">
                  <p className="text-xs font-semibold text-slate-700 font-mono">Guest: {order.guest}</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{order.details}</p>
                </div>
              </div>

              {/* Culinary Milestone Slider */}
              <div className="p-4 space-y-4 bg-white/30">
                <div className="space-y-1.5 animate-pulse-slow">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Preparation Stage</span>
                  
                  {/* Milestones timeline representation */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-700 py-1">
                    <span className={`${order.status === 'Preparation' ? 'text-[#7c5a30] font-bold' : 'text-slate-400'}`}>Prep</span>
                    <span className="h-[1px] flex-1 bg-black/5 mx-1 border-dashed" />
                    <span className={`${order.status === 'Quality Check' ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>Quality</span>
                    <span className="h-[1px] flex-1 bg-black/5 mx-1 border-dashed" />
                    <span className={`${order.status === 'Out for Delivery' ? 'text-sky-600 font-bold' : 'text-slate-400'}`}>Delivery</span>
                  </div>

                  {/* Level Progress bar fill */}
                  <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${
                      order.status === 'Preparation' ? 'w-1/3 bg-[#c19a6b]' :
                      order.status === 'Quality Check' ? 'w-2/3 bg-amber-500' : 'w-full bg-sky-500'
                    }`} />
                  </div>
                </div>

                {/* Dispatch Controls */}
                <div className="flex items-center justify-between pt-2.5 border-t border-black/5">
                  <span className="text-xs text-emerald-600 font-mono font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Authenticated
                  </span>
                  
                  <button
                    onClick={() => advanceOrderStatus(order.id)}
                    className="text-xs bg-[#c19a6b]/20 hover:bg-[#c19a6b] hover:text-white text-[#7c5a30] border border-[#c19a6b]/40 font-mono font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1 active:scale-95 duration-200"
                  >
                    <span>Advance Status</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
