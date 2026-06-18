import React from 'react';
import { Plus, Minus, Map } from 'lucide-react';

interface ControlsTabProps {
  lightScene: 'ambient' | 'bright' | 'relax' | 'night';
  setLightScene: (scene: 'ambient' | 'bright' | 'relax' | 'night') => void;
  currentTemp: number;
  setCurrentTemp: (temp: number) => void;
  targetTemp: number;
  setTargetTemp: (temp: number) => void;
  glassOpacity: number;
  setGlassOpacity: (opacity: number) => void;
  glowingRooms: Record<string, boolean>;
  toggleRoomGlow: (room: string) => void;
}

export const ControlsTab: React.FC<ControlsTabProps> = ({
  lightScene,
  setLightScene,
  currentTemp,
  setCurrentTemp,
  targetTemp,
  setTargetTemp,
  glassOpacity,
  setGlassOpacity,
  glowingRooms,
  toggleRoomGlow
}) => {
  return (
    <div className="space-y-6 animate-fade-in" id="controls-tab">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Environmental dials */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-6 space-y-6 bg-white/40 border border-white/60 shadow-xl">
            <div>
              <h3 className="text-lg font-serif-luxury text-slate-800 font-bold tracking-wide">Environmental Adjust</h3>
              <p className="text-xs text-slate-600">Integrated Climate & Intelligent Atmosphere</p>
            </div>

            {/* Stage selectors */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">Ambient Lighting Scenes</span>
              <div className="grid grid-cols-2 gap-2">
                {(['ambient', 'bright', 'relax', 'night'] as const).map(scene => (
                  <button
                    key={scene}
                    onClick={() => setLightScene(scene)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border uppercase transition-all duration-200 ${
                      lightScene === scene
                        ? 'bg-[#c19a6b]/20 text-[#7c5a30] border-[#c19a6b]/40 shadow-sm font-bold'
                        : 'bg-white/30 text-slate-600 border-slate-200 hover:bg-white/50'
                    }`}
                  >
                    {scene}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-black/5" />

            {/* Circular Dial SVG Thermostat */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2">Climate Control</span>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                
                {/* SVG Temperature Dial */}
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 160 160" className="w-full h-full rotate-45">
                    <defs>
                      <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#edeae2" />
                      </linearGradient>
                      <linearGradient id="trackerGrad" x1="0" y1="1" x2="1" y2="0">
                        <stop offset="0%" stopColor="#c19a6b" />
                        <stop offset="100%" stopColor="#7c5a30" />
                      </linearGradient>
                    </defs>
                    <circle cx="80" cy="80" r="72" fill="url(#dialGrad)" stroke="#c19a6b" strokeWidth="0.5" opacity="0.4" />
                    <circle cx="80" cy="80" r="60" fill="none" stroke="#e5e1d5" strokeWidth="12" />
                    {/* Active temperatures indicator arc */}
                    <circle cx="80" cy="80" r="60" fill="none" stroke="url(#trackerGrad)" strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray="210 380"
                            className="transition-all duration-500" />
                  </svg>
                  {/* Central Text display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-mono text-slate-800">{currentTemp}°C</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">LOBBY TEMP</span>
                  </div>
                </div>

                {/* Target adjustment */}
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="text-xs">
                    <span className="text-slate-500 block">Target Setting:</span>
                    <strong className="text-2xl font-mono text-[#7c5a30] block">{targetTemp}°C</strong>
                  </div>
                  
                  <div className="flex gap-1.5 justify-center sm:justify-start">
                    <button 
                      onClick={() => { setTargetTemp(Math.max(16, targetTemp - 1)); setCurrentTemp(Math.max(16, currentTemp - 1)); }}
                      className="p-1 px-3 bg-white/60 hover:bg-[#c19a6b]/20 border border-slate-300 rounded-lg text-slate-800 shadow-sm active:scale-95 duration-150"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => { setTargetTemp(Math.min(30, targetTemp + 1)); setCurrentTemp(Math.min(30, currentTemp + 1)); }}
                      className="p-1 px-3 bg-white/60 hover:bg-[#c19a6b]/20 border border-slate-300 rounded-lg text-slate-800 shadow-sm active:scale-95 duration-150"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <hr className="border-black/5" />

            {/* Smart Glass Opacity slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Smart Glass Opacity</span>
                <span className="font-mono text-[#7c5a30] font-bold">{glassOpacity}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={glassOpacity} 
                onChange={(e) => setGlassOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#c19a6b]" 
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Transparent</span>
                <span>Fully Opaque</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Intricate Interactive SVG Building Layout Map */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="glass-panel rounded-3xl p-6 flex-1 flex flex-col bg-white/40 border border-white/60 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-serif-luxury text-slate-800 font-bold tracking-wide flex items-center gap-1.5">
                  <Map className="w-5 h-5 text-[#c19a6b]" /> Floor Plan: Level 02
                </h3>
                <p className="text-xs text-slate-600">Executive Suites blueprints & glowing active nodes. Click rooms/hotspots to toggle glow status.</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-mono"><span className="w-2 h-2 rounded-full bg-[#c19a6b]" /> Camel Glow</span>
                <span className="flex items-center gap-1.5 font-mono"><span className="w-2.5 h-2.5 bg-slate-100 border border-slate-300 rounded inline-block" /> Active</span>
              </div>
            </div>

            {/* Intricate detailed blueprint SVG */}
            <div className="flex-1 bg-[#faf8f4] rounded-2xl p-4 border border-slate-300/60 flex items-center justify-center overflow-hidden min-h-[380px] shadow-inner relative">
              
              <svg viewBox="0 0 800 420" className="w-full h-auto max-w-4xl select-none">
                <defs>
                  {/* Grid patterning */}
                  <pattern id="planGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(193, 154, 107, 0.12)" strokeWidth="0.5" />
                  </pattern>
                  <linearGradient id="hallwayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(193, 154, 107, 0.05)" />
                    <stop offset="100%" stopColor="rgba(193, 154, 107, 0.12)" />
                  </linearGradient>
                  
                  {/* Glowing effects for active rooms */}
                  <radialGradient id="camelPulse">
                    <stop offset="0%" stopColor="#c19a6b" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="#c19a6b" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#c19a6b" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Technical blueprint background */}
                <rect width="800" height="420" fill="url(#planGrid)" />
                <rect width="800" height="420" fill="none" stroke="rgba(193, 154, 107, 0.2)" strokeWidth="1.5" />

                {/* Central Corridor B (Hallways) */}
                <rect x="350" y="40" width="100" height="340" fill="url(#hallwayGrad)" stroke="rgba(193, 154, 107, 0.25)" strokeWidth="1" />
                <text x="400" y="100" fill="rgba(193, 154, 107, 0.5)" fontSize="9" fontWeight="bold" letterSpacing="2" textAnchor="middle" fontFamily="JetBrains Mono">CORRIDOR B</text>
                <text x="400" y="320" fill="rgba(193, 154, 107, 0.5)" fontSize="9" fontWeight="bold" letterSpacing="2" textAnchor="middle" fontFamily="JetBrains Mono">CORRIDOR B</text>

                {/* Central Elevator Hub */}
                <g stroke="rgba(193, 154, 107, 0.4)" strokeWidth="1" fill="none">
                  <rect x="375" y="180" width="50" height="60" rx="3" fill="#ffffff" />
                  <line x1="375" y1="210" x2="425" y2="210" />
                  <path d="M390,200 L400,190 L410,200" strokeWidth="1.5" />
                  <path d="M390,220 L400,230 L410,220" strokeWidth="1.5" />
                  <text x="400" y="174" fill="rgba(193, 154, 107, 0.8)" fontSize="7" textAnchor="middle" fontFamily="JetBrains Mono">ELEV</text>
                </g>

                {/* --- EXECUTIVE SUITES BLUEPRINT --- */}

                {/* Suite 201 (Top Left) */}
                <g onClick={() => toggleRoomGlow('201')} className="cursor-pointer group">
                  <rect x="50" y="40" width="300" height="130" 
                        fill={glowingRooms['201'] ? 'rgba(193, 154, 107, 0.15)' : '#ffffff'} 
                        stroke={glowingRooms['201'] ? '#c19a6b' : 'rgba(193, 154, 107, 0.35)'} 
                        strokeWidth="1.5" className="transition-all duration-300" />
                  {glowingRooms['201'] && (
                    <circle cx="200" cy="105" r="45" fill="url(#camelPulse)" />
                  )}
                  {/* Bed silhouette */}
                  <rect x="80" y="80" width="40" height="50" rx="3" fill="none" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="1" />
                  <rect x="80" y="80" width="40" height="15" fill="none" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="1" />
                  <circle cx="200" cy="105" r="5" fill={glowingRooms['201'] ? '#7c5a30' : '#94a3b8'} className="transition-colors" />
                  <text x="200" y="70" fill={glowingRooms['201'] ? '#7c5a30' : '#475569'} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">Suite 201</text>
                  <text x="200" y="130" fill="rgba(193, 154, 107, 0.7)" fontSize="7" textAnchor="middle" fontFamily="JetBrains Mono">ACTIVE</text>
                </g>

                {/* Suite 202 (Top Right) */}
                <g onClick={() => toggleRoomGlow('202')} className="cursor-pointer group">
                  <rect x="450" y="40" width="300" height="130" 
                        fill={glowingRooms['202'] ? 'rgba(193, 154, 107, 0.15)' : '#ffffff'} 
                        stroke={glowingRooms['202'] ? '#c19a6b' : 'rgba(193, 154, 107, 0.35)'} 
                        strokeWidth="1.5" className="transition-all duration-300" />
                  {glowingRooms['202'] && (
                    <circle cx="600" cy="105" r="45" fill="url(#camelPulse)" />
                  )}
                  {/* Bed silhouette */}
                  <rect x="680" y="80" width="40" height="50" rx="3" fill="none" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="1" />
                  <circle cx="600" cy="105" r="5" fill={glowingRooms['202'] ? '#7c5a30' : '#94a3b8'} className="transition-colors" />
                  <text x="600" y="70" fill={glowingRooms['202'] ? '#7c5a30' : '#475569'} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">Suite 202</text>
                  <text x="600" y="130" fill="rgba(193, 154, 107, 0.7)" fontSize="7" textAnchor="middle" fontFamily="JetBrains Mono">BLUE_GLOW</text>
                </g>

                {/* Suite 203 (Bottom Right) */}
                <g onClick={() => toggleRoomGlow('203')} className="cursor-pointer group">
                  <rect x="450" y="170" width="300" height="210" 
                        fill={glowingRooms['203'] ? 'rgba(193, 154, 107, 0.15)' : '#ffffff'} 
                        stroke={glowingRooms['203'] ? '#c19a6b' : 'rgba(193, 154, 107, 0.35)'} 
                        strokeWidth="1.5" className="transition-all duration-300" />
                  {glowingRooms['203'] && (
                    <circle cx="600" cy="275" r="55" fill="url(#camelPulse)" />
                  )}
                  <circle cx="600" cy="275" r="5" fill={glowingRooms['203'] ? '#7c5a30' : '#94a3b8'} />
                  <text x="600" y="240" fill={glowingRooms['203'] ? '#7c5a30' : '#475569'} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">Suite 203 (Villa)</text>
                </g>

                {/* Meeting Room A (Bottom Left) */}
                <g onClick={() => toggleRoomGlow('meeting')} className="cursor-pointer group">
                  <rect x="50" y="170" width="300" height="210" 
                        fill={glowingRooms['meeting'] ? 'rgba(193, 154, 107, 0.15)' : '#ffffff'} 
                        stroke={glowingRooms['meeting'] ? '#c19a6b' : 'rgba(193, 154, 107, 0.35)'} 
                        strokeWidth="1.5" className="transition-all duration-300" />
                  {glowingRooms['meeting'] && (
                    <circle cx="200" cy="275" r="55" fill="url(#camelPulse)" />
                  )}
                  {/* Conference Room Table */}
                  <rect x="150" y="255" width="100" height="40" rx="10" fill="none" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="1" />
                  <circle cx="200" cy="275" r="5" fill={glowingRooms['meeting'] ? '#7c5a30' : '#94a3b8'} />
                  <text x="200" y="234" fill={glowingRooms['meeting'] ? '#7c5a30' : '#475569'} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">Conference Room A</text>
                </g>

                {/* Technical Pillar Accents */}
                <rect x="46" y="36" width="8" height="8" fill="#c19a6b" opacity="0.6" />
                <rect x="746" y="36" width="8" height="8" fill="#c19a6b" opacity="0.6" />
                <rect x="46" y="376" width="8" height="8" fill="#c19a6b" opacity="0.6" />
                <rect x="746" y="376" width="8" height="8" fill="#c19a6b" opacity="0.6" />

              </svg>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
