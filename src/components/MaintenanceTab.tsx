import React from 'react';
import { HardHat, Activity, AlertTriangle } from 'lucide-react';

export const MaintenanceTab: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in" id="maintenance-tab">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Hand-drawn 3D wireframe blueprint SVG area */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="glass-panel rounded-3xl p-6 flex-1 flex flex-col bg-white/40 border border-white/60 shadow-xl">
            <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-serif-luxury text-slate-800 font-bold tracking-wide">Facilities Wireframe Blueprint</h3>
                <p className="text-xs text-slate-600">Live 3D isometric piping, HVAC, and wiring vectors from ZCA Pôle Tech</p>
              </div>
              <div className="font-mono text-[10px] text-slate-600 font-bold">STATUS: SCANNED 100%</div>
            </div>

            {/* Custom 3D Blueprint SVG */}
            <div className="flex-1 bg-[#faf8f4] rounded-2xl p-4 border border-slate-300 flex items-center justify-center overflow-hidden min-h-[360px] shadow-inner" style={{ backgroundImage: 'linear-gradient(rgba(193, 154, 107, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(193, 154, 107, 0.08) 1px, transparent 1px)', backgroundSize: '15px 15px' }}>
              
              <svg viewBox="0 0 800 400" className="w-full h-auto max-w-4xl">
                <defs>
                  <linearGradient id="blueprintGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c5a30" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#c19a6b" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                <g stroke="url(#blueprintGrad)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
                  
                  {/* Isometric floor plate wireframe */}
                  <path d="M 120 280 L 680 280 L 740 230 L 180 230 Z" strokeWidth="1.5" />
                  {/* Top roof plate wireframe */}
                  <path d="M 120 120 L 680 120 L 740 70 L 180 70 Z" strokeWidth="1.5" />
                  
                  {/* Outer columns */}
                  <line x1="120" y1="120" x2="120" y2="280" />
                  <line x1="680" y1="120" x2="680" y2="280" strokeWidth="2" />
                  <line x1="180" y1="70" x2="180" y2="230" />
                  <line x1="740" y1="70" x2="740" y2="230" />
                  
                  {/* Middle partitions */}
                  <line x1="300" y1="120" x2="300" y2="280" />
                  <line x1="500" y1="120" x2="500" y2="280" />
                  
                  {/* HVAC Vent duct tubing */}
                  <g stroke="#0284c7" strokeWidth="1.8" strokeDasharray="3 3">
                    <path d="M150,140 L150,210 L280,210 L280,260 L480,260 L480,140 L640,140" />
                    <circle cx="150" cy="140" r="3" fill="#0284c7" />
                    <circle cx="640" cy="140" r="3" fill="#0284c7" />
                  </g>
                  
                  {/* Plumbing water tubes */}
                  <g stroke="#7c5a30" strokeWidth="2">
                    <path d="M 140,260 L 320,260 L 320,180 L 460,180" />
                    {/* Water heater cylinder */}
                    <ellipse cx="140" cy="250" rx="14" ry="5" />
                    <line x1="126" y1="250" x2="126" y2="230" />
                    <line x1="154" y1="250" x2="154" y2="230" />
                    <ellipse cx="140" cy="230" rx="14" ry="5" />
                  </g>

                  {/* Elevators lift shafts */}
                  <g stroke="#d97706" strokeWidth="1">
                    <rect x="580" y="160" width="40" height="90" />
                    <line x1="580" y1="190" x2="620" y2="190" />
                    <line x1="580" y1="220" x2="620" y2="220" />
                  </g>

                  {/* Heat pumps & vents on roof */}
                  <rect x="220" y="100" width="45" height="15" />
                  <rect x="420" y="100" width="45" height="15" />
                  
                  {/* Circular reservoir tank */}
                  <ellipse cx="480" cy="220" rx="20" ry="7" />
                  <line x1="460" y1="220" x2="460" y2="190" />
                  <line x1="500" y1="220" x2="500" y2="190" />
                  <ellipse cx="480" cy="190" rx="20" ry="7" />

                </g>
                {/* HUD markings label */}
                <g fill="#7c5a30" fontFamily="JetBrains Mono" fontSize="8" opacity="0.9" fontWeight="bold">
                  <text x="210" y="55">[ ROOF HVAC_CORE UNITS ]</text>
                  <text x="110" y="210">CHAMBER PUMP A</text>
                  <text x="450" y="175">MAIN STORAGE TANK</text>
                  <text x="575" y="145">SHAFT 01</text>
                </g>
              </svg>

            </div>
          </div>
        </div>

        {/* Right Column: Status & Tasks check lists */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="glass-panel rounded-3xl p-5 bg-white/40 border border-white/60 shadow-xl">
            <h3 className="text-lg font-serif-luxury text-slate-800 font-bold mb-4 flex items-center gap-1.5">
              <HardHat className="w-5 h-5 text-[#c19a6b]" /> Facility Systems
            </h3>
            
            <div className="space-y-3">
              
              <div className="p-3 bg-white/45 border border-white/60 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-300/30 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Heating & Ventilation (HVAC)</p>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">95% EFFICIENCY OPTIMAL</span>
                </div>
              </div>

              <div className="p-3 bg-white/45 border border-white/60 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#c19a6b]/20 text-[#7c5a30] border border-[#c19a6b]/30 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Aqueous & Plumbing System</p>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">PRESSURE BALANCED</span>
                </div>
              </div>

              <div className="p-3 bg-white/45 border border-white/60 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-300/30 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Sovereign Electrical Core</p>
                  <span className="text-[10px] font-mono text-amber-600 font-bold">STABLE GRID PARITY MATCH</span>
                </div>
              </div>

            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5 bg-white/40 border border-white/60 shadow-xl">
            <h3 className="text-lg font-serif-luxury text-slate-800 font-bold mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Active Alert Warnings
            </h3>
            <ul className="space-y-2">
              <li className="font-mono text-xs bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 shadow-sm">
                &gt; LOW LIQUID PRESSURE DETECTED IN SECTOR 3 OUTLET
              </li>
              <li className="font-mono text-xs bg-amber-50 text-amber-700 p-3 rounded-xl border border-amber-100 shadow-sm">
                &gt; AUXILIARY FILTRATION REPLACEMENT SCHEDULING NEXT 24H
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
