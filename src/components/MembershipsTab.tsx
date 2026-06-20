import React, { useState } from 'react';
import { Crown, Download, UserPlus, ShieldCheck, EyeOff, User } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import confetti from 'canvas-confetti';
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

import { useAddAuditLog } from '../shared/store/auditStore';

export const MembershipsTab: React.FC = () => {
  const addAuditLog = useAddAuditLog();

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

  // State for Guests CRM (Sprint 14 / GDPR Integrity)
  const [members, setMembers] = useState([
    { id: '74FD-0', guest: 'Mr. Arthur Dubois', email: 'arthur.dubois@sovereign.luxury', phone: '+33 6 1234 5678', loyaltyPoints: 6450, tier: 'PLATINUM', vip: true, nationality: 'FR', preferences: 'Penthouse level, high-privacy, morning organic espresso.' },
    { id: '9ac7-1', guest: 'Ms. Elena Petrova', email: 'elena.petrova@sovereign.luxury', phone: '+7 903 123 4567', loyaltyPoints: 3400, tier: 'GOLD', vip: true, nationality: 'RU', preferences: 'Feather-free pillows, chilled still water, botanical-scents.' },
    { id: '00FF-A', guest: 'Dr. Hassan Al-Fayed', email: 'hassan.alfayed@sovereign.luxury', phone: '+971 4 123 456', loyaltyPoints: 12500, tier: 'DIAMOND', vip: true, nationality: 'AE', preferences: 'Bulletproof limousine routing, certified private chef dispatch.' }
  ]);

  // Add Guest / Invite States
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTier, setNewTier] = useState('GOLD');
  const [newPoints, setNewPoints] = useState(2500);
  const [newPrefs, setNewPreferences] = useState('');
  const [newNationality, setNewNationality] = useState('FR');

  // Selected member for detail view and GDPR actions
  const [selectedId, setSelectedId] = useState('9ac7-1');
  const currentMember = members.find(m => m.id === selectedId) || members[0];

  // GDPR feedback flags
  const [gdprMessage, setGdprMessage] = useState<string | null>(null);

  // Calculate dynamic progress to next tier
  const getLoyaltyProgress = (points: number) => {
    if (points >= 10000) return { current: 'DIAMOND', next: 'SOVEREIGN SUPREME', target: 20000, pointsToNext: 20000 - points, pct: Math.min(100, Math.round((points / 20000) * 100)) };
    if (points >= 5000) return { current: 'PLATINUM', next: 'DIAMOND', target: 10000, pointsToNext: 10000 - points, pct: Math.round(((points - 5000) / 5000) * 100) };
    if (points >= 2000) return { current: 'GOLD', next: 'PLATINUM', target: 5000, pointsToNext: 5000 - points, pct: Math.round(((points - 2000) / 3000) * 100) };
    if (points >= 500) return { current: 'SILVER', next: 'GOLD', target: 2000, pointsToNext: 2000 - points, pct: Math.round(((points - 500) / 1500) * 100) };
    return { current: 'BRONZE', next: 'SILVER', target: 500, pointsToNext: 500 - points, pct: Math.round((points / 500) * 100) };
  };

  const currentProgress = getLoyaltyProgress(currentMember?.loyaltyPoints || 0);

  // Invite/Register New Member Handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const id = `MEM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newGuest = {
      id,
      guest: newName,
      email: newEmail,
      phone: newPhone || '+33 6 ' + Math.floor(10000000 + Math.random() * 90000000),
      loyaltyPoints: Number(newPoints) || 0,
      tier: newTier,
      vip: true,
      nationality: newNationality,
      preferences: newPrefs || 'Elite class suite requests standard configuration.'
    };

    setMembers(prev => [...prev, newGuest]);
    setSelectedId(id);

    // Call dynamic log
    if (addAuditLog) {
      addAuditLog(
        'NEW_MEMBER_REGISTRY',
        `Registered new Elite club member: "${newName}" (${newTier}), ID node allocated: #${id}. Secure ledger updated.`,
        'AUTHORIZED',
        'MANAGER'
      );
    }

    // Feedback
    confetti({ particleCount: 35, spread: 45, colors: ['#c19a6b', '#ffffff'] });
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewPreferences('');
    
    setGdprMessage(`✓ Successfully added ${newName} with verified secure credentials!`);
    setTimeout(() => setGdprMessage(null), 5000);
  };

  // GDPR Art 15 - Personal Data Dossier Export
  const handleGDPRExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentMember, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", `GDPR-Art15-Dossier-${currentMember.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (addAuditLog) {
      addAuditLog(
        'GDPR_ART_15_DATA_EXPORT',
        `Initiated certified personal data dossier export for ${currentMember.guest} under Article 15 GDPR. Hash link compiled.`,
        'AUTHORIZED',
        'OPERATOR'
      );
    }

    confetti({ particleCount: 15, spread: 25, colors: ['#7c5a30', '#ffffff'] });
    setGdprMessage(`✓ GDPR Art. 15 Export executed. Downloaded folder block for ${currentMember.guest}.`);
    setTimeout(() => setGdprMessage(null), 4000);
  };

  // GDPR Art 17 - Permanent Anonymization "Right to be Forgotten"
  const handleGDPRAnonymize = () => {
    const previousName = currentMember.guest;
    
    // Mask name, email, phone, and overwrite preferences
    setMembers(prev => prev.map(m => {
      if (m.id === selectedId) {
        return {
          ...m,
          guest: 'ANONYMIZED GUEST (Art. 17 GDPR)',
          email: 'forgotten.compliance@sovereign.luxury',
          phone: '+0 000 000 0000',
          preferences: 'All raw personal metadata wiped per official handshakes under Art. 17 GDPR.',
          vip: false,
          loyaltyPoints: 0
        };
      }
      return m;
    }));

    if (addAuditLog) {
      addAuditLog(
        'GDPR_ART_17_FORGOTTEN_ANONYMIZATION',
        `Permanent wipe trigger: Anonymized historical registry node ID #${currentMember.id} for "${previousName}". Secure GDPR compliance validated.`,
        'AUTHORIZED',
        'MANAGER'
      );
    }

    setGdprMessage(`⚠ Guest anonymized permanently! Personal identification logs zeroed in compliance with Art. 17 GDPR.`);
    setTimeout(() => setGdprMessage(null), 5000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="memberships-tab">
      
      {/* GDPR Feedback Box */}
      {gdprMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/35 rounded-2xl text-emerald-700 font-mono text-xs flex items-center justify-between shadow-sm animate-pulse">
          <span>{gdprMessage}</span>
          <button onClick={() => setGdprMessage(null)} className="text-[#7c5a30] hover:text-black font-bold">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Metal card 1: Platinum Card MRR */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[300px] border border-white/60 flex flex-col justify-between group p-8">
          
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
            <g opacity="0.12" stroke="#555" strokeWidth="0.5">
              <line x1="0" y1="20" x2="500" y2="20" />
              <line x1="0" y1="50" x2="500" y2="50" />
              <line x1="0" y1="90" x2="500" y2="90" />
              <line x1="0" y1="140" x2="500" y2="140" />
              <line x1="0" y1="190" x2="500" y2="190" />
              <line x1="0" y1="240" x2="500" y2="240" />
            </g>
            <path d="M-50,0 Q180,150 490,0 L500,40 Q180,190 -10,40 Z" fill="#fff" opacity="0.3" />
          </svg>
          
          <div className="absolute inset-0 bg-gradient-to-tr from-[#c19a6b]/20 via-transparent to-transparent opacity-60 z-0 pointer-events-none" />

          <div className="relative z-10 w-full flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-700 font-bold">Monthly Recurring Revenue</span>
              <h3 className="text-3xl sm:text-4xl font-mono font-bold text-slate-800 tracking-tight mt-1">$1,250,000</h3>
              <p className="text-xs text-emerald-700 font-mono mt-1 font-semibold flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                +8.5% MRR Gain vs last month
              </p>
            </div>
            
            <div className="w-12 h-10 bg-gradient-to-tr from-[#c19a6b] via-[#FFF3DE] to-[#a36e44] rounded-lg p-[1px] shadow">
              <div className="w-full h-full bg-white/80 rounded-lg flex items-center justify-center">
                <span className="font-mono text-[7px] text-[#7c5a30] font-bold">Z_SEC</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 h-24 w-full">
            <Line data={mrrData} options={chartOptions} />
          </div>

          <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-slate-600 font-bold">
            <span>ZAFIR ELITE SUITES PORTFOLIO</span>
            <span className="text-[#7c5a30]">Sovereign Alignment Live</span>
          </div>
        </div>
        
        {/* Metal card 2: Platinum Card Retention */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[300px] border border-white/60 flex flex-col justify-between group p-8">
          
          <svg viewBox="0 0 500 300" className="absolute inset-0 w-full h-full object-cover select-none z-0" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="platinumPlateBack" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cbdce0" />
                <stop offset="50%" stopColor="#e0ebec" />
                <stop offset="100%" stopColor="#f3f8f7" />
              </linearGradient>
            </defs>
            <rect width="500" height="300" fill="url(#platinumPlateBack)" />
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
            <span>LEVEL 4 REGISTRY NODE SYNC</span>
          </div>
        </div>

      </div>

      {/* Main CRM split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left segment - Member grid list (Sprint 14) */}
        <section className="lg:col-span-7 glass-panel rounded-3xl p-6 bg-white/40 border border-white/60 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif-luxury text-slate-800 font-bold mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#c19a6b]" /> Sovereign Club CRM & Guest Node Registry
            </h3>
            <p className="text-xs text-slate-500 mb-6">Interactive guest log database. Select a guest block to trigger GDPR handshakes or compile diagnostics.</p>
            
            <div className="space-y-3">
              {members.map((m) => (
                <div 
                  key={m.id} 
                  onClick={() => setSelectedId(m.id)}
                  className={`p-4 border rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all duration-350 shadow-sm ${
                    m.id === selectedId 
                      ? 'border-[#c19a6b] bg-[#c19a6b]/10 shadow-[0_0_12px_rgba(193,154,107,0.2)]' 
                      : 'border-white/60 bg-white/45 hover:border-[#c19a6b]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#c19a6b]/20 flex items-center justify-center text-[#7c5a30]">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{m.guest}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">ID: #{m.id} | Email: {m.email.substring(0, 15)}...</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-[#c19a6b]/35 bg-white/70 text-[#7c5a30]">
                      {m.tier}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-700">{m.loyaltyPoints.toLocaleString()} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SPRINT 14 CRM Registration form */}
          <form onSubmit={handleRegister} className="mt-8 pt-6 border-t border-black/5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-[#7c5a30] uppercase tracking-wider flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" /> Invite / Formalize New Sovereign Node
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                required 
                placeholder="Full Name" 
                className="p-2 text-xs rounded-lg border border-slate-350 bg-white/60 focus:outline-none focus:border-[#c19a6b]" 
              />
              <input 
                type="email" 
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
                required 
                placeholder="Secure Email Address" 
                className="p-2 text-xs rounded-lg border border-slate-350 bg-white/60 focus:outline-none focus:border-[#c19a6b]" 
              />
              <input 
                type="text" 
                value={newPhone} 
                onChange={(e) => setNewPhone(e.target.value)} 
                placeholder="Phone (e.g. +33 ...)" 
                className="p-2 text-xs rounded-lg border border-slate-350 bg-white/60 focus:outline-none focus:border-[#c19a6b]" 
              />
              <select 
                value={newTier} 
                onChange={(e) => setNewTier(e.target.value)}
                className="p-2 text-xs rounded-lg border border-slate-350 bg-white/60 font-mono cursor-pointer"
              >
                {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input 
                type="number" 
                value={newPoints} 
                onChange={(e) => setNewPoints(Number(e.target.value))} 
                placeholder="Starting points" 
                className="p-2 text-xs rounded-lg border border-slate-350 bg-white/60 font-mono" 
              />
              <input 
                type="text" 
                value={newNationality} 
                onChange={(e) => setNewNationality(e.target.value)} 
                placeholder="Nationality (e.g. FR)" 
                className="p-2 text-xs rounded-lg border border-slate-350 bg-white/60 font-mono" 
              />
            </div>
            <input 
              type="text" 
              value={newPrefs} 
              onChange={(e) => setNewPreferences(e.target.value)} 
              placeholder="Guest VIP Preferences & Security Requirements (Room alignment settings, etc.)" 
              className="w-full p-2 text-xs rounded-lg border border-slate-350 bg-white/60 focus:outline-none" 
            />
            <button 
              type="submit" 
              className="py-2.5 px-4 bg-[#c19a6b] hover:bg-[#7c5a30] text-white font-bold text-xs uppercase rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow"
            >
              <UserPlus className="w-3.5 h-3.5" /> Formalize & Register Guest Node
            </button>
          </form>
        </section>

        {/* Right segment - Selected Guest detail, loyalty progress & GDPR Station (Sprint 14 / GDPR Compliance) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Guest Detailed Card */}
          <div className="glass-panel rounded-3xl p-6 bg-white/40 border border-white/60 shadow-xl space-y-4">
            <h4 className="text-xs font-mono font-bold text-[#7c5a30] uppercase tracking-widest border-b border-black/5 pb-2">
              Sovereign Node Diagnostics / Details
            </h4>
            
            <div className="space-y-2 text-xs font-mono text-slate-700">
              <p><span className="text-slate-500 font-semibold">Node ID Ref:</span> #{currentMember.id}</p>
              <p><span className="text-slate-500 font-semibold">Legal Name:</span> <strong className="text-slate-900 font-sans">{currentMember.guest}</strong></p>
              <p><span className="text-slate-500 font-semibold">Contact Email:</span> {currentMember.email}</p>
              <p><span className="text-slate-500 font-semibold">Mobile Node:</span> {currentMember.phone}</p>
              <p><span className="text-slate-500 font-semibold">Nationality ISO:</span> {currentMember.nationality}</p>
              <div className="bg-stone-900/5 p-3 rounded-xl border border-stone-200 mt-2">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1">VIP Service Directives</span>
                <span className="text-[11px] text-stone-700 font-sans leading-relaxed">{currentMember.preferences}</span>
              </div>
            </div>

            {/* SPRINT 14 Loyalty Progress Bar */}
            <div className="pt-2">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-mono text-slate-500 font-bold uppercase">{currentProgress.current} TIER</span>
                <span className="font-mono text-[#7c5a30] font-bold">{currentMember.loyaltyPoints} points</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-[#ca8a04] via-[#c19a6b] to-[#7c5a30] transition-all duration-300" 
                  style={{ width: `${currentProgress.pct}%` }}
                />
              </div>
              <p className="text-[9px] font-mono text-slate-500 text-right uppercase">
                {currentProgress.pointsToNext > 0 
                  ? `${currentProgress.pointsToNext} pts to ${currentProgress.next} Level` 
                  : 'Highest Sovereign Tier Secured ✔'}
              </p>
            </div>
          </div>

          {/* SPRINT 14 GDPR Compliance Hub */}
          <div className="glass-panel rounded-3xl p-6 bg-white/40 border border-white/60 shadow-xl space-y-4">
            <h4 className="text-xs font-mono font-bold text-red-700 uppercase tracking-widest border-b border-black/5 pb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> GDPR Art 15 & Art 17 Compliance Station
            </h4>
            <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
              Fully compliant GDPR registry controls connected to blockchain ledgers. Perform cryptographic operations for client legal rights.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* GDPR Article 15 */}
              <button 
                onClick={handleGDPRExport}
                className="p-3 bg-white/50 hover:bg-[#c19a6b]/20 border border-slate-350 hover:border-[#c19a6b] rounded-2xl flex flex-col items-center text-center gap-1 font-mono transition duration-150"
              >
                <Download className="w-5 h-5 text-[#c19a6b]" />
                <span className="text-[10px] font-bold text-slate-800">GDPR EXPORT</span>
                <span className="text-[8px] text-slate-500 leading-tight">Article 15 (CSV Portability)</span>
              </button>

              {/* GDPR Article 17 */}
              <button 
                onClick={handleGDPRAnonymize}
                disabled={currentMember.guest.includes('ANONYMIZED')}
                className={`p-3 rounded-2xl flex flex-col items-center text-center gap-1 font-mono transition duration-150 border ${
                  currentMember.guest.includes('ANONYMIZED')
                    ? 'bg-stone-50 border-slate-200 text-stone-400 cursor-not-allowed'
                    : 'bg-red-500/10 hover:bg-red-500 hover:text-white border-red-300/40 hover:border-red-500 text-red-700'
                }`}
              >
                <EyeOff className="w-5 h-5" />
                <span className="text-[10px] font-bold">ANONYMIZE</span>
                <span className="text-[8px] leading-tight">Article 17 (Right to be Forgotten)</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
