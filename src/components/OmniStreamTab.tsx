import React from 'react';
import { Activity, Instagram, Mail, Star } from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const OmniStreamTab: React.FC = () => {
  // ChartJS Data Configurations
  const barChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [120, 145, 132, 160, 148, 180, 152],
        backgroundColor: '#c19a6b', // Camel
        borderRadius: 5,
        borderSkipped: false,
      },
    ],
  };

  const doughnutData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [85, 10, 5],
        backgroundColor: ['#10b981', '#c19a6b', '#ef4444'], // green, camel, red
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const lineChartData = {
    labels: ['Segment 1', 'Segment 2', 'Segment 3', 'Segment 4', 'Segment 5', 'Segment 6', 'Segment 7'],
    datasets: [
      {
        data: [3, 2, 5, 4, 3, 2, 4],
        borderColor: '#c19a6b',
        backgroundColor: 'rgba(193, 154, 107, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#c19a6b',
        borderWidth: 2,
      },
    ],
  };

  const basicOptions = {
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
    <div className="space-y-6 animate-fade-in" id="omni-stream-tab">
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-white/40 border border-white/60 shadow-xl">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-black/5 pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif-luxury font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-6 h-6 text-[#c19a6b]" /> Zafir Omni Communication Stream
            </h2>
            <p className="text-xs text-slate-600">Direct guest responses, social telemetry & AI sentiment aggregations</p>
          </div>
          <span className="text-xs font-mono text-[#7c5a30] bg-[#c19a6b]/20 px-3 py-1.5 rounded border border-[#c19a6b]/30 font-bold uppercase shadow-sm">
            3 Connected Channels
          </span>
        </div>

        {/* Timelines and feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 animate-fade-in">
          
          {/* Main communications */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Instagram Happy Review */}
            <article className="bg-white/45 border border-white/60 rounded-2xl p-5 flex flex-col justify-between hover:border-[#c19a6b]/70 shadow-sm transition-all duration-300">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold">
                    <Instagram className="w-4 h-4" /> <span>Instagram</span>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-300/30 shadow-sm">AIS</span>
                </div>
                
                <h4 className="text-xs text-slate-600 font-mono">From: Guest Suite 201</h4>
                <p className="text-sm font-semibold text-slate-700 italic">"The view and breakfast platter was spectacular! #luxury #zafir"</p>
                
                {/* Custom Vector Bedroom Suite illustration */}
                <div className="h-20 w-full rounded-xl overflow-hidden border border-slate-200 relative shadow-inner">
                  <svg viewBox="0 0 300 100" className="w-full h-full object-cover">
                    <rect width="300" height="100" fill="#fdfaf4" />
                    {/* Window framing */}
                    <rect x="180" y="20" width="100" height="60" fill="#1e3a5a" rx="4" />
                    <circle cx="230" cy="50" r="14" fill="#fef08a" opacity="0.45" /> {/* Moon */}
                    <line x1="230" y1="20" x2="230" y2="80" stroke="#fdfaf4" strokeWidth="2" />
                    <line x1="180" y1="50" x2="280" y2="50" stroke="#fdfaf4" strokeWidth="2" />
                    {/* Bed shape */}
                    <rect x="20" y="60" width="130" height="30" rx="3" fill="#c19a6b" />
                    <rect x="25" y="50" width="40" height="12" rx="2" fill="#ffffff" />
                    <rect x="70" y="50" width="40" height="12" rx="2" fill="#ffffff" />
                  </svg>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-3">2 min ago</span>
            </article>

            {/* Email Unhappy */}
            <article className="bg-white/45 border border-white/60 rounded-2xl p-5 flex flex-col justify-between hover:border-[#c19a6b]/70 shadow-sm transition-all duration-300">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs text-sky-600 font-bold">
                    <Mail className="w-4 h-4" /> <span>Secure Email</span>
                  </div>
                  <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-300/30 shadow-sm">AIS</span>
                </div>
                
                <h4 className="text-xs text-slate-600 font-mono">From: Ms. Al-Fayed // Suite 202</h4>
                <p className="text-xs font-bold text-slate-800">Subject: Room Service Issue</p>
                <p className="text-sm font-semibold text-slate-700 italic">"The tea was slightly cold when delivered to the penthouse. Please check."</p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-3">10 min ago</span>
            </article>

            {/* Review Trust */}
            <article className="bg-white/45 border border-white/60 rounded-2xl p-5 flex flex-col justify-between hover:border-[#c19a6b]/70 shadow-sm transition-all duration-300">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs text-[#7c5a30] font-bold">
                    <Star className="w-4 h-4 fill-current text-amber-500" /> <span>Direct Review</span>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-300/30 shadow-sm">AIS</span>
                </div>
                
                <div className="flex gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, idx) => <Star key={idx} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                
                <h4 className="text-xs text-slate-600 font-mono">From: Dr. Rossi // Suite 203</h4>
                <p className="text-sm font-semibold text-slate-700 italic">"A dream vacation! Exquisite hospitality and perfect butler secure ledger."</p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-3">35 min ago</span>
            </article>

          </div>

          {/* Live lateral feeds containing hand-crafted sunset SVG */}
          <aside className="lg:col-span-4 space-y-4">
            <h3 className="text-xs uppercase font-mono text-slate-700 font-bold tracking-widest">Sunset balcony visual</h3>
            
            <div className="bg-white/45 rounded-2xl border border-white/60 p-4 space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600 font-mono">Balcony Sunset Cam</span>
                <span className="text-[9px] bg-[#c19a6b]/20 text-[#7c5a30] px-1.5 py-0.5 rounded border border-[#c19a6b]/30 font-bold shadow-sm">LIVE FEED</span>
              </div>
              
              {/* Premium hand-drawn sunset scene SVG */}
              <div className="h-32 w-full rounded-xl overflow-hidden relative border border-slate-200 shadow-inner">
                <svg viewBox="0 0 300 130" className="w-full h-full object-cover">
                  <defs>
                    <linearGradient id="sunsetSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e1b4b" />
                      <stop offset="35%" stopColor="#4c1d95" />
                      <stop offset="70%" stopColor="#b45309" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <radialGradient id="sunBloom">
                      <stop offset="0%" stopColor="#fff" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  
                  {/* Sunset Sky base */}
                  <rect width="300" height="130" fill="url(#sunsetSky)" />
                  
                  {/* Sun orb */}
                  <circle cx="150" cy="85" r="28" fill="url(#sunBloom)" />
                  <circle cx="150" cy="85" r="8" fill="#fff" />

                  {/* Distant city silhouette */}
                  <path d="M0,105 L20,105 L20,95 L30,95 L30,105 L45,105 L45,85 L60,85 L60,100 L85,100 L85,90 L95,90 L95,105 L130,105 L130,85 L145,85 L145,105 L170,105 L170,95 L190,95 L190,105 L220,105 L220,90 L240,90 L240,105 L270,105 L270,80 L285,80 L285,105 L300,105 L300,130 L0,130 Z" fill="#1e2530" opacity="0.9" />

                  {/* Balcony Railing */}
                  <line x1="0" y1="110" x2="300" y2="110" stroke="#2d3748" strokeWidth="2.5" />
                  <line x1="0" y1="120" x2="300" y2="120" stroke="#1a202c" strokeWidth="2" />
                  <line x1="30" y1="110" x2="30" y2="130" stroke="#1a202c" strokeWidth="2.2" />
                  <line x1="90" y1="110" x2="90" y2="130" stroke="#1a202c" strokeWidth="2.2" />
                  <line x1="150" y1="110" x2="150" y2="130" stroke="#1a202c" strokeWidth="2.2" />
                  <line x1="210" y1="110" x2="210" y2="130" stroke="#1a202c" strokeWidth="2.2" />
                  <line x1="270" y1="110" x2="270" y2="130" stroke="#1a202c" strokeWidth="2.2" />
                </svg>
                {/* Micro play overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-700 italic">"Sunset over Manhattan skyline from Suite 201 Private Terrace!"</p>
            </div>
          </aside>

        </div>

        {/* Dashboard charts below */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-black/5 animate-fade-in">
          
          <div className="bg-white/45 border border-white/60 p-5 rounded-2xl shadow-sm">
            <p className="text-xs uppercase font-mono text-slate-600 font-bold tracking-widest mb-3">Communications Volume</p>
            <div className="h-16 w-full">
              <Bar data={barChartData} options={basicOptions} />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-800 mt-2">152 Logs</p>
          </div>

          <div className="bg-white/45 border border-white/60 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-16 h-16 shrink-0">
              <Doughnut data={doughnutData} options={basicOptions} />
            </div>
            <div>
              <p className="text-xs uppercase font-mono text-slate-600 font-bold tracking-widest leading-none mb-1">AI Sentiment</p>
              <p className="text-2xl font-bold text-slate-800 font-mono leading-tight">85% Positive</p>
              <span className="text-[10px] text-emerald-600 font-mono font-bold">OPTIMAL DATA STATUS</span>
            </div>
          </div>

          <div className="bg-white/45 border border-white/60 p-5 rounded-2xl shadow-sm">
            <p className="text-xs uppercase font-mono text-slate-600 font-bold tracking-widest mb-3">Pending Actions Log</p>
            <div className="h-16 w-full">
              <Line data={lineChartData} options={basicOptions} />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-800 mt-2">4 Critical Requests</p>
          </div>

        </section>

      </div>
    </div>
  );
};
