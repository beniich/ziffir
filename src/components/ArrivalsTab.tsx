import React, { useState, useEffect } from 'react';
import { Plane, Clock, Map, Maximize2, Compass, Radio, X, Info, Wind, ShieldAlert } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ArrivalsTabProps {
  vipGuests: Array<{
    name: string;
    vip: string;
    status: string;
    info: string;
    flight: string;
  }>;
  flights: Array<{
    id: string;
    status: string;
    time: string;
  }>;
  userRole?: 'operator' | 'manager';
}

// Genuine Airport Metadata & Coordinates
interface AirportConfig {
  id: string;
  name: string;
  city: string;
  code: string;
  lat: number;
  lon: number;
  runways: string[];
  weather: string;
  windSpeed: string;
  windDir: string;
  temp: string;
  activeFlight: {
    number: string;
    origin: string;
    aircraft: string;
    pilot: string;
    altitudeStart: number;
    speedStart: number;
    coordsList: { lat: number; lon: number }[];
  };
}

const AIRPORTS: AirportConfig[] = [
  {
    id: 'zafir',
    name: 'Zafir Prestige Palace & Estate Grounds',
    city: 'French Riviera (Cap-Ferrat)',
    code: 'ZAFIR',
    lat: 43.6823,
    lon: 7.3323,
    runways: ['Helipad H1 (Pristine)', 'Yacht Dock Alpha', 'Main Entrance Portico'],
    weather: 'Sunny & Clear, Gentle Riviera breeze',
    windSpeed: '5 kts',
    windDir: '180° (S)',
    temp: '26°C',
    activeFlight: {
      number: 'Z-YACHT7',
      origin: 'Nice Cote d\'Azur (NCE)',
      aircraft: 'Prestige Helitender H160',
      pilot: 'Cpt. Jean-Marc Blanc',
      altitudeStart: 1200,
      speedStart: 70,
      coordsList: [
        { lat: 43.6650, lon: 7.3100 },
        { lat: 43.6730, lon: 7.3200 },
        { lat: 43.6790, lon: 7.3280 },
        { lat: 43.6823, lon: 7.3323 }
      ]
    }
  },
  {
    id: 'jfk',
    name: 'John F. Kennedy Intl Airport',
    city: 'New York',
    code: 'JFK',
    lat: 40.6413,
    lon: -73.7781,
    runways: ['13L/31R', '04L/22R', '04R/22L', '13R/31L'],
    weather: 'Clear sky, high visibility',
    windSpeed: '12 kts',
    windDir: '280° (W)',
    temp: '22°C',
    activeFlight: {
      number: 'AF015',
      origin: 'Paris (CDG)',
      aircraft: 'Boeing 777-300ER',
      pilot: 'Cpt. Édouard Dubois',
      altitudeStart: 12400,
      speedStart: 250,
      coordsList: [
        { lat: 40.521, lon: -73.410 }, // approach start
        { lat: 40.565, lon: -73.550 },
        { lat: 40.601, lon: -73.680 },
        { lat: 40.6413, lon: -73.7781 } // touchdown
      ]
    }
  },
  {
    id: 'lhr',
    name: 'London Heathrow Airport',
    city: 'London',
    code: 'LHR',
    lat: 51.4700,
    lon: -0.4543,
    runways: ['09L/27R', '09R/27L'],
    weather: 'Overcast, light turbulence',
    windSpeed: '18 kts',
    windDir: '240° (SW)',
    temp: '15°C',
    activeFlight: {
      number: 'BA178',
      origin: 'New York (JFK)',
      aircraft: 'Airbus A350-1000',
      pilot: 'S/O Clara Sterling',
      altitudeStart: 14500,
      speedStart: 265,
      coordsList: [
        { lat: 51.350, lon: -0.150 },
        { lat: 51.410, lon: -0.280 },
        { lat: 51.450, lon: -0.380 },
        { lat: 51.4700, lon: -0.4543 }
      ]
    }
  },
  {
    id: 'cdg',
    name: 'Paris Charles de Gaulle Airport',
    city: 'Paris',
    code: 'CDG',
    lat: 49.0097,
    lon: 2.5479,
    runways: ['08L/26R', '08R/26L', '09L/27R', '09R/27L'],
    weather: 'Light rain, low ceiling',
    windSpeed: '9 kts',
    windDir: '350° (N)',
    temp: '17°C',
    activeFlight: {
      number: 'LH224',
      origin: 'Munich (MUC)',
      aircraft: 'Airbus A320neo',
      pilot: 'Cpt. Hans Werner',
      altitudeStart: 8500,
      speedStart: 210,
      coordsList: [
        { lat: 48.910, lon: 2.210 },
        { lat: 48.950, lon: 2.350 },
        { lat: 48.980, lon: 2.450 },
        { lat: 49.0097, lon: 2.5479 }
      ]
    }
  },
  {
    id: 'dxb',
    name: 'Dubai International Airport',
    city: 'Dubai',
    code: 'DXB',
    lat: 25.2532,
    lon: 55.3657,
    runways: ['12L/30R', '12R/30L'],
    weather: 'Sunny and clear, strong thermal',
    windSpeed: '6 kts',
    windDir: '130° (SE)',
    temp: '38°C',
    activeFlight: {
      number: 'EK201',
      origin: 'London (LHR)',
      aircraft: 'Airbus A380-800',
      pilot: 'Cpt. Yousuf Al-Mansoori',
      altitudeStart: 16200,
      speedStart: 280,
      coordsList: [
        { lat: 25.110, lon: 55.120 },
        { lat: 25.180, lon: 55.240 },
        { lat: 25.220, lon: 55.310 },
        { lat: 25.2532, lon: 55.3657 }
      ]
    }
  }
];

