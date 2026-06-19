import React from 'react';
import { Plane, Clock, Map } from 'lucide-react';
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

export const ArrivalsTab: React.FC<ArrivalsTabProps> = ({ vipGuests, flights, userRole = 'operator' }) => {
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
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden bg-white/40 shadow-xl border border-white/60">
        
        {/* Header Block in Camel & Slate */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-black/5 pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif-luxury font-bold text-slate-800 flex items-center gap-2">
              <Plane className="w-6 h-6 text-[#c19a6b]" /> Zafir Arrivals Command
            </h2>
            <p className="text-xs text-slate-600">Live flight tracking, VIP chauffeur handshakes & luxury arrivals scheduler</p>
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

        {/* Master Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Guest Timeline */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs uppercase font-mono text-slate-700 font-bold tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#c19a6b]" /> VIP Guest Operations
            </h3>

            <div className="relative border-l border-[#c19a6b]/35 pl-6 ml-3 py-2 space-y-6">
              {vipGuests.map((guest, i) => (
                <div key={i} className="relative group p-4 bg-white/30 border border-white/60 rounded-2xl hover:border-[#c19a6b]/60 transition-all duration-300 shadow-sm">
                  
                  {/* Decorative timeline pointer */}
                  <div className={`absolute -left-[32px] top-6 w-4.5 h-4.5 rounded-full border-4 border-white ${
                    guest.status.includes('Landed') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                    guest.status.includes('route') ? 'bg-[#c19a6b] shadow-[0_0_8px_rgba(193,154,107,0.3)]' : 'bg-sky-500'
                  }`} />

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-[#7c5a30] bg-[#c19a6b]/20 px-2 py-0.5 rounded border border-[#c19a6b]/30">
                      {guest.vip}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{guest.flight}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-800">{guest.name}</h4>
                  <p className="text-xs text-slate-600 mt-1">{guest.info}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive SVG World Flight Path Tracker */}
          <div className="lg:col-span-5 space-y-5">
            <h3 className="text-xs uppercase font-mono text-slate-700 font-bold tracking-widest flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-[#c19a6b]" /> Live Global Skyways
            </h3>

            <div className="p-4 bg-white/30 border border-white/60 rounded-3xl space-y-4 shadow-sm">
              
              {/* Premium light-styled map SVG */}
              <div className="w-full relative rounded-2xl overflow-hidden border border-white/50 bg-[#fbf9f4] p-1 flex items-center justify-center shadow-inner">
                
                {/* Scanner scanning bar CSS animation */}
                <span className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c19a6b] to-transparent z-10 scan-bar" />
                <style>{`
                  @keyframes scanner {
                    0%, 100% { top: 0%; opacity: 0.15; }
                    50% { top: 100%; opacity: 0.7; }
                  }
                  .scan-bar {
                    animation: scanner 4s linear infinite;
                  }
                  .animate-dash {
                    stroke-dasharray: 4, 4;
                    stroke-dashoffset: 0;
                    animation: dashFlow 8s linear infinite;
                  }
                  @keyframes dashFlow {
                    to { stroke-dashoffset: -40; }
                  }
                `}</style>

                <svg viewBox="0 0 400 200" className="w-full h-auto">
                  <defs>
                    <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f3f1e9"/>
                      <stop offset="100%" stopColor="#e9e5d9"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Ocean Base */}
                  <rect width="400" height="200" fill="url(#oceanGrad)" rx="12"/>
                  
                  {/* Continent vectors */}
                  <g fill="#c19a6b" opacity="0.3">
                    {/* North America */}
                    <path d="M20,40 Q25,35 45,30 T80,45 L90,65 L85,85 T60,95 L40,85 L20,70 Z" />
                    {/* South America */}
                    <path d="M75,100 T95,115 L100,140 L90,175 L80,165 T70,120 Z" />
                    {/* Europe & Asia & Middle East */}
                    <path d="M150,30 Q190,25 240,30 T320,45 L340,65 L330,85 T280,95 L220,110 L180,95 T150,75 Z" />
                    {/* Africa */}
                    <path d="M170,75 Q210,70 215,95 L225,125 L210,160 L195,145 T175,105 Z" />
                    {/* Australia */}
                    <path d="M300,125 Q325,120 345,130 L350,150 L330,165 L305,150 Z" />
                  </g>

                  {/* Flight Lines */}
                  <g fill="none" strokeWidth="1.2">
                    {/* LHR to JFK (Europe to North America) */}
                    <path d="M185,55 Q115,25 65,60" stroke="#7c5a30" className="animate-dash" />
                    {/* DXB to JFK (Middle East to North America) */}
                    <path d="M215,80 Q145,25 65,60" stroke="#0284c7" strokeDasharray="3 3" />
                    {/* CDG to JFK */}
                    <path d="M190,60 Q120,35 65,60" stroke="#d97706" className="animate-dash" strokeWidth="0.8" />
                  </g>

                  {/* Airplanes along routes */}
                  <g fill="#7c5a30" transform="translate(115, 38) rotate(-15)">
                    <path d="M-6,0 L6,0 L4,2 L6,4 L2,4 L0,6 L-2,4 L-6,4 L-4,2 Z" />
                  </g>
                  <g fill="#0284c7" transform="translate(130, 52) rotate(-8)">
                    <path d="M-5,0 L5,0 L3,2 L5,4 L2,4 L0,5 L-2,4 L-5,4 L-3,2 Z" />
                  </g>

                  {/* City hubs dots */}
                  <g fill="#fff">
                    {/* JFK */}
                    <circle cx="65" cy="60" r="4.5" fill="#c19a6b" stroke="#ffffff" strokeWidth="1.2" className="animate-pulse" />
                    <circle cx="65" cy="60" r="2" fill="#7c5a30" />
                    {/* LHR */}
                    <circle cx="185" cy="55" r="3" fill="#7c5a30" />
                    {/* DXB */}
                    <circle cx="215" cy="80" r="3" fill="#0284c7" />
                    {/* CDG */}
                    <circle cx="190" cy="60" r="2.5" fill="#d97706" />
                  </g>
                </svg>

                {/* Satellite status bubble */}
                <div className="absolute bottom-3 left-3 bg-white/80 p-1.5 px-3 rounded-lg border border-white/60 backdrop-blur font-mono text-[9px] text-[#7c5a30] flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>GPS POSITION MATCH 100% // NO ACTIVE DEVIATION</span>
                </div>
              </div>

              {/* Sparklines via ChartJS */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Live Airport Traffic Rate</span>
                  <span className="text-[#7c5a30] font-mono font-bold">+18% vs yesterday</span>
                </div>
                <div className="h-28 w-full bg-white/20 rounded-xl p-2 border border-white/50">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Active Flight Schedule */}
              <div className="space-y-2 mt-4">
                <span className="text-[10px] uppercase font-mono text-slate-600 font-bold tracking-widest block">Flight Schedule</span>
                <div className="grid grid-cols-3 gap-3">
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
    </div>
  );
};
