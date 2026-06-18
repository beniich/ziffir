import React from 'react';
import { Crown } from 'lucide-react';
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

export const MembershipsTab: React.FC = () => {
  // ChartJS configs for MRR growth
  const mrrData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'MRR Growth ($K)',
        data: [820, 880, 920, 980, 1050, 1100, 1180, 1250],
        borderColor: '#7c5a30', // Camel Accent
        backgroundColor: 'rgba(193, 154, 107, 0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const retentionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Retention %',
        data: [91, 92, 90, 93, 92, 94, 93, 94.5],
        borderColor: '#7c5a30',
        backgroundColor: 'rgba(193, 154, 107, 0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <div className="space-y-6 animate-fade-in" id="memberships-tab">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Metal card 1: Platinum Card MRR */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[300px] border border-white/60 flex flex-col justify-between group p-8">
          
          {/* SVG Brushed Platinum Metal card background with linear gradient */}
          <svg viewBox="0 0 500 300" className="absolute inset-0 w-full h-full object-cover select-none z-0" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="platinumPlate" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f3f8f7" />
                <stop offset="40%" stopColor="#e0ebec" />
                <stop offset="70%" stopColor="#cbdce0" />
                <stop offset="90%" stopColor="#d2c3b4" />
                <stop offset="100%" stopColor="#9a8163" />
              </linearGradient>
            </defs>
            <rect width="500" height="300" fill="url(#platinumPlate)" />
            {/* Brushed horizontal lines helper */}
            <g opacity="0.12" stroke="#555" strokeWidth="0.5">
              <line x1="0" y1="20" x2="500" y2="20" />
              <line x1="0" y1="50" x2="500" y2="50" />
              <line x1="0" y1="90" x2="500" y2="90" />
              <line x1="0" y1="140" x2="500" y2="140" />
              <line x1="0" y1="190" x2="500" y2="190" />
              <line x1="0" y1="240" x2="500" y2="240" />
            </g>
            {/* Linear reflection lens */}
            <path d="M-50,0 Q180,150 490,0 L500,40 Q180,190 -10,40 Z" fill="#fff" opacity="0.3" />
          </svg>
          
          {/* Overlay glow effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#c19a6b]/20 via-transparent to-transparent opacity-60 z-0 pointer-events-none" />

          {/* Card Meta Content */}
          <div className="relative z-10 w-full flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-700 font-bold">Monthly Recurring Revenue</span>
              <h3 className="text-3xl sm:text-4xl font-mono font-bold text-slate-800 tracking-tight mt-1">$1,250,000</h3>
              <p className="text-xs text-emerald-700 font-mono mt-1 font-semibold flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                +8.5% MRR Gain vs last month
              </p>
            </div>
            {/* Holographic chip SVG */}
            <div className="w-12 h-10 bg-gradient-to-tr from-[#c19a6b] via-[#FFF3DE] to-[#a36e44] rounded-lg p-[1px] shadow">
              <div className="w-full h-full bg-white/80 rounded-lg flex items-center justify-center">
                <span className="font-mono text-[7px] text-[#7c5a30] font-bold">Z_SEC</span>
              </div>
            </div>
          </div>

          {/* Interactive Chart.js Area inside Card */}
          <div className="relative z-10 h-24 w-full">
            <Line data={mrrData} options={chartOptions} />
          </div>

          <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-slate-600 font-bold">
            <span>ZAFIR VIP PRESTIGE LEAGUE</span>
            <span>EXPIRES: 12/29</span>
          </div>

        </div>

        {/* Metal card 2: Gold Card Retention Rate */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[300px] border border-white/60 flex flex-col justify-between group p-8">
          
          <svg viewBox="0 0 500 300" className="absolute inset-0 w-full h-full object-cover select-none z-0" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="goldPlate" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fdfaf4" />
                <stop offset="30%" stopColor="#f5e1c4" />
                <stop offset="60%" stopColor="#e0c79e" />
                <stop offset="90%" stopColor="#c59263" />
                <stop offset="100%" stopColor="#825732" />
              </linearGradient>
            </defs>
            <rect width="500" height="300" fill="url(#goldPlate)" />
            <g opacity="0.12" stroke="#555" strokeWidth="0.5">
              <line x1="0" y1="30" x2="500" y2="30" />
              <line x1="0" y1="70" x2="500" y2="70" />
              <line x1="0" y1="120" x2="500" y2="120" />
              <line x1="0" y1="170" x2="500" y2="170" />
              <line x1="0" y1="210" x2="500" y2="210" />
            </g>
            <path d="M-50,0 Q180,150 490,0 L500,40 Q180,190 -10,40 Z" fill="#fff" opacity="0.3" />
          </svg>

          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60 z-0 pointer-events-none" />

          <div className="relative z-10 w-full flex justify-between items-start text-right">
            <div className="w-12 h-10 bg-gradient-to-tr from-[#FFF3DE] via-[#c19a6b] to-[#7c5a30] rounded-lg p-[1px] shadow">
              <div className="w-full h-full bg-white/80 rounded-lg flex items-center justify-center">
                <span className="font-mono text-[7px] text-[#7c5a30] font-bold">Z_SEC</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-700 font-bold">Member Retention Rate</span>
              <h3 className="text-3xl sm:text-4xl font-mono font-bold text-slate-800 tracking-tight mt-1">94.5%</h3>
              <p className="text-xs text-emerald-700 font-mono mt-1 font-semibold flex items-center justify-end gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                +1.2% Retention Stability
              </p>
            </div>
          </div>

          <div className="relative z-10 h-24 w-full">
            <Line data={retentionData} options={chartOptions} />
          </div>

          <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-slate-600 font-bold">
            <span>EXECUTIVE ACCESS DECREE</span>
            <span>LEVEL 4 SIGNATURE SYSTEM</span>
          </div>

        </div>

      </div>

      {/* Member Lists block */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 bg-white/40 border border-white/60 shadow-xl">
        <h3 className="text-xl font-serif-luxury text-slate-800 font-bold mb-6 flex items-center gap-2">
          <Crown className="w-5 h-5 text-[#c19a6b]" /> Elite Sovereign Club Registry
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 bg-white/45 border border-white/60 rounded-2xl flex flex-col justify-between hover:border-[#c19a6b]/70 transition-colors duration-300 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-slate-800 font-serif-luxury text-base">Mr. Arthur Dubois</h4>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-[#c19a6b]/35 bg-[#c19a6b]/20 text-[#7c5a30]">PLATINUM</span>
            </div>
            <p className="text-xs text-slate-600 font-mono">Active Registry Node ID // #74FD-0</p>
          </div>

          <div className="p-4 bg-white/45 border border-white/60 rounded-2xl flex flex-col justify-between hover:border-[#c19a6b]/70 transition-colors duration-300 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-slate-800 font-serif-luxury text-base">Ms. Elena Petrova</h4>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-[#c19a6b]/35 bg-[#c19a6b]/20 text-[#7c5a30]">GOLD REGISTRY</span>
            </div>
            <p className="text-xs text-slate-600 font-mono">Active Registry Node ID // #9ac7-1</p>
          </div>

          <div className="p-4 bg-white/45 border border-white/60 rounded-2xl flex flex-col justify-between hover:border-[#c19a6b]/70 transition-colors duration-300 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-slate-800 font-serif-luxury text-base">Dr. Hassan Al-Fayed</h4>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-slate-300 bg-slate-700 text-amber-50">OBSIDIAN BLACK</span>
            </div>
            <p className="text-xs text-slate-600 font-mono">Active Registry Node ID // #00FF-A</p>
          </div>

        </div>
      </section>

    </div>
  );
};
