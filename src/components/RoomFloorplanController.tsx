import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  Lightbulb, 
  User, 
  Zap, 
  RefreshCw, 
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoomFloorplanControllerProps {
  language: 'EN' | 'FR' | 'RU';
  glowingRooms: Record<string, boolean>;
  toggleRoomGlow: (room: string) => void;
  fontStyle?: 'standard' | 'cyberpunk' | 'luxury';
  occupancyMap?: Record<string, boolean>;
  setOccupancyMap?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  temperatureMap?: Record<string, number>;
  setTemperatureMap?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

interface FloorplanRoom {
  id: string; // '201', '202', '203', 'meeting', 'corridor'
  name: { EN: string; FR: string; RU: string };
  type: 'suite' | 'meeting' | 'corridor' | 'utility';
  x: number;
  y: number;
  width: number;
  height: number;
  baseTemp: number;
  capacity: number;
}

const ROOMS_CONFIG: FloorplanRoom[] = [
  { 
    id: '201', 
    name: { EN: 'Royal Suite 201', FR: 'Suite Royale 201', RU: 'Королевский Люкс 201' }, 
    type: 'suite', 
    x: 40, 
    y: 40, 
    width: 240, 
    height: 140, 
    baseTemp: 21.5,
    capacity: 2 
  },
  { 
    id: '202', 
    name: { EN: 'Imperial Suite 202', FR: 'Suite Impériale 202', RU: 'Императорский Люкс 202' }, 
    type: 'suite', 
    x: 480, 
    y: 40, 
    width: 240, 
    height: 140, 
    baseTemp: 22.0,
    capacity: 3 
  },
  { 
    id: 'corridor', 
    name: { EN: 'Grand Corridor B', FR: 'Grand Couloir B', RU: 'Главный Коридор Б' }, 
    type: 'corridor', 
    x: 300, 
    y: 40, 
    width: 160, 
    height: 320, 
    baseTemp: 20.0,
    capacity: 10 
  },
  { 
    id: 'meeting', 
    name: { EN: 'Sovereign Boardroom A', FR: 'Salle de Conseil A', RU: 'Президентский Зал A' }, 
    type: 'meeting', 
    x: 40, 
    y: 220, 
    width: 240, 
    height: 140, 
    baseTemp: 21.0,
    capacity: 12 
  },
  { 
    id: '203', 
    name: { EN: 'Prestige Suite 203', FR: 'Suite Prestige 203', RU: 'Престиж Люкс 203' }, 
    type: 'suite', 
    x: 480, 
    y: 220, 
    width: 240, 
    height: 140, 
    baseTemp: 22.5,
    capacity: 2 
  }
];

export const RoomFloorplanController: React.FC<RoomFloorplanControllerProps> = ({
  language,
  glowingRooms,
  toggleRoomGlow,
  fontStyle,
  occupancyMap: externalOccupancyMap,
  setOccupancyMap: externalSetOccupancyMap,
  temperatureMap: externalTemperatureMap,
  setTemperatureMap: externalSetTemperatureMap
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Hover states for tooltips
  const [hoveredRoom, setHoveredRoom] = useState<FloorplanRoom | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // States for interactive controllers
  const [selectedRoomId, setSelectedRoomId] = useState<string>('201');
  const [localOccupancyMap, setLocalOccupancyMap] = useState<Record<string, boolean>>({
    '201': true,
    '202': false,
    'corridor': true,
    'meeting': false,
    '203': true
  });
  const [localTemperatureMap, setLocalTemperatureMap] = useState<Record<string, number>>({
    '201': 21.5,
    '202': 22.0,
    'corridor': 20.2,
    'meeting': 21.0,
    '203': 22.5
  });

  const occupancyMap = externalOccupancyMap || localOccupancyMap;
  const setOccupancyMap = externalSetOccupancyMap || setLocalOccupancyMap;
  const temperatureMap = externalTemperatureMap || localTemperatureMap;
  const setTemperatureMap = externalSetTemperatureMap || setLocalTemperatureMap;
  const [currentLevel, setCurrentLevel] = useState<'01' | '02' | '03'>('02');
  const [interactiveMode, setInteractiveMode] = useState<'lights' | 'occupancy'>('lights');

  // Translations
  const t = {
    EN: {
      title: "Interactive Biometric Floorplan",
      subtitle: "Level 02 Executive Suite Blueprint - Click rooms to instantly manage systems",
      lightsMode: "Click to toggle Room Lights / Glow state",
      occupancyMode: "Click to toggle Room Occupancy status",
      selectedRoom: "Selected Node Parameters",
      temp: "Climate",
      lights: "Lights Status",
      occupancy: "Occupancy",
      powerConsumption: "Virtual Power Draw",
      level: "Select Elevation Level",
      levelTooltip: "Floorplan telemetry feeds",
      simulation: "Dynamic Smart-Sensing Stream",
      triggerSim: "Inject Random Presence Events",
      capacityLabel: "Physical Capacity",
      noRoomSelected: "Select a room on the D3 grid to modify",
      lightOn: "Active Glow",
      lightOff: "Power Saver",
      occupied: "Occupied",
      vacant: "Vacant / Available"
    },
    FR: {
      title: "Plan Biométrique Interactif",
      subtitle: "Plan de l'étage exécutif - Cliquez sur les pièces pour gérer instantanément",
      lightsMode: "Cliquez pour activer/désactiver la lumière",
      occupancyMode: "Cliquez pour modifier l'occupation",
      selectedRoom: "Paramètres de la pièce sélectionnée",
      temp: "Climatisation",
      lights: "État de l'Éclairage",
      occupancy: "Statut d'Occupation",
      powerConsumption: "Puissance Électrique estimée",
      level: "Sélectionner le Niveau",
      levelTooltip: "Flux télémétriques de l'étage",
      simulation: "Flux Capteurs Intelligents",
      triggerSim: "Simuler Présence Aléatoire",
      capacityLabel: "Capacité d'accueil",
      noRoomSelected: "Sélectionnez une pièce sur la grille D3 pour modifier",
      lightOn: "Éclairé (Ambre)",
      lightOff: "Économie d'énergie",
      occupied: "Occupé",
      vacant: "Vacant / Libre"
    },
    RU: {
      title: "Интерактивный Биометрический План",
      subtitle: "План представительского этажа - Нажмите для прямого управления системами",
      lightsMode: "Переключение световой подсветки кюве/комнат",
      occupancyMode: "Переключение статуса присутствия гостей",
      selectedRoom: "Параметры выбранного узла",
      temp: "Климат-контроль",
      lights: "Статус освещения",
      occupancy: "Присутствие гостей",
      powerConsumption: "Электропотребление",
      level: "Выбрать Этаж здания",
      levelTooltip: "Сенсорная телеметрия этажа",
      simulation: "Интеллектуальная симуляция датчиков",
      triggerSim: "Эмулировать датчики присутствия",
      capacityLabel: "Макс. Вместимость",
      noRoomSelected: "Выберите комнату на сетке D3 для настройки",
      lightOn: "Подсветка активна",
      lightOff: "Энергосбережение",
      occupied: "Занято",
      vacant: "Свободно / Ожидание"
    }
  }[language];

  // Helper to toggle occupancy
  const toggleOccupancy = (roomId: string) => {
    setOccupancyMap(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
    if (language === 'FR') {
      confetti({ particleCount: 15, colors: ['#c19a6b', '#22c55e'] });
    } else {
      confetti({ particleCount: 15, colors: ['#c19a6b', '#3b82f6'] });
    }
  };

  // Simulate remote occupancy changes
  const handleSimulatePresence = () => {
    const keys = Object.keys(occupancyMap);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setOccupancyMap(prev => ({
      ...prev,
      [randomKey]: !prev[randomKey]
    }));

    // Random temperature drift too
    setTemperatureMap(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        const drift = (Math.random() - 0.5) * 0.4;
        updated[k] = +(updated[k] + drift).toFixed(1);
      });
      return updated;
    });

    confetti({ particleCount: 10, colors: ['#7c5a30', '#f59e0b'] });
  };

  // Generate dynamic power consumption in Watts based on lights scene and status
  const getPowerDraw = (roomId: string) => {
    const isGlowing = glowingRooms[roomId];
    const isOccupied = occupancyMap[roomId];
    let base = 25; // standby power draw
    if (isGlowing) base += 120;
    if (isOccupied) base += 85;
    return base;
  };

  // Build & Update D3 Floorplan
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous layouts for full dynamic update

    // Linear definitions in defs
    const defs = svg.append('defs');
    
    // Ambient backgrounds
    const gridPattern = defs.append('pattern')
      .attr('id', 'd3GridPattern')
      .attr('width', '20')
      .attr('height', '20')
      .attr('patternUnits', 'userSpaceOnUse');

    gridPattern.append('path')
      .attr('d', 'M 20 0 L 0 0 0 20')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(193, 154, 107, 0.08)')
      .attr('stroke-width', '0.5');

    // Room gradients
    ROOMS_CONFIG.forEach(room => {
      const isGlowing = glowingRooms[room.id];
      const radGrad = defs.append('radialGradient')
        .attr('id', `radial-glow-${room.id}`)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '70%');

      if (isGlowing) {
        radGrad.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', '#c19a6b')
          .attr('stop-opacity', '0.24');
        radGrad.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', '#7c5a30')
          .attr('stop-opacity', '0.04');
      } else {
        radGrad.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', '#fbfbfb')
          .attr('stop-opacity', '0.6');
        radGrad.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', '#eae5d9')
          .attr('stop-opacity', '0.15');
      }
    });

    // Draw blueprint limits background
    svg.append('rect')
      .attr('width', '760')
      .attr('height', '400')
      .attr('fill', 'url(#d3GridPattern)')
      .attr('stroke', 'rgba(193, 154, 107, 0.25)')
      .attr('stroke-width', '1')
      .attr('rx', '16');

    // Draw central hallways indicators
    svg.append('line')
      .attr('x1', '300')
      .attr('y1', '40')
      .attr('x2', '300')
      .attr('y2', '360')
      .attr('stroke', 'rgba(193, 154, 107, 0.2)')
      .attr('stroke-width', '1')
      .attr('stroke-dasharray', '4 4');

    svg.append('line')
      .attr('x1', '460')
      .attr('y1', '40')
      .attr('x2', '460')
      .attr('y2', '360')
      .attr('stroke', 'rgba(193, 154, 107, 0.2)')
      .attr('stroke-width', '1')
      .attr('stroke-dasharray', '4 4');

    // Draw Rooms selection boxes
    const roomsGroup = svg.selectAll('.room-node')
      .data(ROOMS_CONFIG)
      .enter()
      .append('g')
      .attr('class', 'room-node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        setSelectedRoomId(d.id);
        if (interactiveMode === 'lights') {
          toggleRoomGlow(d.id);
        } else {
          toggleOccupancy(d.id);
        }
      })
      .on('pointerover', (event, d) => {
        d3.select(event.currentTarget).select('rect')
          .transition()
          .duration(150)
          .attr('stroke', '#7c5a30')
          .attr('stroke-width', d.id === selectedRoomId ? '3' : '2.5')
          .attr('filter', 'drop-shadow(0px 6px 12px rgba(193, 154, 107, 0.35))');

        setHoveredRoom(d);
      })
      .on('pointermove', (event) => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          setTooltipPos({ x, y });
        }
      })
      .on('pointerout', (event, d) => {
        d3.select(event.currentTarget).select('rect')
          .transition()
          .duration(150)
          .attr('stroke', d.id === selectedRoomId ? '#7c5a30' : (glowingRooms[d.id] ? '#c19a6b' : 'rgba(193, 154, 107, 0.3)'))
          .attr('stroke-width', d.id === selectedRoomId ? '2.5' : '1.5')
          .attr('filter', glowingRooms[d.id] ? 'drop-shadow(0px 4px 8px rgba(193, 154, 107, 0.15))' : 'none');

        setHoveredRoom(null);
      });

    // Rect containers with smooth transition
    roomsGroup.append('rect')
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('rx', '14')
      .attr('fill', d => `url(#radial-glow-${d.id})`)
      .attr('stroke', d => {
        if (d.id === selectedRoomId) return '#7c5a30';
        return glowingRooms[d.id] ? '#c19a6b' : 'rgba(193, 154, 107, 0.3)';
      })
      .attr('stroke-width', d => d.id === selectedRoomId ? '2.5' : '1.5')
      .attr('filter', d => glowingRooms[d.id] ? 'drop-shadow(0px 4px 8px rgba(193, 154, 107, 0.15))' : 'none')
      .style('transition', 'fill 0.4s ease, stroke 0.4s ease, stroke-width 0.2s ease, filter 0.4s ease');

    // Room Label
    roomsGroup.append('text')
      .attr('x', d => d.width / 2)
      .attr('y', '32')
      .attr('text-anchor', 'middle')
      .attr('fill', '#1a1410')
      .attr('font-size', '11.5')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Outfit, Inter, sans-serif')
      .text(d => d.name[language]);

    // Subtitle / Type identifier
    roomsGroup.append('text')
      .attr('x', d => d.width / 2)
      .attr('y', '48')
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(124, 90, 48, 0.65)')
      .attr('font-size', '8.5')
      .attr('font-weight', 'bold')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text(d => d.type.toUpperCase());

    // Temperature Indicator Pill
    const tempGroup = roomsGroup.append('g')
      .attr('transform', d => `translate(${d.width / 2 - 32}, ${d.height - 40})`);

    tempGroup.append('rect')
      .attr('width', '64')
      .attr('height', '18')
      .attr('rx', '9')
      .attr('fill', 'rgba(255, 255, 255, 0.85)')
      .attr('stroke', 'rgba(124, 90, 48, 0.15)')
      .attr('stroke-width', '0.5');

    tempGroup.append('text')
      .attr('x', '32')
      .attr('y', '12')
      .attr('text-anchor', 'middle')
      .attr('fill', '#475569')
      .attr('font-size', '9.5')
      .attr('font-weight', 'semibold')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text(d => `${temperatureMap[d.id] || d.baseTemp}°C`);

    // Top-Left Glowing Indicator Bulb state
    roomsGroup.append('circle')
      .attr('cx', '24')
      .attr('cy', '24')
      .attr('r', '7')
      .attr('fill', d => glowingRooms[d.id] ? '#f59e0b' : '#94a3b8')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', '1.5')
      .style('transition', 'fill 0.3s ease');

    // Occupancy Indicator Ring Top-Right
    const occupancyRing = roomsGroup.append('g')
      .attr('transform', d => `translate(${d.width - 28}, 24)`);

    occupancyRing.append('circle')
      .attr('r', '7')
      .attr('fill', d => occupancyMap[d.id] ? '#22c55e' : '#e2e8f0')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', '1.5');

    // Legend icons representation at bottom of blueprint
    const labelsLeg = svg.append('g')
      .attr('transform', 'translate(40, 375)');

    // Smart Glass status
    labelsLeg.append('circle')
      .attr('r', '4')
      .attr('fill', '#f59e0b');
    labelsLeg.append('text')
      .attr('x', '10')
      .attr('y', '4')
      .attr('font-size', '8.5')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', '#64748b')
      .text('GLOW ON');

    labelsLeg.append('circle')
      .attr('cx', '90')
      .attr('r', '4')
      .attr('fill', '#22c55e');
    labelsLeg.append('text')
      .attr('x', '100')
      .attr('y', '4')
      .attr('font-size', '8.5')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', '#64748b')
      .text('OCCUPIED');

    labelsLeg.append('rect')
      .attr('x', '180')
      .attr('y', '-6')
      .attr('width', '12')
      .attr('height', '12')
      .attr('fill', 'none')
      .attr('stroke', '#7c5a30')
      .attr('stroke-width', '2')
      .attr('rx', '2');
    labelsLeg.append('text')
      .attr('x', '200')
      .attr('y', '4')
      .attr('font-size', '8.5')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', '#64748b')
      .text('SELECTED NODE');

  }, [glowingRooms, occupancyMap, temperatureMap, selectedRoomId, interactiveMode, language]);

  // Find currently selected room specs
  const activeRoomData = ROOMS_CONFIG.find(r => r.id === selectedRoomId);

  return (
    <div className={`p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl space-y-6 ${fontStyle === 'cyberpunk' ? 'font-mono' : 'font-sans-luxury'}`} id="room-floorplan-controller-panel">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div>
          <h3 className="text-lg font-bold font-serif-luxury text-slate-800 tracking-wide flex items-center gap-2">
            <Home className="w-5 h-5 text-[#c19a6b]" />
            {t.title}
          </h3>
          <p className="text-xs text-slate-600">
            {t.subtitle}
          </p>
        </div>

        {/* Level Controls & Interactive Mode selectors */}
        <div className="flex flex-wrap gap-2">
          {/* Level selectors */}
          <div className="bg-slate-100/80 p-1 rounded-xl border border-black/5 flex items-center gap-1">
            {(['01', '02', '03'] as const).map(lev => (
              <button
                key={lev}
                onClick={() => {
                  setCurrentLevel(lev);
                  confetti({ particleCount: 8, spread: 20 });
                }}
                className={`py-1 px-3 text-[10px] font-mono font-bold rounded-lg transition ${
                  currentLevel === lev
                    ? 'bg-[#c19a6b] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                L{lev}
              </button>
            ))}
          </div>

          {/* Interactive touch action selectors */}
          <div className="bg-slate-100/80 p-1 rounded-xl border border-black/5 flex items-center gap-1">
            <button
              onClick={() => setInteractiveMode('lights')}
              className={`py-1.5 px-3 text-[9.5px] font-mono font-bold rounded-lg transition flex items-center gap-1.5 ${
                interactiveMode === 'lights'
                  ? 'bg-[#7c5a30] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
              title={t.lightsMode}
            >
              <Lightbulb className="w-3 h-3" />
              <span>LIGHTS</span>
            </button>
            <button
              onClick={() => setInteractiveMode('occupancy')}
              className={`py-1.5 px-3 text-[9.5px] font-mono font-bold rounded-lg transition flex items-center gap-1.5 ${
                interactiveMode === 'occupancy'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
              title={t.occupancyMode}
            >
              <User className="w-3 h-3" />
              <span>OCCUPANCY</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of D3 SVG Canvas on left/top, parameter control on right/bottom */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* SVG Container on Left */}
        <div 
          ref={containerRef}
          className="xl:col-span-8 bg-[#faf8f4] rounded-2.5xl p-4 border border-slate-200/80 shadow-inner flex flex-col items-center justify-center relative min-h-[360px] select-none"
        >
          <svg
            ref={svgRef}
            viewBox="0 0 760 400"
            className="w-full h-auto max-w-3xl drop-shadow-sm font-sans"
          />

          {/* Real-time Bio-Metric Floating Tooltip */}
          {hoveredRoom && (
            <div 
              className={`absolute pointer-events-none bg-[#110d0a] text-[#eae4d5] border border-[#c19a6b]/50 rounded-2xl p-3.5 shadow-2.5xl space-y-2 transition-all duration-75 text-xs z-50 min-w-[170px] backdrop-blur-md ${
                fontStyle === 'cyberpunk' ? 'font-mono' : 'font-sans-luxury'
              }`}
              style={{ 
                left: `${tooltipPos.x + 15}px`, 
                top: `${tooltipPos.y + 15}px`,
                transform: 'translate(0, -50%)'
              }}
            >
              <div className="font-bold border-b border-[#c19a6b]/20 pb-1.5 text-amber-200 flex items-center justify-between gap-2">
                <span className="font-semibold tracking-wide">{hoveredRoom.name[language]}</span>
                <span className="text-[9px] font-mono opacity-80 text-[#c19a6b]">#{hoveredRoom.id}</span>
              </div>
              <div className="space-y-1.5 text-[11px] font-mono">
                {/* Temperature telemetry */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-stone-400">Temp:</span>
                  <span className="font-semibold text-stone-250">{temperatureMap[hoveredRoom.id] || hoveredRoom.baseTemp}°C</span>
                </div>
                {/* Occupancy telemetry */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-stone-400">{t.occupancy}:</span>
                  <span className={`font-semibold flex items-center gap-1 ${occupancyMap[hoveredRoom.id] ? 'text-emerald-400' : 'text-stone-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${occupancyMap[hoveredRoom.id] ? 'bg-emerald-500 animate-pulse' : 'bg-stone-500'}`} />
                    {occupancyMap[hoveredRoom.id] ? t.occupied : t.vacant}
                  </span>
                </div>
                {/* Glow telemetry */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-stone-400">Glow/Lights:</span>
                  <span className={`font-semibold ${glowingRooms[hoveredRoom.id] ? 'text-amber-400' : 'text-stone-500'}`}>
                    {glowingRooms[hoveredRoom.id] ? t.lightOn : t.lightOff}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected parameters card & Smart preset toggler sidebar */}
        <div className="xl:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="bg-[#fcfaf5] border border-amber-200/50 rounded-2.5xl p-5 shadow-sm space-y-4 flex-1">
            <div className="border-b border-amber-200/30 pb-3">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#7c5a30]/80 font-bold block mb-1">
                {t.selectedRoom}
              </span>
              <h4 className="text-sm font-bold font-serif-luxury text-slate-850 flex items-center justify-between">
                <span>{activeRoomData ? activeRoomData.name[language] : 'Select node'}</span>
                <span className="font-mono text-[9px] uppercase bg-amber-100 text-amber-850 border border-amber-200/40 p-1 px-2 rounded-md font-bold">
                  ID: #{selectedRoomId}
                </span>
              </h4>
            </div>

            {activeRoomData ? (
              <div className="space-y-4">
                {/* Metric list block */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Status Lights Switch */}
                  <div className="p-3 bg-white border border-[#c19a6b]/20 rounded-xl space-y-1 shadow-inner">
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase font-black tracking-wider block">
                      {t.lights}
                    </span>
                    <button
                      onClick={() => toggleRoomGlow(selectedRoomId)}
                      className={`text-[10px] font-bold font-mono p-1.5 rounded-lg w-full transition border text-center flex items-center justify-center gap-1.5 ${
                        glowingRooms[selectedRoomId]
                          ? 'bg-amber-100/50 text-amber-800 border-amber-350'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <Lightbulb className={`w-3.5 h-3.5 ${glowingRooms[selectedRoomId] ? 'text-amber-500 fill-amber-500' : ''}`} />
                      <span>{glowingRooms[selectedRoomId] ? t.lightOn : t.lightOff}</span>
                    </button>
                  </div>

                  {/* Occupancy state */}
                  <div className="p-3 bg-white border border-[#c19a6b]/20 rounded-xl space-y-1 shadow-inner">
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase font-black tracking-wider block">
                      {t.occupancy}
                    </span>
                    <button
                      onClick={() => toggleOccupancy(selectedRoomId)}
                      className={`text-[10px] font-bold font-mono p-1.5 rounded-lg w-full transition border text-center flex items-center justify-center gap-1.5 ${
                        occupancyMap[selectedRoomId]
                          ? 'bg-emerald-100/50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{occupancyMap[selectedRoomId] ? t.occupied : t.vacant}</span>
                    </button>
                  </div>
                </div>

                {/* Integrated temperature dials setting */}
                <div className="p-3.5 bg-white border border-[#c19a6b]/15 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-widest block font-extrabold">{t.temp}</span>
                    <span className="text-sm font-bold font-mono text-slate-850">
                      {temperatureMap[selectedRoomId] || activeRoomData.baseTemp}°C
                    </span>
                  </div>
                  
                  {/* Climate temperature increment controllers */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setTemperatureMap(prev => ({
                        ...prev,
                        [selectedRoomId]: +((prev[selectedRoomId] || activeRoomData.baseTemp) - 0.5).toFixed(1)
                      }))}
                      className="w-7 h-7 bg-slate-50 hover:bg-amber-100/30 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 active:scale-95 duration-100"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setTemperatureMap(prev => ({
                        ...prev,
                        [selectedRoomId]: +((prev[selectedRoomId] || activeRoomData.baseTemp) + 0.5).toFixed(1)
                      }))}
                      className="w-7 h-7 bg-slate-50 hover:bg-amber-100/30 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 active:scale-95 duration-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Power draw indicators */}
                <div className="p-3.5 bg-[#f5efe2] border border-[#c19a6b]/20 rounded-2xl flex justify-between items-center shadow-inner">
                  <div>
                    <span className="text-[8.5px] font-mono tracking-widest uppercase text-slate-450 block font-bold">{t.powerConsumption}</span>
                    <p className="text-xs text-slate-600 font-mono mt-0.5 font-semibold">Real-time smart-grid calculation</p>
                  </div>
                  <div className="text-right flex items-center gap-1.5 text-slate-800">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                    <span className="text-md font-mono font-black">{getPowerDraw(selectedRoomId)}W</span>
                  </div>
                </div>

                {/* Capacity rating */}
                <div className="flex justify-between text-[10px] font-mono text-slate-500 border-t border-amber-200/20 pt-2 pb-1">
                  <span>{t.capacityLabel}</span>
                  <span className="font-bold text-slate-700">{activeRoomData.capacity} Guests Limit</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 font-mono text-xs">{t.noRoomSelected}</div>
            )}
          </div>

          {/* Quick Trigger Simulation stream */}
          <div className="glass-panel p-4 bg-white/60 border border-slate-200 rounded-2.5xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8.5px] font-mono tracking-widest uppercase font-black">
                {t.simulation}
              </span>
              <p className="text-[9px] text-slate-500 font-mono leading-relaxed max-w-xs sm:max-w-none">
                Interactive IoT sensor mapping
              </p>
            </div>

            <button
              onClick={handleSimulatePresence}
              className="bg-[#1a1410] hover:bg-[#3d1f0f] active:bg-[#1a1410] text-[#eae4d5] border border-[#c19a6b]/30 font-mono text-[9px] uppercase font-bold p-2.5 px-4 rounded-xl transition shadow cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-300 fill-none animate-spin" strokeWidth="2.5" />
              <span>{t.triggerSim}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
