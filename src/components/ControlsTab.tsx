import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { RoomFloorplanController } from './RoomFloorplanController';

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
  language: 'EN' | 'FR' | 'RU';
  fontStyle?: 'standard' | 'cyberpunk' | 'luxury';
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
  toggleRoomGlow,
  language,
  fontStyle
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

        {/* Right Column: Intricate Interactive D3 SVG Floorplan Map */}
        <div className="lg:col-span-8 flex flex-col">
          <RoomFloorplanController
            language={language}
            glowingRooms={glowingRooms}
            toggleRoomGlow={toggleRoomGlow}
            fontStyle={fontStyle}
          />
        </div>

      </div>
    </div>
  );
};
