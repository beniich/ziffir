import React, { useState } from 'react';
import { HardHat, Activity, AlertTriangle, CheckSquare, Square, Check, RefreshCw, Upload, Sparkles, Building } from 'lucide-react';
import confetti from 'canvas-confetti';

import { useAddAuditLog } from '../shared/store/auditStore';

export const MaintenanceTab: React.FC = () => {
  const addAuditLog = useAddAuditLog();

  interface RoomNode {
    id: string;
    name: string;
    status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'OUT_OF_ORDER';
    housekeepingNotes: string;
    checkedList: {
      linens: boolean;
      clean: boolean;
      minibar: boolean;
      fragrance: boolean;
    };
    verificationPhoto: string | null;
  }

  interface MaintenanceIssue {
    id: string;
    room: string;
    system: 'HVAC' | 'Electrical' | 'Plumbing' | 'Smart Controls';
    priority: 'Low' | 'High' | 'Critical';
    details: string;
    timestamp: string;
    resolved: boolean;
  }
  // state for rooms list
  const [rooms, setRooms] = useState<RoomNode[]>([
    { id: '101', name: 'Suite 101', status: 'AVAILABLE', housekeepingNotes: 'Prone to early arrivals.', checkedList: { linens: true, clean: true, minibar: true, fragrance: true }, verificationPhoto: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=400&q=80' },
    { id: '102', name: 'Suite 102', status: 'CLEANING', housekeepingNotes: 'Check smart glass tinting response.', checkedList: { linens: false, clean: true, minibar: false, fragrance: false }, verificationPhoto: null },
    { id: '201', name: 'Suite 201', status: 'OCCUPIED', housekeepingNotes: 'Quiet guest, do not disturb before noon.', checkedList: { linens: true, clean: true, minibar: true, fragrance: true }, verificationPhoto: null },
    { id: '202', name: 'Suite 202', status: 'AVAILABLE', housekeepingNotes: 'VIP Platinum class preset.', checkedList: { linens: true, clean: true, minibar: true, fragrance: true }, verificationPhoto: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80' },
    { id: '304', name: 'Suite 304', status: 'MAINTENANCE', housekeepingNotes: 'Smart lock repair in progress.', checkedList: { linens: false, clean: false, minibar: false, fragrance: false }, verificationPhoto: null },
    { id: '401', name: 'Suite 401', status: 'OUT_OF_ORDER', housekeepingNotes: 'HVAC radiator overhaul.', checkedList: { linens: false, clean: false, minibar: false, fragrance: false }, verificationPhoto: null },
    { id: 'villa-1', name: 'Villa 1', status: 'CLEANING', housekeepingNotes: 'Caviar chiller needs standard diagnostics.', checkedList: { linens: true, clean: false, minibar: false, fragrance: false }, verificationPhoto: null },
    { id: 'villa-2', name: 'Villa 2', status: 'AVAILABLE', housekeepingNotes: 'Private pool heated to 28°C.', checkedList: { linens: true, clean: true, minibar: true, fragrance: true }, verificationPhoto: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80' }
  ]);

  // Multiple room selection
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  
  // Single room inspector selected ID
  const [inspectorRoomId, setInspectorRoomId] = useState<string>('102');
  const activeInspectorRoom = rooms.find(r => r.id === inspectorRoomId) || rooms[0];

  // Simulated upload photo states
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Reported Issues States (Sprint 14)
  const [issues, setIssues] = useState<MaintenanceIssue[]>([
    { id: 'ISS-1001', room: 'Suite 304', system: 'Smart Controls', priority: 'High', details: 'Chamber NFC lock rejects valid member keys periodically.', timestamp: '2026-06-19 10:14', resolved: false },
    { id: 'ISS-1002', room: 'Suite 401', system: 'HVAC', priority: 'Critical', details: 'Radiator valve leak triggered sector humidity fail warning.', timestamp: '2026-06-19 11:42', resolved: false }
  ]);

  const [issueRoom, setIssueRoom] = useState('101');
  const [issueSystem, setIssueSystem] = useState<'HVAC' | 'Electrical' | 'Plumbing' | 'Smart Controls'>('HVAC');
  const [issuePriority, setIssuePriority] = useState<'Low' | 'High' | 'Critical'>('High');
  const [issueDetails, setIssueDetails] = useState('');
  const [issueMessage, setIssueMessage] = useState<string | null>(null);

  // Selection toggle helper
  const toggleSelectRoom = (roomId: string) => {
    setSelectedRoomIds(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  // Select all rooms toggle
  const toggleSelectAll = () => {
    if (selectedRoomIds.length === rooms.length) {
      setSelectedRoomIds([]);
    } else {
      setSelectedRoomIds(rooms.map(r => r.id));
    }
  };

  // Bulk status change (Sprint 12)
  const handleBulkStatusChange = (newStatus: RoomNode['status']) => {
    if (selectedRoomIds.length === 0) return;

    setRooms(prev => prev.map(r => {
      if (selectedRoomIds.includes(r.id)) {
        return {
          ...r,
          status: newStatus,
          // If marked available, auto check the list items
          checkedList: newStatus === 'AVAILABLE' 
            ? { linens: true, clean: true, minibar: true, fragrance: true }
            : r.checkedList
        };
      }
      return r;
    }));

    if (addAuditLog) {
      addAuditLog(
        'BULK_HOUSEKEEPING_UPDATE',
        `Bulk updated status for ${selectedRoomIds.length} rooms to [${newStatus}] by Operator. Syncing permanent records.`,
        'AUTHORIZED',
        'OPERATOR'
      );
    }

    confetti({ particleCount: 40, spread: 50, colors: ['#c19a6b', '#ffffff'] });
    setSelectedRoomIds([]);
  };

  // Single room checklist item change
  const handleChecklistToggle = (item: 'linens' | 'clean' | 'minibar' | 'fragrance') => {
    setRooms(prev => prev.map(r => {
      if (r.id === inspectorRoomId) {
        const nextList = { ...r.checkedList, [item]: !r.checkedList[item] };
        
        // Auto progress status to CLEANING if they checked anything but not complete or manually altered
        let nextStatus = r.status;
        if (nextStatus === 'AVAILABLE' && (!nextList.linens || !nextList.clean || !nextList.minibar || !nextList.fragrance)) {
          nextStatus = 'CLEANING';
        }

        return {
          ...r,
          status: nextStatus,
          checkedList: nextList
        };
      }
      return r;
    }));
  };

  // Simulated Unsplash visual upload clean verification (Sprint 12 / 14)
  const handleUploadPhoto = () => {
    setIsUploadingPhoto(true);
    setTimeout(() => {
      setRooms(prev => prev.map(r => {
        if (r.id === inspectorRoomId) {
          return {
            ...r,
            verificationPhoto: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80',
            // If all checklist items are ticked, let's auto transition or encourage available!
            checkedList: { ...r.checkedList, clean: true }
          };
        }
        return r;
      }));
      
      setIsUploadingPhoto(false);

      if (addAuditLog) {
        addAuditLog(
          'ROOM_CLEANLINESS_PHOTO_VERIFICATION',
          `Cleanliness inspect photo loaded for ${activeInspectorRoom.name}. Verified standard conformity.`,
          'AUTHORIZED',
          'OPERATOR'
        );
      }

      confetti({ particleCount: 20, spread: 30, colors: ['#16a34a', '#ffffff'] });
    }, 1200);
  };

  // Fast authorize single room to AVAILABLE
  const handlePromoteRoom = () => {
    const isChecksCompleted = activeInspectorRoom.checkedList.linens && 
                       activeInspectorRoom.checkedList.clean && 
                       activeInspectorRoom.checkedList.minibar && 
                       activeInspectorRoom.checkedList.fragrance;

    if (!isChecksCompleted) {
      alert("Verification Error: Please declare all items fully cleaned and serviced first!");
      return;
    }

    setRooms(prev => prev.map(r => {
      if (r.id === inspectorRoomId) {
        return {
          ...r,
          status: 'AVAILABLE'
        };
      }
      return r;
    }));

    if (addAuditLog) {
      addAuditLog(
        'ROOM_PROMOTION_AVAILABLE',
        `Formally signed off housekeeping for ${activeInspectorRoom.name}. Room marked [AVAILABLE].`,
        'AUTHORIZED',
        'OPERATOR'
      );
    }

    confetti({ particleCount: 30, spread: 45, colors: ['#c19a6b', '#ffffff'] });
  };

  // Submit Issue Handler (Sprint 14)
  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDetails) return;

    const id = `ISS-${Math.floor(1001 + Math.random() * 999)}`;
    const newIssue: MaintenanceIssue = {
      id,
      room: rooms.find(r => r.id === issueRoom)?.name || issueRoom,
      system: issueSystem,
      priority: issuePriority,
      details: issueDetails,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      resolved: false
    };

    setIssues(prev => [...prev, newIssue]);
    setIssueDetails('');

    // Toggle room status to MAINTENANCE if critical
    if (issuePriority === 'Critical' || issuePriority === 'High') {
      setRooms(prev => prev.map(r => {
        if (r.id === issueRoom) {
          return { ...r, status: r.status === 'OCCUPIED' ? 'OCCUPIED' : 'MAINTENANCE' };
        }
        return r;
      }));
    }

    if (addAuditLog) {
      addAuditLog(
        'FACILITIES_ISSUE_REPORTED',
        `Filed Facilities Alert ${id} for ${newIssue.room} [Priority: ${issuePriority}]. System Type: ${issueSystem}.`,
        'AUTHORIZED',
        'OPERATOR'
      );
    }

    setIssueMessage(`✓ Filed system issue ${id}! Dispatch team assigned.`);
    setTimeout(() => setIssueMessage(null), 4000);
  };

  // Resolve Alert Event
  const handleResolveIssue = (id: string) => {
    setIssues(prev => prev.map(iss => {
      if (iss.id === id) {
        return { ...iss, resolved: true };
      }
      return iss;
    }));

    if (addAuditLog) {
      addAuditLog(
        'FACILITIES_ISSUE_RESOLVED',
        `Formally signed alert completion. Docket #${id} closed by Engineering.`,
        'AUTHORIZED',
        'MANAGER'
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="maintenance-tab">
      
      {/* Alert Feed Message */}
      {issueMessage && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/35 rounded-2xl text-amber-800 font-mono text-xs flex items-center justify-between shadow-sm">
          <span>{issueMessage}</span>
          <button onClick={() => setIssueMessage(null)} className="text-amber-800 font-bold">&times;</button>
        </div>
      )}

      {/* Existing isometric blueprint and Facility Systems rows */}
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

        {/* Right Column: Status info systems */}
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

          {/* New Reported System Issues List / Form */}
          <div className="glass-panel rounded-3xl p-5 bg-white/40 border border-white/60 shadow-xl space-y-4">
            <h3 className="text-sm font-mono font-bold text-red-700 uppercase tracking-widest border-b border-black/5 pb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Active Facility Faults List ({issues.filter(i => !i.resolved).length})
            </h3>
            
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {issues.map(iss => (
                <div key={iss.id} className={`p-3 rounded-xl border flex flex-col justify-between gap-2 text-xs font-mono shadow-sm ${
                  iss.resolved ? 'bg-stone-50 text-stone-400 border-stone-200' :
                  iss.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-300/40' : 'bg-amber-50 text-amber-800 border-amber-300/40'
                }`}>
                  <div className="flex justify-between items-start">
                    <span className="font-bold">{iss.id} ({iss.room})</span>
                    {!iss.resolved && (
                      <button 
                        onClick={() => handleResolveIssue(iss.id)}
                        className="text-[9px] bg-[#c19a6b] hover:bg-[#7c5a30] text-white font-bold px-2 py-0.5 rounded"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] font-sans text-slate-700 leading-snug">{iss.details}</p>
                  <div className="flex justify-between items-center text-[9px] text-slate-500">
                    <span>SYS: {iss.system}</span>
                    <span>{iss.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit New Issue Form */}
            <form onSubmit={handleIssueSubmit} className="pt-3 border-t border-black/5 space-y-2.5">
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Report New Hardware Fault</span>
              <div className="grid grid-cols-3 gap-2">
                <select 
                  value={issueRoom} 
                  onChange={(e) => setIssueRoom(e.target.value)}
                  className="p-1.5 text-xs rounded-lg border border-slate-300 bg-white/60 font-mono cursor-pointer"
                >
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <select 
                  value={issueSystem} 
                  onChange={(e) => setIssueSystem(e.target.value as any)}
                  className="p-1.5 text-xs rounded-lg border border-slate-300 bg-white/60 font-mono cursor-pointer"
                >
                  <option value="HVAC">HVAC</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Smart Controls">Smart Glass</option>
                </select>
                <select 
                  value={issuePriority} 
                  onChange={(e) => setIssuePriority(e.target.value as any)}
                  className="p-1.5 text-xs rounded-lg border border-slate-300 bg-white/60 font-mono cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <input 
                type="text" 
                value={issueDetails} 
                onChange={(e) => setIssueDetails(e.target.value)}
                required
                placeholder="Alert details (compressor failure, etc.)"
                className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white/50 focus:outline-none"
              />
              <button 
                type="submit"
                className="w-full py-1.5 bg-[#c19a6b] hover:bg-[#7c5a30] text-white font-bold text-xs uppercase rounded-lg transition"
              >
                Dispatch Engineer
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* SPRINT 12/14 Housekeeping and Cleanliness Photo Coordinator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Rooms Grid with Multi-select capabilities */}
        <section className="lg:col-span-8 glass-panel rounded-3xl p-6 bg-white/40 border border-white/60 shadow-xl flex flex-col justify-between" id="room-status-coordinator">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-serif-luxury text-slate-800 font-bold flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#c19a6b]" /> Housekeeping Room Coordinator Grid
                </h3>
                <p className="text-xs text-slate-500">Track active guest nodes and housekeeping progress. Support multi-select bulk operations.</p>
              </div>
              
              <button 
                onClick={toggleSelectAll}
                className="text-[10px] font-mono font-bold uppercase border border-slate-350 hover:bg-[#c19a6b]/20 px-3 py-1.5 rounded-lg transition"
              >
                {selectedRoomIds.length === rooms.length ? 'Deselect All' : 'Select All Rooms'}
              </button>
            </div>

            {/* Bulk Actions Header (Sprint 12) */}
            {selectedRoomIds.length > 0 && (
              <div className="p-4 bg-[#c19a6b]/15 border border-[#c19a6b]/35 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-sm">
                <span className="text-xs font-mono font-bold text-[#7c5a30]">
                  🎯 BULK ACTIONS DETECTED // {selectedRoomIds.length} ROOM NODES SELECTED
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleBulkStatusChange('AVAILABLE')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs font-mono px-3.5 py-1.5 rounded-lg transition"
                  >
                    Mark Ready [AVAILABLE]
                  </button>
                  <button 
                    onClick={() => handleBulkStatusChange('CLEANING')}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs font-mono px-3.5 py-1.5 rounded-lg transition"
                  >
                    Set back [CLEANING]
                  </button>
                </div>
              </div>
            )}

            {/* Grid display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {rooms.map((room) => (
                <div 
                  key={room.id}
                  onClick={() => setInspectorRoomId(room.id)}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer relative shadow-sm h-36 ${
                    room.id === inspectorRoomId 
                      ? 'border-[#c19a6b] bg-[#c19a6b]/10 shadow-[0_0_8px_rgba(193,154,107,0.2)]'
                      : 'border-white/60 bg-white/45 hover:border-[#c19a6b]/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectRoom(room.id);
                      }}
                      className="text-slate-500 hover:text-[#c19a6b]"
                    >
                      {selectedRoomIds.includes(room.id) ? (
                        <CheckSquare className="w-4 h-4 text-[#c19a6b]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-350" />
                      )}
                    </button>
                    
                    <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border ${
                      room.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      room.status === 'OCCUPIED' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                      room.status === 'CLEANING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                      room.status === 'MAINTENANCE' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                      'bg-slate-500/10 text-slate-600 border-slate-500/20'
                    }`}>
                      {room.status}
                    </span>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-sm font-semibold text-slate-800">{room.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{room.housekeepingNotes}</p>
                  </div>

                  {/* Micro completion dots */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-black/5 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${room.checkedList.linens ? 'bg-emerald-500' : 'bg-slate-300'}`} title="Linens changed" />
                    <span className={`w-1.5 h-1.5 rounded-full ${room.checkedList.clean ? 'bg-emerald-500' : 'bg-slate-300'}`} title="Bathroom complete" />
                    <span className={`w-1.5 h-1.5 rounded-full ${room.checkedList.minibar ? 'bg-emerald-500' : 'bg-slate-300'}`} title="Minibar ready" />
                    <span className={`w-1.5 h-1.5 rounded-full ${room.checkedList.fragrance ? 'bg-emerald-500' : 'bg-slate-300'}`} title="Fragrance ready" />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Right side segment: Selected Room Inspector Checklist & Photo Upload Check */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 bg-white/40 border border-white/60 shadow-xl space-y-5">
          <div className="border-b border-black/5 pb-2">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">ACTIVE FIELD INSPECTOR</span>
            <h3 className="text-base font-serif-luxury text-slate-800 font-bold">Details for {activeInspectorRoom.name}</h3>
          </div>

          {/* Interactive Checklist Toggles */}
          <div className="space-y-2.5">
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block mb-1">Status Verification checklist</span>
            
            <label className="flex items-center justify-between text-xs font-mono text-slate-700 bg-white/50 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-white/80 transition-colors">
              <span className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={activeInspectorRoom.checkedList.linens} 
                  onChange={() => handleChecklistToggle('linens')}
                  className="rounded border-slate-300 text-[#c19a6b] focus:ring-0"
                />
                <span>Bed linens changed & crisp</span>
              </span>
              {activeInspectorRoom.checkedList.linens && <Check className="w-4 h-4 text-emerald-600" />}
            </label>

            <label className="flex items-center justify-between text-xs font-mono text-slate-700 bg-white/50 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-white/80 transition-colors">
              <span className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={activeInspectorRoom.checkedList.clean} 
                  onChange={() => handleChecklistToggle('clean')}
                  className="rounded border-slate-300 text-[#c19a6b] focus:ring-0"
                />
                <span>Bathroom disinfected & polished</span>
              </span>
              {activeInspectorRoom.checkedList.clean && <Check className="w-4 h-4 text-emerald-600" />}
            </label>

            <label className="flex items-center justify-between text-xs font-mono text-slate-700 bg-white/50 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-white/80 transition-colors">
              <span className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={activeInspectorRoom.checkedList.minibar} 
                  onChange={() => handleChecklistToggle('minibar')}
                  className="rounded border-slate-300 text-[#c19a6b] focus:ring-0"
                />
                <span>Champagne minibar replenished</span>
              </span>
              {activeInspectorRoom.checkedList.minibar && <Check className="w-4 h-4 text-emerald-600" />}
            </label>

            <label className="flex items-center justify-between text-xs font-mono text-slate-700 bg-white/50 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-white/80 transition-colors">
              <span className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={activeInspectorRoom.checkedList.fragrance} 
                  onChange={() => handleChecklistToggle('fragrance')}
                  className="rounded border-slate-300 text-[#c19a6b] focus:ring-0"
                />
                <span>Zafir scent perfume diffused</span>
              </span>
              {activeInspectorRoom.checkedList.fragrance && <Check className="w-4 h-4 text-emerald-600" />}
            </label>
          </div>

          {/* Photo validation upload area (Sprint 12 / 14) */}
          <div className="space-y-2 pt-2 border-t border-black/5">
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block mb-1">Visual Cleanliness Verification Snapshot</span>
            
            {activeInspectorRoom.verificationPhoto ? (
              <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 shadow-inner h-28 flex items-center justify-center bg-stone-100 group">
                <img src={activeInspectorRoom.verificationPhoto} alt="Verification Snapshot" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-2 right-2 bg-emerald-600 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded shadow">
                  ✓ PASSED VALIDATION SNAP
                </div>
              </div>
            ) : (
              <button 
                onClick={handleUploadPhoto}
                disabled={isUploadingPhoto}
                className="w-full border-2 border-dashed border-slate-350 hover:border-[#c19a6b] rounded-xl py-5 bg-white/40 hover:bg-white/70 text-slate-600 flex flex-col items-center justify-center font-mono text-xs gap-1 transition"
              >
                {isUploadingPhoto ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-[#c19a6b] animate-spin" />
                    <span className="animate-pulse">Loading inspection photo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-500" />
                    <span>Upload Camera Quality Photo</span>
                    <span className="text-[8px] text-slate-400">Drag & Drop or Tap to Simulate</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Promote or verify buttons */}
          <button 
            onClick={handlePromoteRoom}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-xl font-mono shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 duration-100"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Sign off Room [AVAILABLE]</span>
          </button>
        </div>

      </div>

    </div>
  );
};