export const ZAFIR_POIS = [
  { name: '🏰 Palace Main Portico Reception', lat: 43.6841, lon: 7.3330, description: 'Elegantly guarded double-gated arrivals sanctuary.' },
  { name: '🚁 Gardens Helipad H1', lat: 43.6830, lon: 7.3310, description: 'Pristine lavender runways for private helicopter landings.' },
  { name: '⚓ Riviera Deep-Water Yacht Dock', lat: 43.6812, lon: 7.3315, description: 'Super yacht basin with direct private shuttle tender stairs.' },
  { name: '🏖️ Sunken Infinity Pool Lounge', lat: 43.6835, lon: 7.3338, description: 'Glistening panoramic deck overlooking the azure coastline.' }
];

export const ArrivalsTab: React.FC<ArrivalsTabProps> = ({ vipGuests, flights, userRole = 'operator' }) => {
  // Navigation & View Mode Settings
  const [selectedAirportId, setSelectedAirportId] = useState<string>('zafir');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(14); // local zoom factor (1 to 20)
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'radar-glow'>('radar-glow');

  // Interactive Point of Interest selector for Zafir Hotel grounds
  const [selectedPoi, setSelectedPoi] = useState<{ name: string; lat: number; lon: number; description: string } | null>(null);

  // Multi-touch pinch zoom support
  const [touchStartDist, setTouchStartDist] = useState<number | null>(null);

  // Real-time Approach Simulation loop
  const [approachStep, setApproachStep] = useState<number>(0);
  const [radarLogs, setRadarLogs] = useState<string[]>([]);

  // Retrieve active airport config
  const currentAirportObj = AIRPORTS.find(a => a.id === selectedAirportId) || AIRPORTS[0];

  useEffect(() => {
    // Reset path animation indexing and custom POI focus when airport changes
    setApproachStep(0);
    setSelectedPoi(null);
    if (selectedAirportId === 'zafir') {
      setZoomScale(14); // Focus beautifully into the Hotel Grounds
    } else {
      setZoomScale(3); // Normal approach sector view
    }
    setRadarLogs([
      `[${new Date().toLocaleTimeString()}] INITIATING SATELLITE HANDSHAKE FOR ${currentAirportObj.code} ARD-GRID`,
      `[${new Date().toLocaleTimeString()}] WEATHER: ${currentAirportObj.weather} // TEMP ${currentAirportObj.temp}`,
      `[${new Date().toLocaleTimeString()}] RADAR LINK ACQUIRED // TRACKING ACTIVE TARGET ${currentAirportObj.activeFlight.number}`
    ]);
  }, [selectedAirportId]);

  // Periodic Telemetry Fluctuation Updates
  useEffect(() => {
    const approachTimer = setInterval(() => {
      setApproachStep(prev => {
        const nextStep = (prev + 1) % currentAirportObj.activeFlight.coordsList.length;
        
        // Log update messages for feedback
        const timeStamp = new Date().toLocaleTimeString();
        if (nextStep === 0) {
          setRadarLogs(prevLogs => [
            `[${timeStamp}] 🚨 CYCLE REBOOT: Flight ${currentAirportObj.activeFlight.number} recycled approach sequence.`,
            ...prevLogs.slice(0, 15)
          ]);
        } else if (nextStep === currentAirportObj.activeFlight.coordsList.length - 1) {
          setRadarLogs(prevLogs => [
            `[${timeStamp}] 🛬 TOUCHDOWN CONFIRMED: ${currentAirportObj.activeFlight.number} on Runway ${currentAirportObj.runways[0]}`,
            `[${timeStamp}] Chauffeur operations notified for private gate meeting.`,
            ...prevLogs.slice(0, 14)
          ]);
        } else {
          setRadarLogs(prevLogs => [
            `[${timeStamp}] RAD TRACK: ${currentAirportObj.activeFlight.number} aligned grid point #${nextStep}. Lat: ${currentAirportObj.activeFlight.coordsList[nextStep].lat.toFixed(4)}, Lon: ${currentAirportObj.activeFlight.coordsList[nextStep].lon.toFixed(4)}`,
            ...prevLogs.slice(0, 15)
          ]);
        }
        return nextStep;
      });
    }, 4500);

    return () => clearInterval(approachTimer);
  }, [selectedAirportId]);

  // Determine current flight positions based on approachStep
  const coordsList = currentAirportObj.activeFlight.coordsList;
  const currentCoords = coordsList[approachStep] || coordsList[0];

  // If viewing hotel grounds and a POI is active, center on that POI
  const mapCenterCoords = (selectedAirportId === 'zafir' && selectedPoi)
    ? { lat: selectedPoi.lat, lon: selectedPoi.lon }
    : currentCoords;
  
  // Dynamic altitude & speed progress calculations
  const totalSteps = coordsList.length;
  const altitude = Math.round(
    currentAirportObj.activeFlight.altitudeStart - 
    (approachStep / (totalSteps - 1)) * currentAirportObj.activeFlight.altitudeStart
  );
  const airspeed = Math.round(
    currentAirportObj.activeFlight.speedStart - 
    (approachStep / (totalSteps - 1)) * (currentAirportObj.activeFlight.speedStart - 135)
  );

  // Power-based offset scaling to provide extremely smooth zoom scaling down to high-resolution garden walkthrough detail
  const bboxOffset = 0.06 / Math.pow(1.35, zoomScale - 1); 
  const lonMin = mapCenterCoords.lon - (bboxOffset * 1.5);
  const latMin = mapCenterCoords.lat - bboxOffset;
  const lonMax = mapCenterCoords.lon + (bboxOffset * 1.5);
  const latMax = mapCenterCoords.lat + bboxOffset;
  
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lonMin}%2C${latMin}%2C${lonMax}%2C${latMax}&layer=mapnik&marker=${mapCenterCoords.lat}%2C${mapCenterCoords.lon}`;

  // Interactive Gesture Functions
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchStartDist(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartDist !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = dist - touchStartDist;
      if (Math.abs(diff) > 10) {
        if (diff > 0) {
          setZoomScale(prev => Math.min(20, prev + 1));
        } else {
          setZoomScale(prev => Math.max(1, prev - 1));
        }
        setTouchStartDist(dist);
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchStartDist(null);
  };

  const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY < 0) {
      setZoomScale(prev => Math.min(20, prev + 1));
    } else {
      setZoomScale(prev => Math.max(1, prev - 1));
    }
  };

  // Sparkline arrivals data config - warm colors for luxury light layout
  const chartData = {
    labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
    datasets: [
      {
        label: 'Arrival Density',
        data: [12, 19, 28, 45, 32, 51, 64],
        borderColor: '#c19a6b', // Camel
        backgroundColor: 'rgba(193, 154, 107, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#c19a6b',
        pointBorderColor: '#ffffff',
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#7c5a30',
        bodyColor: '#334155',
        borderColor: 'rgba(193, 154, 107, 0.3)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.04)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.04)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
    },
  };

  return (
    <div className="space-y-6 animate-fade-in" id="arrivals-tab">
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden bg-white/40 dark:bg-obsidian-900/40 shadow-xl border border-white/60 dark:border-obsidian-800/40">
        
        {/* Header Block in Camel & Slate */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-black/5 pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif-luxury font-bold text-slate-800 flex items-center gap-2">
              <Plane className="w-6 h-6 text-sapphire animate-pulse" /> Zafir Arrivals Command
            </h2>
            <p className="text-xs text-slate-600">Real-time aviation maps, live-updating satellite target telemetry & luxury ground chauffeurs</p>
          </div>
          <div className="flex items-center gap-2">
            {userRole === 'operator' ? (
              <span className="text-[10px] bg-sky-500/10 text-sky-700 border border-sky-500/30 px-3 py-1 rounded-lg font-mono font-bold tracking-widest uppercase shadow-sm">
                🛡️ LEVEL-4-ARRIVAL (OPERATOR)
              </span>
            ) : (
              <span className="text-[10px] bg-amber-500/10 text-amber-700 border border-amber-500/30 px-3 py-1 rounded-lg font-mono font-bold tracking-widest uppercase shadow-sm animate-pulse">
                👑 LEVEL-5-PROPRIETOR (MANAGER)
              </span>
            )}
          </div>
        </div>

        {/* Master Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: VIP Guest Operations List (7 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-xs uppercase font-mono text-slate-700 font-bold tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sapphire" /> VIP Guest Chauffeur Scheduler
            </h3>

            <div className="relative border-l border-[#c19a6b]/35 pl-6 ml-3 py-2 space-y-5">
              {vipGuests.map((guest, i) => {
                const isActiveAirportMatch = guest.flight.toLowerCase().includes(currentAirportObj.code.toLowerCase()) || 
                                              (customerFlightMatch(guest.flight, currentAirportObj.code));
                return (
                  <div 
                    key={i} 
                    className={`glass-card relative group p-4 border rounded-2xl transition-all duration-300 ${
                      isActiveAirportMatch 
                        ? 'bg-[#c19a6b]/10 border-[#c19a6b]/50 shadow-md ring-1 ring-[#c19a6b]/30' 
                        : 'bg-white/30 dark:bg-obsidian-950/40 border-white/60 dark:border-obsidian-900/40 hover:border-[#c19a6b]/50'
                    }`}
                  >
                    {/* Decorative timeline pointer */}
                    <div className={`absolute -left-[32px] top-6 w-4.5 h-4.5 rounded-full border-4 border-white ${
                      guest.status.includes('Landed') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                      guest.status.includes('route') ? 'bg-[#c19a6b] shadow-[0_0_8px_rgba(193,154,107,0.3)]' : 'bg-sky-500'
                    }`} />

                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#7c5a30] bg-[#c19a6b]/20 px-2 py-0.5 rounded border border-[#c19a6b]/35">
                        {guest.vip}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono font-bold">{guest.flight}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      {guest.name}
                      {isActiveAirportMatch && (
                        <span className="text-[9px] bg-red-500/15 text-red-600 border border-red-500/25 px-1.5 py-0.2 rounded font-mono font-bold animate-pulse">
                          TRACKED INBOUND
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{guest.info}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Real Dynamic Live Map & Aviation HUD (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-mono text-slate-700 font-bold tracking-widest flex items-center gap-1.5">
                <Map className="w-3.5 h-3.5 text-sapphire" /> Aviation Maps & Telemetry
              </h3>

              {/* Quick Airport Selector Tabs */}
              <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-stone-900/60 p-0.5 rounded-xl border border-black/5">
                {AIRPORTS.map(ap => (
                  <button
                    key={ap.id}
                    onClick={() => setSelectedAirportId(ap.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-extrabold uppercase transition-all cursor-pointer ${
                      selectedAirportId === ap.id
                        ? 'bg-[#c19a6b] text-[#121214] shadow-xs'
                        : 'text-slate-600 hover:text-[#7c5a30]'
                    }`}
                  >
                    {ap.code}
                  </button>
                ))}
              </div>
            </div>

            {/* REAL MAP CONTAINER BLOCK */}
            <div className="glass-card p-4 bg-white/30 dark:bg-obsidian-950/40 border border-white/60 dark:border-obsidian-900/40 rounded-3xl space-y-4 relative overflow-hidden">
              
              {/* CURRENT SELECTED HUB HEADER DETAILS */}
              <div className="bg-[#fbf9f4]/80 dark:bg-stone-950/40 border border-black/5 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">{currentAirportObj.name}</h4>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                    Hub Center: <span className="text-[#7c5a30] font-bold">{mapCenterCoords.lat.toFixed(4)}°N, {mapCenterCoords.lon.toFixed(4)}°W</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/25 p-1 px-2 rounded-lg leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    LIVE POSITION
                  </span>
                  <p className="text-[10px] text-slate-600 font-mono mt-1 leading-none">{currentAirportObj.temp} | {currentAirportObj.windSpeed}</p>
                </div>
              </div>

              {/* SPECIAL HOTEL ESTATE GROUND POINTS-OF-INTEREST SECTION */}
              {selectedAirportId === 'zafir' && (
                <div className="bg-[#faf6f0] dark:bg-stone-900/40 p-3 rounded-2xl border border-[#c19a6b]/35 space-y-1.5 transition-all">
                  <span className="text-[10px] uppercase font-mono text-[#7c5a30] font-bold tracking-widest block">
                    📍 Examine Palace Grounds Walkways & POIs:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setSelectedPoi(null)}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase transition border ${
                        !selectedPoi
                          ? 'bg-[#c19a6b] text-slate-950 border-[#c19a6b]'
                          : 'bg-white/60 hover:bg-white text-slate-700 hover:text-slate-900 border-black/5'
                      }`}
                    >
                      🛸 Heli approach tracking
                    </button>
                    {ZAFIR_POIS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedPoi(p);
                          setZoomScale(16); // High detail zoom
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase transition border whitespace-nowrap ${
                          selectedPoi?.name === p.name
                            ? 'bg-[#7c5a30] text-white border-[#7c5a30] shadow-sm'
                            : 'bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 border-black/5'
                        }`}
                      >
                        {p.name.split(' ')[0]} {p.name.replace(/^[^ ]+\s/, '')}
                      </button>
                    ))}
                  </div>
                  {selectedPoi && (
                    <p className="text-[9px] text-slate-500 font-mono italic leading-normal pt-1 border-t border-black/5">
                      {selectedPoi.description} (GPS: <span className="text-[#7c5a30] font-bold">{selectedPoi.lat.toFixed(4)}°N, {selectedPoi.lon.toFixed(4)}°E</span>)
                    </p>
                  )}
                </div>
              )}

              {/* REAL LIVE-EMBEDDED OPENSTREETMAP IFRAME WITH PINCH & WHEEL SCROLL ZOOM */}
              <div 
                onWheel={handleWheelZoom}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-full relative rounded-2xl overflow-hidden border border-[#c19a6b]/35 shadow-inner bg-[#f1eedf] flex items-center justify-center group h-64 min-h-[256px]"
              >
                
                {/* Radar sweep scanning line overlay */}
                {mapStyle === 'radar-glow' && (
                  <span className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c19a6b] to-transparent z-10 scan-bar pointer-events-none" />
                )}

                {/* THE ACTUAL LIVE STREET MAPS MAP */}
                <iframe
                  title="Live OpenStreetMap Tracking Terminal"
                  src={osmEmbedUrl}
                  className={`w-full h-full border-none transition-all duration-300 absolute inset-0 ${
                    mapStyle === 'radar-glow' 
                      ? 'map-darkness-filter' 
                      : (mapStyle === 'satellite' ? 'map-vintage-filter' : '')
                  }`}
                  allowFullScreen
                />

                {/* Tactical HUD Overlay Details */}
                <div className="absolute top-3 left-3 bg-slate-900/90 text-white rounded-xl p-2.5 font-mono text-[9px] border border-[#c19a6b]/40 backdrop-blur-md shadow-lg pointer-events-none space-y-1 z-20">
                  <p className="text-[#c19a6b] font-bold flex items-center gap-1.5 animate-pulse">
                    <Radio className="w-3.5 h-3.5 text-[#c19a6b]" /> TARGET ACQUISITION
                  </p>
                  <p>CALLSIGN: <span className="text-white font-extrabold">{currentAirportObj.activeFlight.number}</span></p>
                  <p>ALTITUDE: <span className="text-[#c19a6b] font-bold">{altitude.toLocaleString()} FT</span></p>
                  <p>AIRSPEED: <span className="text-[#c19a6b] font-bold">{airspeed} KTS</span></p>
                  <p>LAT/LON: {mapCenterCoords.lat.toFixed(4)}, {mapCenterCoords.lon.toFixed(4)}</p>
                  <p>PILOT: {currentAirportObj.activeFlight.pilot}</p>
                  
                  {/* Status Indicator Bar */}
                  <div className="pt-1 select-none">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      altitude <= 1000 ? 'bg-red-500 text-white animate-bounce' : 'bg-emerald-500 text-slate-950'
                    }`}>
                      {altitude <= 1000 ? 'TOUCHDOWN APPROACH STATUS' : 'AUTOPILOT approach vector'}
                    </span>
                  </div>
                </div>

                {/* PINCH / SCROLL HELPER OVERLAY */}
                <div className="absolute top-3 right-3 select-none pointer-events-none z-20 bg-slate-950/75 border border-[#c19a6b]/35 text-[8.5px] font-mono text-white/90 p-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-wide">
                  💡 Zoom with Wheel or Pinch
                </div>

                {/* ZOOM CONTROLS & AGRANDIR COMPASS CONTROLLER GRID */}
                <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-20">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-2.5 bg-white/90 hover:bg-white text-slate-800 rounded-xl hover:text-sapphire border border-slate-300 hover:border-[#c19a6b] transition shadow-md cursor-pointer flex items-center justify-center gap-1"
                    title="Agrandir la carte / Enlarge Live Navigation"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span className="text-[9.5px] font-extrabold font-mono tracking-widest uppercase px-1">AGRANDIR / ENLARGE</span>
                  </button>
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      onClick={() => setZoomScale(p => Math.max(1, p - 1))}
                      className="w-8 h-8 font-serif bg-white/95 text-slate-800 font-bold rounded-lg border border-slate-300 hover:border-[#c19a6b] select-none hover:bg-slate-50 transition shadow text-xs cursor-pointer"
                      title="Zoom Out"
                    >
                      -
                    </button>
                    <button 
                      onClick={() => setZoomScale(p => Math.min(20, p + 1))}
                      className="w-8 h-8 font-serif bg-white/95 text-slate-800 font-semibold rounded-lg border border-slate-300 hover:border-[#c19a6b] select-none hover:bg-slate-50 transition shadow text-xs cursor-pointer"
                      title="Zoom In"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Radar sweep scanning bar animation styles */}
                <style>{`
                  @keyframes scanner {
                    0%, 100% { top: 0%; opacity: 0.15; }
                    50% { top: 100%; opacity: 0.7; }
                  }
                  .scan-bar {
                    animation: scanner 4s linear infinite;
                  }
                  .map-darkness-filter {
                    filter: invert(90%) hue-rotate(190deg) brightness(0.85) contrast(1.1);
                  }
                  .map-vintage-filter {
                    filter: sepia(0.3) saturate(1.2) contrast(1.05) brightness(0.95);
                  }
                `}</style>
              </div>

              {/* MAP RENDERING STYLE CHANGER WIDGET */}
              <div className="flex items-center justify-between text-[10px] font-mono border-t border-black/5 pt-3">
                <span className="font-bold text-slate-500 uppercase tracking-widest">MAP RENDERING MODE:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setMapStyle('radar-glow')}
                    className={`px-2 py-0.5 rounded-lg border uppercase font-extrabold ${
                      mapStyle === 'radar-glow'
                        ? 'bg-sapphire/15 border-sapphire/45 text-sapphire dark:text-blue-400'
                        : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    CYAN RADAR
                  </button>
                  <button
                    onClick={() => setMapStyle('standard')}
                    className={`px-2 py-0.5 rounded-lg border uppercase font-extrabold ${
                      mapStyle === 'standard'
                        ? 'bg-sky-500/10 border-sky-500/30 text-sky-700'
                        : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    STREET VECT
                  </button>
                  <button
                    onClick={() => setMapStyle('satellite')}
                    className={`px-2 py-0.5 rounded-lg border uppercase font-extrabold ${
                      mapStyle === 'satellite'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-700'
                        : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    VINTAGE TONER
                  </button>
                </div>
              </div>

              {/* Sparklines via ChartJS */}
              <div className="space-y-1.5 pt-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Airport Density Workload Rate</span>
                  <span className="text-[#7c5a30] font-mono font-bold">+18% vs yesterday</span>
                </div>
                <div className="h-28 w-full bg-white/20 rounded-xl p-2 border border-white/50">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Active Flight Schedule */}
              <div className="space-y-2 mt-4">
                <span className="text-[10px] uppercase font-mono text-slate-600 font-bold tracking-widest block">Flight Schedule</span>
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
                  {flights.map(f => (
                    <div key={f.id} className="p-2.5 bg-white/30 border border-white/50 rounded-xl font-mono text-[10px] space-y-1 shadow-sm">
                      <div className="text-slate-800 font-bold flex justify-between items-center">
                        <span>{f.id}</span>
                        <span className="text-[#7c5a30]">{f.time}</span>
                      </div>
                      <div className="text-slate-600 uppercase tracking-widest">{f.status}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* ========================================================
         ENLARGE MAP OVERLAY DIALOG MODAL (COMPREHENSIVE EXPLORATION)
         ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 z-55 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#121318] rounded-3xl border-2 border-[#c19a6b]/80 shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden relative">
            
            {/* Header Area */}
            <div className="bg-slate-100 dark:bg-stone-900 px-6 py-4 border-b border-[#c19a6b]/35 flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-[#c19a6b]/20 text-[#7c5a30] px-2 py-0.5 rounded font-mono font-bold tracking-widest uppercase mr-2.5">
                  PRESTIGE AVIATION HUD
                </span>
                <h3 className="text-lg font-serif-luxury font-bold text-slate-800 dark:text-stone-100 inline-block align-middle">
                  Interactive High-Resolution Navigation Radar: {currentAirportObj.city} ({currentAirportObj.code})
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 px-3 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-mono text-xs uppercase font-bold transition flex items-center gap-1 cursor-pointer"
                title="Fermer l'image / Close Modal"
              >
                <X className="w-4 h-4" />
                <span>FERMER / CLOSE</span>
              </button>
            </div>

            {/* Modal Body: Split view layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#faf8f4] dark:bg-black/40">
              
              {/* LARGE REAL MAP STRETCHED VIEW (8 cols) */}
              <div className="lg:col-span-8 p-4 relative flex flex-col justify-between overflow-hidden border-r border-[#c19a6b]/20">
                <div 
                  onWheel={handleWheelZoom}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="flex-1 w-full relative rounded-2xl overflow-hidden border border-[#c19a6b]/30 shadow-2xl bg-[#e3dfd3] group"
                >
                  {/* Sweep scanline overlay */}
                  {mapStyle === 'radar-glow' && (
                    <span className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#c19a6b] to-transparent z-10 scan-bar pointer-events-none" />
                  )}

                  {/* LARGE IFRAME MAP OF REAL-TIME GPS COORDINATES */}
                  <iframe
                    title="Detailed Jet-Way Monitor Map"
                    src={osmEmbedUrl}
                    className={`w-full h-full border-none transition-all duration-300 absolute inset-0 ${
                      mapStyle === 'radar-glow' 
                        ? 'map-darkness-filter' 
                        : (mapStyle === 'satellite' ? 'map-vintage-filter' : '')
                    }`}
                  />

                  {/* Satellite Signal Indicator */}
                  <div className="absolute top-4 left-4 bg-slate-900/95 text-white rounded-full p-2.5 px-4 font-mono text-[9px] border border-[#c19a6b]/35 shadow-xl flex items-center gap-2.5 z-20 pointer-events-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-extrabold text-[#c19a6b]">GPS CONNECTED</span>
                    <span className="text-slate-400">| SAT_ID: S-71 ZAFIR // HDOP: 0.92 // SIGNAL_SNR: 44dB // MODE: INTERACTIVE PINCH ZOOM</span>
                  </div>

                  {/* PINCH / SCROLL HELPER OVERLAY */}
                  <div className="absolute top-4 right-14 select-none pointer-events-none z-20 bg-slate-950/85 border border-[#c19a6b]/35 text-[9px] font-mono text-[#c19a6b] p-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-wider shadow-lg">
                    💡 Gesture-Active: Zoom with mouse wheel or pinch fingers
                  </div>

                  {/* ZOOM MULTIPLIER SLIDER */}
                  <div className="absolute bottom-4 left-4 bg-slate-900/90 text-white rounded-xl p-3 border border-[#c19a6b]/40 backdrop-blur-md shadow-xl z-20 w-64 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span>RADAR GRID ZOOM FACTOR:</span>
                      <span className="text-[#c19a6b] font-bold">X {zoomScale} / 20</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="20" 
                      value={zoomScale} 
                      onChange={(e) => setZoomScale(Number(e.target.value))}
                      className="w-full h-1 bg-[#c19a6b]/30 rounded-lg appearance-none cursor-pointer accent-[#c19a6b]"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-slate-400 select-none">
                      <span>WIDE SECTOR (X1)</span>
                      <span>ULTRA DETAIL (X20)</span>
                    </div>
                  </div>

                  {/* Compass directions detail overlay */}
                  <div className="absolute top-4 right-4 bg-slate-900/90 p-2.5 rounded-xl border border-[#c19a6b]/35 text-[#c19a6b] font-mono text-[9px] text-center w-14 shadow-lg pointer-events-none z-20 gap-0.5 flex flex-col items-center">
                    <Compass className="w-5 h-5 animate-spin-slow text-[#c19a6b]" />
                    <span className="font-bold text-[8px]">N // 0°</span>
                  </div>
                </div>

                {/* ZOOM CONTROLS IN SIDEBAR */}
                <div className="flex items-center justify-between mt-3 text-xs text-slate-600 bg-slate-100 dark:bg-stone-900/60 p-2.5 rounded-xl border border-black/5">
                  <span className="font-mono text-[10px]">
                    Approaching: <span className="text-[#7c5a30] font-bold">{currentAirportObj.activeFlight.number}</span> | Alt: {altitude.toLocaleString()} ft | Spd: {airspeed} kts | Target: {selectedPoi ? selectedPoi.name : 'Flight Approach Track'}
                  </span>
                  <div className="flex gap-1.5">
                    {AIRPORTS.map(ap => (
                      <button
                        key={ap.id}
                        onClick={() => setSelectedAirportId(ap.id)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-mono font-extrabold uppercase transition-all cursor-pointer ${
                          selectedAirportId === ap.id
                            ? 'bg-[#c19a6b] text-[#121214] shadow'
                            : 'text-slate-600 hover:text-[#7c5a30]'
                        }`}
                      >
                        {ap.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* LIVE COGNITIVE RADAR ANALYTICS TABS (4 cols) */}
              <div className="lg:col-span-4 p-5 flex flex-col justify-between overflow-y-auto space-y-5 bg-white dark:bg-stone-950/20">
                
                {/* Active Flight Profile Detailed View */}
                <div className="space-y-3">
                  {selectedAirportId === 'zafir' && (
                    <div className="bg-[#fbf9f4] dark:bg-stone-900/80 p-3.5 rounded-2xl border border-[#c19a6b]/35 space-y-2 mb-4">
                      <h4 className="text-[10.5px] uppercase font-mono text-[#7c5a30] font-bold tracking-widest border-b border-[#c19a6b]/20 pb-1 flex items-center gap-1">
                        📍 PALACE WALKWAYS & POINTS OF INTEREST
                      </h4>
                      <p className="text-[9.5px] text-slate-500 font-mono leading-relaxed">
                        Centering high-resolution lens arrays on estate grounds structures:
                      </p>
                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        <button
                          onClick={() => setSelectedPoi(null)}
                          className={`w-full text-left p-2 rounded-xl text-[10px] font-mono font-bold transition border ${
                            !selectedPoi
                              ? 'bg-[#c19a6b] text-slate-950 border-[#c19a6b] shadow-sm'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-black/5'
                          }`}
                        >
                          🛰️ Standard helicopter flight route
                        </button>
                        {ZAFIR_POIS.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedPoi(p);
                              setZoomScale(18); // Extreme High zoom
                            }}
                            className={`w-full text-left p-2 rounded-xl text-[10px] font-mono font-bold transition border ${
                              selectedPoi?.name === p.name
                                ? 'bg-[#7c5a30] text-white border-[#7c5a30] shadow-sm'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-black/5'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span>{p.name}</span>
                              <span className="text-[8px] font-normal text-slate-400">18x Zoom</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      {selectedPoi && (
                        <div className="p-2 bg-white rounded-xl border border-black/5 text-[9.5px] text-slate-500 font-mono">
                          <p className="font-bold text-[#7c5a30]">Active target location info:</p>
                          <p className="mt-0.5">{selectedPoi.description}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <h4 className="text-xs uppercase font-mono text-[#c19a6b] font-bold tracking-wider flex items-center gap-1 border-b border-[#c19a6b]/20 pb-1.5">
                    <Info className="w-4 h-4 text-sapphire" /> Telemetry Flight Card
                  </h4>
                  <div className="p-3 bg-slate-50 dark:bg-stone-900/50 rounded-2xl border border-black/5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">TRACK ID:</span>
                      <span className="text-slate-800 font-bold font-mono">{currentAirportObj.activeFlight.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">AIRCRAFT:</span>
                      <span className="text-slate-800 font-bold">{currentAirportObj.activeFlight.aircraft}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">ORIGIN ROUTE:</span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold font-mono">{currentAirportObj.activeFlight.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">CAPTAIN PILOT:</span>
                      <span className="text-slate-800 font-bold">{currentAirportObj.activeFlight.pilot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">AIRPORT GATE:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">CONCIERGE GATE T-0B</span>
                    </div>
                  </div>
                </div>

                {/* Weather Matrix & Active Runways */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-mono text-slate-700 font-bold tracking-wider flex items-center gap-1">
                    <Wind className="w-4 h-4 text-sapphire" /> Destination Weather Matrix
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 font-mono text-[10px]">
                    <div className="p-2.5 bg-[#fbf9f4] dark:bg-stone-900/30 border border-black/5 rounded-xl">
                      <p className="text-slate-400 uppercase tracking-widest leading-none mb-1">TEMPERATURE</p>
                      <p className="text-sm font-extrabold text-slate-800">{currentAirportObj.temp}</p>
                    </div>
                    <div className="p-2.5 bg-[#fbf9f4] dark:bg-stone-900/30 border border-black/5 rounded-xl">
                      <p className="text-slate-400 uppercase tracking-widest leading-none mb-1">WIND SPEEDS</p>
                      <p className="text-sm font-extrabold text-slate-800">{currentAirportObj.windSpeed}</p>
                    </div>
                    <div className="p-2.5 bg-[#fbf9f4] dark:bg-stone-900/30 border border-black/5 rounded-xl">
                      <p className="text-slate-400 uppercase tracking-widest leading-none mb-1">HEADING ANGLE</p>
                      <p className="text-sm font-extrabold text-slate-800">{currentAirportObj.windDir}</p>
                    </div>
                    <div className="p-2.5 bg-[#fbf9f4] dark:bg-stone-900/30 border border-black/5 rounded-xl">
                      <p className="text-slate-400 uppercase tracking-widest leading-none mb-1">RUNWAYS VECTOR</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{currentAirportObj.runways.slice(0,2).join(' / ')}</p>
                    </div>
                  </div>
                </div>

                {/* Real-time Telemetry Terminal Logs Console */}
                <div className="flex-1 flex flex-col min-h-[140px]">
                  <h4 className="text-xs uppercase font-mono text-slate-700 font-bold tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-sapphire" /> Log Trace Terminal Output
                  </h4>
                  <div className="flex-1 bg-slate-900 dark:bg-black p-3.5 rounded-2xl font-mono text-[9.5px] text-[#c19a6b] overflow-y-auto space-y-1.5 border border-[#c19a6b]/20 h-44">
                    {radarLogs.map((log, index) => (
                      <p key={index} className="leading-relaxed whitespace-pre-wrap break-all opacity-85 hover:opacity-100 transition">
                        {log}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Prestige Ground Concierge Actions */}
                <div className="bg-[#c19a6b]/10 border border-[#c19a6b]/50 p-3.5 rounded-2xl flex items-center justify-between uppercase font-mono text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-extrabold text-[#7c5a30]">Chauffeur Stand-By Active</span>
                  </div>
                  <button 
                    onClick={() => {
                      alert(`Sent alert coordinate updates for ${currentAirportObj.activeFlight.number} approaching ${currentAirportObj.city} to assigned private chauffeur!`);
                    }} 
                    className="p-1 px-2.5 bg-[#c19a6b] hover:bg-[#7c5a30] hover:text-white text-slate-950 font-bold rounded-lg transition-all cursor-pointer"
                  >
                    ALERT CHAUFFEUR
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

// Simple utility function to match helper custom VIP airport codes depending on input length
function customerFlightMatch(guestFlight: string, airportCode: string): boolean {
  if (!guestFlight) return false;
  const cleaned = guestFlight.toUpperCase();
  if (cleaned.includes(airportCode.toUpperCase())) return true;
  // Fallbacks for JFK
  if (airportCode === 'JFK' && (cleaned.includes('NEW YORK') || cleaned.includes('JFK') || cleaned.includes('AF015') || cleaned.includes('BA178'))) return true;
  if (airportCode === 'LHR' && (cleaned.includes('LONDON') || cleaned.includes('HEATHROW') || cleaned.includes('LHR'))) return true;
  if (airportCode === 'CDG' && (cleaned.includes('PARIS') || cleaned.includes('CDG'))) return true;
  if (airportCode === 'DXB' && (cleaned.includes('DUBAI') || cleaned.includes('DXB'))) return true;
  return false;
}
