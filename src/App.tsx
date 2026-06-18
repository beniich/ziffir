import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plane, 
  Utensils, 
  Sliders, 
  Layers, 
  Lock, 
  Crown, 
  HardHat, 
  Activity,
  RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';

// Shared types and tab subcomponents
import { Course, RoomServiceOrder, VaultDocument } from './types';
import { ArrivalsTab } from './components/ArrivalsTab';
import { RoomServiceTab } from './components/RoomServiceTab';
import { ControlsTab } from './components/ControlsTab';
import { ChannelSyncTab } from './components/ChannelSyncTab';
import { VaultTab } from './components/VaultTab';
import { MembershipsTab } from './components/MembershipsTab';
import { MaintenanceTab } from './components/MaintenanceTab';
import { OmniStreamTab } from './components/OmniStreamTab';
import { LedgerTab } from './components/LedgerTab';

// Academic and mock structures
const INITIAL_COURSES: Course[] = [
  { code: 'HOSP-501', name: 'Advanced Guest Experience Design', category: 'Operations', credits: 4.0, grade: 'A+', completedDate: '2025-11-20' },
  { code: 'SOMM-612', name: 'Master Oenology & Fine Wine Curation', category: 'Gastronomy', credits: 3.0, grade: 'A', completedDate: '2025-12-15' },
  { code: 'ESTM-505', name: 'Five-Star Estate & Butler Management', category: 'Service', credits: 4.0, grade: 'A+', completedDate: '2026-02-10' },
  { code: 'CULN-410', name: 'Elite Haute Gastronomy & Hospitality Ethics', category: 'Gastronomy', credits: 3.0, grade: 'A-', completedDate: '2026-03-01' },
  { code: 'FINH-590', name: 'Yield Management & Luxury Resort Finance', category: 'Management', credits: 4.0, grade: 'A', completedDate: '2026-04-18' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'arrivals' | 'room-service' | 'controls' | 'channel-sync' | 'vault' | 'memberships' | 'maintenance' | 'omni-stream' | 'ledger'>('arrivals');

  // Student details
  const [studentName] = useState<string>('Elena Petrova');
  const [studentId] = useState<string>('ZCA-2024-9182');
  const [dob] = useState<string>('1998-05-14');
  const [major] = useState<string>('Master of Premium Hospitality');
  const [blockchainId] = useState<string>('0x89C...D4AF');
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);

  // Tab State Handlers
  
  // 1. ARRIVALS DATA
  const vipGuests = [
    { name: 'Mr. Chen & Family', vip: 'VIP GOLD', status: 'En route animate-pulse', info: 'Limo Pickup in 20m', flight: 'Flight BA245 / LHR-JFK' },
    { name: 'Ms. Al-Fayed', vip: 'VIP PLATINUM', status: 'Landed', info: 'Arrived at Terminal 4 / Chauffeur en route', flight: 'Flight Emirates EM5 / DXB-JFK' },
    { name: 'Dr. Rossi', vip: 'VIP BRONZE', status: 'In-flight', info: 'Estimated arrival 2h 15m', flight: 'Flight AF112 / CDG-JFK' }
  ];
  const flights = [
    { id: 'BA245', status: 'On Time', time: '11:15 AM' },
    { id: 'AF112', status: 'Delayed 15m', time: '12:45 PM' },
    { id: 'EM5', status: 'Landed', time: '09:50 AM' }
  ];

  // 2. ROOM SERVICE ORDERS
  const [roomOrders, setRoomOrders] = useState<RoomServiceOrder[]>([
    { id: 'order-1', guest: 'Mr. Chen & Family', room: 'Suite 201', details: 'Gourmet French Breakfast platter, freshly pressed organic orange juice', status: 'Quality Check', imgUrl: '' },
    { id: 'order-2', guest: 'Ms. Al-Fayed', room: 'Suite 202', details: 'Chef Selection Premium Sushi platter, Wagyu Beef skewers', status: 'Quality Check', imgUrl: '' },
    { id: 'order-3', guest: 'Dr. Rossi', room: 'Suite 203', details: 'Dry Standard Ribeye Steak, Truffle fries, Barolo Reserve wine', status: 'Quality Check', imgUrl: '' },
    { id: 'order-4', guest: 'Al Gtore', room: 'Villa 1', details: 'Gourmet Buttermilk Pancakes, Canadian maple syrup, hot espresso', status: 'Preparation', imgUrl: '' },
    { id: 'order-5', guest: 'Contarah', room: 'Villa 2', details: 'Traditional Premium Angus Beef burger, gold leaf garnish', status: 'Quality Check', imgUrl: '' },
    { id: 'order-6', guest: 'Fonuhery', room: 'Suite 304', details: 'Fettuccine Vongole with fresh Mediterranean clams, Pinot Grigio', status: 'Quality Check', imgUrl: '' }
  ]);

  const advanceOrderStatus = (id: string) => {
    setRoomOrders(prev => prev.map(order => {
      if (order.id !== id) return order;
      const statusMap: Record<RoomServiceOrder['status'], RoomServiceOrder['status']> = {
        'Preparation': 'Quality Check',
        'Quality Check': 'Out for Delivery',
        'Out for Delivery': 'Delivered',
        'Delivered': 'Preparation'
      };
      return { ...order, status: statusMap[order.status] };
    }));
    confetti({ particleCount: 15, spread: 35, colors: ['#c19a6b', '#ffffff'] });
  };

  // 3. ENVIRONMENTAL SUITE COMMAND CONTROLS
  const [lightScene, setLightScene] = useState<'ambient' | 'bright' | 'relax' | 'night'>('ambient');
  const [currentTemp, setCurrentTemp] = useState(22);
  const [targetTemp, setTargetTemp] = useState(23);
  const [glassOpacity, setGlassOpacity] = useState(65);
  const [glowingRooms, setGlowingRooms] = useState<Record<string, boolean>>({
    '201': true,
    '202': false,
    '203': true,
    'corridor': true,
    'meeting': false
  });

  const toggleRoomGlow = (room: string) => {
    setGlowingRooms(prev => ({ ...prev, [room]: !prev[room] }));
  };

  // 4. CHANNEL MANAGER PRICE SYNCHRONIZER
  const channels = [
    { name: 'Booking.com', status: 'Synced', iconColor: 'bg-emerald-500' },
    { name: 'Expedia.com', status: 'Synced', iconColor: 'bg-emerald-500' },
    { name: 'Airbnb Luxury', status: 'Pending', iconColor: 'bg-amber-400 animate-pulse' },
    { name: 'Direct Zafir', status: 'Synced', iconColor: 'bg-emerald-500' }
  ];
  const syncLogs = [
    '01:59 AM - Channel Booking.com price parity audit completed',
    '01:59 AM - Expedia price update distributed successfully',
    '01:53 AM - Airbnb API availability handshake verified',
    '01:53 AM - Direct portal local server cache sync updated'
  ];

  // 5. SECURE VAULT ACCESS CONTROL
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([
    { id: '1', name: 'Zafir_Acquisition_Contract_2024.pdf', encrypted: true, decrypting: false, progress: 0, securityLevel: 'VIP Elite Class V' },
    { id: '2', name: 'Global_Merger_Sovereign_Agreement_X89.docx', encrypted: true, decrypting: false, progress: 0, securityLevel: 'Presidential Clearance' },
    { id: '3', name: 'Strategic_Sovereign_Financial_Report_Q3.xlsx', encrypted: true, decrypting: false, progress: 0, securityLevel: 'Secretariat Level IV' }
  ]);

  const handleDecrypt = (id: string) => {
    setVaultDocs(prev => prev.map(doc => {
      if (doc.id === id) {
        return { ...doc, decrypting: true };
      }
      return doc;
    }));
  };

  useEffect(() => {
    const activeDecrypting = vaultDocs.find(d => d.decrypting);
    if (!activeDecrypting) return;

    const interval = setInterval(() => {
      setVaultDocs(prev => prev.map(doc => {
        if (doc.decrypting) {
          const nextProgress = doc.progress + 20;
          if (nextProgress >= 100) {
            return { ...doc, progress: 100, encrypted: false, decrypting: false };
          }
          return { ...doc, progress: nextProgress };
        }
        return doc;
      }));
    }, 400);

    return () => clearInterval(interval);
  }, [vaultDocs]);

  // GPA calculations
  const totalCredits = courses.reduce((acc, curr) => acc + curr.credits, 0);
  const totalGPA = (() => {
    const gradePoints: Record<string, number> = {
      'A+': 4.3, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'F': 0.0
    };
    let totalGradeVal = 0;
    let totalCredsCount = 0;
    courses.forEach(c => {
      totalGradeVal += (gradePoints[c.grade] || 4.0) * c.credits;
      totalCredsCount += c.credits;
    });
    return totalCredsCount > 0 ? (totalGradeVal / totalCredsCount).toFixed(2) : '4.00';
  })();

  // 6. QR CODE & VERIFICATION CODES HANDLERS
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const queryParams = new URLSearchParams();
    queryParams.set('verify', 'true');
    queryParams.set('student', studentName);
    queryParams.set('id', studentId);
    queryParams.set('gpa', totalGPA);
    queryParams.set('credits', totalCredits.toFixed(1));
    queryParams.set('courses', courses.length.toString());
    queryParams.set('hash', blockchainId);

    const checkUrl = `${window.location.origin}${window.location.pathname}?${queryParams.toString()}`;

    QRCode.toDataURL(checkUrl, {
      margin: 1,
      width: 250,
      color: {
        dark: '#c19a6b', // Camel QR Code color pattern matching the brand identity!
        light: '#050b16' // Midnight deep navy background
      }
    })
    .then(url => {
      setQrCodeUrl(url);
    })
    .catch(err => {
      console.error('Error generating Camel QR verification code', err);
    });
  }, [courses, totalGPA, totalCredits, studentName, studentId, blockchainId]);

  // Course additions
  const addCourse = (course: Course) => {
    setCourses(prev => [...prev, course]);
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#c19a6b', '#ffffff', '#0c1b33']
    });
  };

  const removeCourse = (code: string) => {
    setCourses(prev => prev.filter(c => c.code !== code));
  };

  // HIGHEST FIDELITY Signed PDF Generator with Navy/Camel styling
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const exportPDF = async () => {
    setIsGenerating(true);
    setGenerationStep('Assembling cryptographic block variables...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setGenerationStep('Aligning authorized seal from Dean Alistair Vance...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const doc = new jsPDF();
      
      // Page frame matching Navy & Camel
      doc.setDrawColor(193, 154, 107); // Camel
      doc.setLineWidth(1.0);
      doc.rect(8, 8, 194, 281);

      doc.setDrawColor(12, 27, 51); // Navy Outline
      doc.setLineWidth(0.2);
      doc.rect(10, 10, 190, 277);

      // Header Block
      doc.setFillColor(12, 27, 51); // Heavy Navy block
      doc.rect(12, 12, 186, 32, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text("ZAFIR ELITE COMMAND ACADEMY", 105, 24, { align: 'center' });
      
      doc.setTextColor(193, 154, 107); // Camel gold tint text
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text("Registry Hub & permanent decentralized credentials ledger", 105, 31, { align: 'center' });

      // Title
      doc.setTextColor(12, 27, 51);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(15);
      doc.text("OFFICIAL REGISTERED TRANSCRIPT", 105, 56, { align: 'center' });

      // Info Table
      doc.setFillColor(245, 230, 211); // Camel light backdrop tint
      doc.rect(15, 66, 180, 36, 'F');

      doc.setTextColor(12, 27, 51);
      doc.setFontSize(9);
      doc.text("STUDENT LEGAL NAME:", 18, 73);
      doc.text(studentName.toUpperCase(), 64, 73);

      doc.text("ACADEMIC MAJOR:", 18, 80);
      doc.text(major, 64, 80);

      doc.text("DATE OF BIRTH:", 18, 87);
      doc.text(dob, 64, 87);

      doc.text("GPA CUMULATIVE:", 120, 73);
      doc.text(`${totalGPA} / 4.30`, 160, 73);

      doc.text("BLOCKCHAIN ROOT:", 120, 80);
      doc.text(blockchainId, 160, 80);

      // Complete Table Header
      doc.setFillColor(12, 27, 51);
      doc.rect(15, 110, 180, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.text("CODE", 18, 115.5);
      doc.text("MODULE TITLE", 38, 115.5);
      doc.text("CREDITS", 144, 115.5);
      doc.text("GRADE", 174, 115.5);

      let yOffset = 118;
      doc.setTextColor('#1E293B');
      courses.forEach((course) => {
        doc.text(course.code, 18, yOffset + 5.5);
        doc.text(course.name, 38, yOffset + 5.5);
        doc.text(course.credits.toFixed(1), 144, yOffset + 5.5);
        doc.text(course.grade, 174, yOffset + 5.5);
        yOffset += 8;
      });

      // Signature seals
      const sigY = yOffset + 16;
      doc.setDrawColor(193, 154, 107);
      doc.circle(45, sigY + 16, 18);
      doc.text("ZAFIR OFFICIAL", 45, sigY + 14, { align: 'center' });
      doc.text("AUTHORIZED", 45, sigY + 19, { align: 'center' });

      doc.line(100, sigY + 16, 180, sigY + 16);
      doc.text("Dr. Alistair Vance, Dean of Academic Registry", 100, sigY + 21);

      doc.save(`Zafir_Official_Ledger_${studentName.replace(' ', '_')}.pdf`);
      
      confetti({
        particleCount: 100,
        spread: 85,
        colors: ['#c19a6b', '#ffffff']
      });

    } catch (e) {
      console.error(e);
      alert('Error printing PDF.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative text-slate-800 selection:bg-[#c19a6b]/30 selection:text-[#7c5a30] font-sans-luxury">
      
      {/* LUXURY HOTEL LOBBY BG BACKDROP & SOFT BLUR EFFECT */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2600&q=85')",
          transform: "scale(1.02)",
          filter: "blur(4px) brightness(1.05) contrast(0.98)"
        }} 
      />
      {/* Warm champagne overlay for gorgeous light transmission */}
      <div className="fixed inset-0 bg-gradient-to-tr from-[#ede6d4]/40 via-[#f5f2eb]/45 to-white/35 pointer-events-none z-0" />

      {/* TOP BRADING HEADER BAR */}
      <header className="border-b border-white/60 backdrop-blur-md bg-white/40 sticky top-0 z-40 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFF3DE] to-[#c19a6b] p-[1.5px] shadow-sm">
              <div className="w-full h-full bg-white/80 rounded-xl flex items-center justify-center">
                <span className="font-serif-luxury font-bold text-lg text-[#c19a6b]">Z</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury text-lg tracking-wider font-bold text-slate-800">ZAFIR SYSTEM</span>
                <span className="text-[9px] bg-[#c19a6b]/20 text-[#7c5a30] border border-[#c19a6b]/40 px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-widest leading-none">COMMAND</span>
              </div>
              <p className="text-[10px] text-slate-600 font-mono tracking-wider uppercase">
                {activeTab === 'arrivals' && 'Zafir Command Center: Pôle Opérations'}
                {activeTab === 'room-service' && 'Zafir Command Center: Room Service Orders'}
                {activeTab === 'controls' && 'Zafir Command Center: Suite Command & Intelligence'}
                {activeTab === 'channel-sync' && 'Zafir Command Center: Pricing & Sync Engine'}
                {activeTab === 'vault' && 'Zafir Secure Vault & Document Ledger'}
                {activeTab === 'memberships' && 'Zafir Elite Club & Sovereign Membership'}
                {activeTab === 'maintenance' && 'Zafir Command Center: Facility 3D Maintenance'}
                {activeTab === 'omni-stream' && 'Zafir Omni Stream: Communication Logs'}
                {activeTab === 'ledger' && 'Zafir Scholarship Trust & PDF Ledger'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 bg-white/30 border border-white/60 px-4 py-1.5 rounded-lg text-xs shadow-sm">
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-700">Secure Network Sync Active</span>
              </div>
              <span className="text-[#7c5a30] border-l border-slate-300 pl-3 font-mono font-semibold">October 26, 2024, 10:30 AM</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">{studentName}</p>
                <p className="text-[10px] text-[#7c5a30] font-mono">REGISTRY: VIP-V</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-white/60 border border-[#c19a6b]/40 flex items-center justify-center text-[#7c5a30] font-serif-luxury text-sm font-bold shadow-sm">
                EP
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE GRID */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* SIDE BAR NAVIGATION - TRANSPARENT FROSTED GLASS */}
        <aside className="w-full lg:w-64 flex flex-row lg:flex-col gap-1.5 shrink-0 overflow-x-auto pb-2 lg:pb-0 scrollbar-none glass-panel p-4 h-fit sticky top-24 z-30 shadow-md">
          
          <button
            onClick={() => setActiveTab('arrivals')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'arrivals'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Plane className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono">Arrivals</span>
            <span className="ml-auto text-[10px] bg-sky-500/10 text-sky-700 px-1.5 py-0.2 rounded border border-sky-500/20 font-bold">VIP</span>
          </button>

          <button
            onClick={() => setActiveTab('room-service')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'room-service'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Utensils className="w-4 h-4 text-[#7c5a30]" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">Room Service</span>
            <span className="ml-auto text-[10px] bg-[#c19a6b]/15 text-[#7c5a30] px-1.5 py-0.2 rounded border border-[#c19a6b]/30 font-bold">6</span>
          </button>

          <button
            onClick={() => setActiveTab('controls')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'controls'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">Suite Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('channel-sync')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'channel-sync'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">Channel Sync</span>
            <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded border border-emerald-500/20 font-semibold font-sans-luxury">99%</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'vault'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Lock className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">Secure Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('memberships')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'memberships'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono flex-1 font-sans-luxury">Club VIP</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'maintenance'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <HardHat className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">3D Facility</span>
          </button>

          <button
            onClick={() => setActiveTab('omni-stream')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'omni-stream'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Activity className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">Omni Stream</span>
          </button>

          <div className="hidden lg:block border-t border-slate-350/50 my-4" />

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'ledger'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">Academic Ledger</span>
            <span className="ml-auto text-[9px] bg-[#c19a6b]/20 text-[#7c5a30] px-1.5 py-0.2 rounded border border-[#c19a6b]/30 font-bold">GPA {totalGPA}</span>
          </button>
        </aside>

        {/* WORKSPACE PREVIEW GLASS STAGE CONTENT */}
        <main className="flex-1 flex flex-col gap-6" id="workspace-stage">
          {activeTab === 'arrivals' && <ArrivalsTab vipGuests={vipGuests} flights={flights} />}
          
          {activeTab === 'room-service' && <RoomServiceTab roomOrders={roomOrders} advanceOrderStatus={advanceOrderStatus} />}
          
          {activeTab === 'controls' && (
            <ControlsTab
              lightScene={lightScene}
              setLightScene={setLightScene}
              currentTemp={currentTemp}
              setCurrentTemp={setCurrentTemp}
              targetTemp={targetTemp}
              setTargetTemp={setTargetTemp}
              glassOpacity={glassOpacity}
              setGlassOpacity={setGlassOpacity}
              glowingRooms={glowingRooms}
              toggleRoomGlow={toggleRoomGlow}
            />
          )}

          {activeTab === 'channel-sync' && <ChannelSyncTab channels={channels} syncLogs={syncLogs} />}

          {activeTab === 'vault' && <VaultTab vaultDocs={vaultDocs} startDecrypt={handleDecrypt} />}

          {activeTab === 'memberships' && <MembershipsTab />}

          {activeTab === 'maintenance' && <MaintenanceTab />}

          {activeTab === 'omni-stream' && <OmniStreamTab />}

          {activeTab === 'ledger' && (
            <LedgerTab
              studentName={studentName}
              studentId={studentId}
              totalGPA={totalGPA}
              totalCredits={totalCredits}
              blockchainId={blockchainId}
              courses={courses}
              addCourse={addCourse}
              removeCourse={removeCourse}
              exportPDF={exportPDF}
              isGenerating={isGenerating}
              qrCodeUrl={qrCodeUrl}
            />
          )}
        </main>

      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-[#050b16]/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="glass-panel p-8 rounded-2xl max-w-sm text-center border border-[#c19a6b]/35 bg-[#0c1b33]">
            <RefreshCw className="w-8 h-8 text-[#c19a6b] animate-spin mx-auto mb-4" />
            <h4 className="text-sm font-semibold text-slate-100 mb-1">Generating Cryptographic PDF Ledger</h4>
            <span className="text-xs text-[#c19a6b] font-mono block animate-pulse">{generationStep}</span>
          </div>
        </div>
      )}

    </div>
  );
}
