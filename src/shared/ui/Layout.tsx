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
  RefreshCw,
  ShieldAlert,
  Cpu,
  Moon,
  Sun,
  Fingerprint,
  Settings,
  X,
  Languages,
  Users,
  Hotel,
  ShoppingCart,
  BarChart2
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';

// Shared types and tab subcomponents
import { Course, RoomServiceOrder, VaultDocument } from './types';
import { INITIAL_COURSES, INITIAL_ROOM_ORDERS, INITIAL_AUDITS, translations, AuditEntry } from '../data/mockData';
import { useAddAuditLog, useAuditStore } from '../store/auditStore';
import { useAppStore } from '../store/appStore';
import { ArrivalsTab } from './components/ArrivalsTab';
import { RoomServiceTab } from './components/RoomServiceTab';
import { ControlsTab } from './components/ControlsTab';
import { ChannelSyncTab } from './components/ChannelSyncTab';
import { VaultTab } from './components/VaultTab';
import { MembershipsTab } from './components/MembershipsTab';
import { MaintenanceTab } from './components/MaintenanceTab';
import { OmniStreamTab } from './components/OmniStreamTab';
import { LedgerTab } from './components/LedgerTab';
import { ManagementTab } from './components/ManagementTab';
import { HospitalityManagerTab } from './components/HospitalityManagerTab';
import { POSTab } from './components/POSTab';
import { AnalyticsTab } from './components/AnalyticsTab';

function computeSimpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return '0x' + hex + 'afde9c3b' + Math.abs(hash * 31).toString(16).padEnd(20, '4').slice(0, 20);
}


export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'arrivals';
  const [language, setLanguage] = useState<'EN' | 'FR' | 'RU'>('EN');

  const t = (key: keyof typeof translations['EN']) => {
    return translations[language][key] || translations['EN'][key] || '';
  };

  // Dynamic 5 Styles and 5 RBAC options state!
  const [userRole, setUserRole] = useState<'operator' | 'manager'>('operator');
  const [styleMode, setStyleMode] = useState<'standard' | 'cyberpunk' | 'luxury'>('standard');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [colorScheme, setColorScheme] = useState<'gold' | 'sapphire' | 'emerald' | 'sunset'>('gold');

  const addAuditLog = useAddAuditLog();
  const fetchAudits = useAuditStore(s => s.fetchAudits);
  const { fetchAppData, connectWebSocket } = useAppStore();

  // Elevation sequence overlay/countdown state
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [isCounting, setIsCounting] = useState(false);
  const [attemptedTab, setAttemptedTab] = useState<string | null>(null);

  // Fingerprint Scan Simulator State
  const [fingerprintScanStatus, setFingerprintScanStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  // Student details
  const [studentName] = useState<string>('Elena Petrova');
  const [studentId] = useState<string>('ZCA-2024-9182');
  const [dob] = useState<string>('1998-05-14');
  const [major] = useState<string>('Master of Premium Hospitality');
  const [blockchainId] = useState<string>('0x89C...D4AF');
  const courses = useAppStore(s => s.courses);

  useEffect(() => {
    fetchAudits();
    fetchAppData();
    connectWebSocket();
  }, []);

  // Trigger role elevation countdown
  const startOverrideSequence = (tabToOpen: string) => {
    setAttemptedTab(tabToOpen);
    setCountdown(5);
    setOverrideReason('');
    setShowOverrideModal(true);
    setFingerprintScanStatus('idle');
    setIsCounting(false);
  };

  // Handle countdown interval
  useEffect(() => {
    let timer: any;
    if (isCounting) {
      if (countdown > 0) {
        timer = setTimeout(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
      } else {
        setIsCounting(false);
        // Completed successfully!
        setUserRole('manager');
        setShowOverrideModal(false);
        addAuditLog(
          'EMERGENCY_SOVEREIGN_BYPASS',
          `Bypassed access restriction with reason: "${overrideReason || 'Direct emergency override manual elevation'}"`,
          'BYPASS',
          'MANAGER'
        );
        if (attemptedTab) {
          navigate(`/${attemptedTab}`);
        }
        confetti({
          particleCount: 150,
          spread: 85,
          colors: ['#c19a6b', '#ffffff', '#ffd700']
        });
      }
    }
    return () => clearTimeout(timer);
  }, [countdown, isCounting]);

  // Core interactions
  const navigateToTab = (tab: string) => {
    if (userRole === 'operator' && ['controls', 'channel-sync', 'vault', 'maintenance'].includes(tab)) {
      setAttemptedTab(tab);
      navigate(`/${tab}`);
      addAuditLog(
        'SECURITY_INTERCEPT',
        `Operator L4 attempted unauthorized access to secure node: ${tab.toUpperCase()}`,
        'RESTRICTED_ATTEMPT'
      );
    } else {
      navigate(`/${tab}`);
      if (tab !== activeTab) {
        addAuditLog(
          'NODE_TRAVERSAL',
          `Sovereign context switched to ${tab.toUpperCase()} node`,
          'AUTHORIZED'
        );
      }
    }
  };

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

  // 2. ROOM SERVICE ORDERS (Moved to appStore)

  // 3. ENVIRONMENTAL SUITE COMMAND CONTROLS (Moved to appStore)

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

  // 5. SECURE VAULT ACCESS CONTROL (Moved to appStore)

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

  // QR CODE HANDLER

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
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const [showSettings, setShowSettings] = useState(false);

  // Dynamic CSS variables injected on render corresponding to custom theme parameters
  const getDynamicStyles = () => {
    const styles: Record<string, string> = {};
    if (colorScheme === 'gold') {
      styles['--accent-color'] = '#c19a6b';
      styles['--accent-rgb'] = '193, 154, 107';
    } else if (colorScheme === 'sapphire') {
      styles['--accent-color'] = '#3b82f6';
      styles['--accent-rgb'] = '59, 130, 246';
    } else if (colorScheme === 'emerald') {
      styles['--accent-color'] = '#10b981';
      styles['--accent-rgb'] = '16, 185, 129';
    } else if (colorScheme === 'sunset') {
      styles['--accent-color'] = '#f97316';
      styles['--accent-rgb'] = '249, 115, 22';
    }
    return styles as React.CSSProperties;
  };

  // Render Lock Screen for Operator when accessing restricted nodes
  const renderClearanceLockScreen = (restrictedTab: string) => {
    return (
      <div 
        className={`p-10 rounded-3xl text-center flex flex-col items-center justify-center space-y-6 relative overflow-hidden transition-all duration-300 border-2 border-black max-w-4xl mx-auto shadow-[0_0_20px_rgba(var(--accent-rgb),0.6)] ${
          themeMode === 'light' ? 'bg-[#fcfaf2]/95 text-stone-900 shadow-[0_0_22px_#000]' : 'bg-[#0b1626]/90 text-stone-100'
        }`}
        style={{ minHeight: '480px' }}
      >
        {styleMode === 'cyberpunk' && (
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-pink-500/5 pointer-events-none animate-pulse" />
        )}
        
        <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center text-red-500 animate-pulse relative">
          <ShieldAlert className="w-10 h-10" />
          <span className="absolute inset-0 w-full h-full rounded-full border border-red-500 animate-ping opacity-60" />
        </div>
        
        <div className="space-y-2 max-w-lg">
          <h2 className="text-2xl font-sans font-bold uppercase tracking-widest text-red-500">
            Clearance Level Insufficient
          </h2>
          <p className="text-xs font-mono text-red-400 font-bold tracking-wider">
            RESTRICTED SYSTEM ARCHITECTURE IS SHIELDED
          </p>
          <div className="bg-black/90 border-2 border-stone-800 rounded-2xl p-5 my-4 font-mono text-[11px] text-left text-slate-300 shadow-inner">
            <p className="text-[#c19a6b] font-bold">// SECURE REGISTRY COMPLIANCE DETECTED:</p>
            <p className="text-xs text-slate-100 font-bold mb-2">ACCESS_STAGE: {restrictedTab.toUpperCase()}_v2</p>
            <div className="border-t border-stone-800 pt-2 space-y-1 text-[10px]">
              <p><span className="text-slate-400">Current Node Level:</span> LEVEL-4 (Active Operator)</p>
              <p><span className="text-slate-400">Required Clearance:</span> LEVEL-5 (Sovereign Proprietor)</p>
            </div>
          </div>
        </div>

        {/* Identity confirmation/fingerprint scanner card */}
        <div className="bg-black/90 p-6 rounded-2xl w-full max-w-md flex flex-col items-center gap-4 relative border-2 border-stone-800 shadow-[0_0_15px_rgba(193,154,107,0.3)]">
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#c19a6b]">Sovereign Identity Verification</h4>
          
          <button
            onClick={() => {
              if (fingerprintScanStatus === 'idle') {
                setFingerprintScanStatus('scanning');
                setTimeout(() => {
                  setFingerprintScanStatus('success');
                  confetti({ particleCount: 35, spread: 45, colors: ['#c19a6b', '#ffffff'] });
                }, 1600);
              }
            }}
            className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 relative overflow-hidden ${
              fingerprintScanStatus === 'idle' ? 'border-[#c19a6b]/45 bg-stone-900 text-[#c19a6b] hover:scale-105 hover:bg-stone-800' :
              fingerprintScanStatus === 'scanning' ? 'border-sky-500 bg-sky-950/20 text-sky-400' :
              'border-emerald-500 bg-emerald-950/20 text-emerald-400'
            }`}
          >
            {fingerprintScanStatus === 'scanning' && (
              <span className="absolute inset-x-0 h-[2px] bg-sky-400 animate-[bounce_1.5s_infinite] shadow-[0_0_12px_#38bdf8]" />
            )}
            <Fingerprint className={`w-12 h-12 ${fingerprintScanStatus === 'scanning' ? 'animate-pulse' : ''}`} />
          </button>

          <span className="text-[10px] font-mono text-[#c19a6b] tracking-wider uppercase font-bold text-center">
            {fingerprintScanStatus === 'idle' && 'Click biometrics grid to initialize biometric scan'}
            {fingerprintScanStatus === 'scanning' && 'Calibrating local telemetry nodes...'}
            {fingerprintScanStatus === 'success' && 'Biometrics confirmed: Petrova E. (ZCA-2024-9182)'}
          </span>

          {fingerprintScanStatus === 'success' && (
            <button
              onClick={() => startOverrideSequence(restrictedTab)}
              className="bg-[#c19a6b] hover:bg-white text-black font-mono font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition duration-150 border-2 border-stone-900 shadow-[0_0_10px_#c19a6b] w-full"
            >
              ⚡ Initiate Sovereign Role Override Sequence
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render Sovereign Bypass Modal
  const renderOverrideModal = () => {
    if (!showOverrideModal) return null;
    const isReady = countdown === 0 && overrideReason.trim().length > 0;
    
    return (
      <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-md">
        <div className="premium-border-glow p-8 rounded-3xl max-w-md w-full text-center bg-[#070d19] border-2 border-stone-950 relative shadow-[0_0_30px_rgba(193,154,107,0.7)]">
          
          <button 
            onClick={() => {
              setShowOverrideModal(false);
              setIsCounting(false);
            }} 
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-[#c19a6b]/10 border-2 border-[#c19a6b] flex items-center justify-center text-[#c19a6b] mx-auto mb-4 animate-pulse">
            <Cpu className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-serif-luxury font-bold text-slate-100 mb-2">Sovereign Authority Override</h3>
          <p className="text-[11px] text-slate-400 mb-4 font-mono">
            Direct vice-dean security bypass. Enter cryptographic log reason to launch sequence.
          </p>

          <div className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#c19a6b] block">
                Forensic Bypass Reason
              </label>
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Authorized audit & maintenance synchronization"
                className="w-full bg-black border-2 border-stone-900 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-[#c19a6b] font-mono shadow-inner"
              />
            </div>

            <div className="bg-black p-4 rounded-xl border-2 border-stone-950 text-center relative overflow-hidden">
              <span className="text-[10px] font-mono tracking-widest text-[#c19a6b] uppercase block mb-1">Calibration Progress</span>
              
              {countdown > 0 ? (
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-mono font-bold text-[#ef4444] tracking-tight">{countdown}s</span>
                  {isCounting ? (
                    <span className="text-[9px] font-mono text-slate-400 block animate-pulse">Synchronizing ledger chain security...</span>
                  ) : (
                    <button
                      onClick={() => setIsCounting(true)}
                      disabled={overrideReason.trim().length === 0}
                      className="mt-2 py-1.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-mono font-bold uppercase transition"
                    >
                      Begin Cryptographic Run
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-emerald-500 font-mono font-bold">✓ AUTHENTICATION BLOCKS SEALED</span>
                  <span className="text-[9px] text-slate-400 font-mono uppercase">Decentralized token ready for signature</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (isReady) {
                  setIsCounting(false);
                  setUserRole('manager');
                  setShowOverrideModal(false);
                  addAuditLog(
                    'EMERGENCY_SOVEREIGN_BYPASS',
                    `Bypassed restriction to tab "${attemptedTab?.toUpperCase()}" with reason: "${overrideReason}"`,
                    'BYPASS',
                    'MANAGER'
                  );
                  if (attemptedTab) {
                    navigate(`/${attemptedTab}`);
                  }
                  confetti({
                    particleCount: 150,
                    spread: 85,
                    colors: ['#c19a6b', '#ffffff', '#ffd700']
                  });
                }
              }}
              disabled={!isReady}
              className={`w-full py-3 rounded-xl text-xs font-mono uppercase tracking-widest transition shadow font-bold border-2 border-stone-950 ${
                isReady 
                  ? 'bg-[#c19a6b] text-black hover:bg-white' 
                  : 'bg-stone-900 text-stone-500 cursor-not-allowed'
              }`}
            >
              Sign override block (Level 5)
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Drawer with Aesthetic/Role options
  const renderSettingsDrawer = () => {
    if (!showSettings) return null;
    return (
      <div className="fixed inset-y-0 right-0 w-80 bg-black/95 backdrop-blur-md border-l-2 border-stone-850 shadow-[0_0_35px_rgba(0,0,0,0.9)] z-50 p-6 flex flex-col justify-between animate-fade-in text-stone-100">
        <div className="space-y-5 overflow-y-auto max-h-[85vh] scrollbar-none pr-1">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#c19a6b] flex items-center gap-2">
              <Settings className="w-4 h-4 animate-spin-slow" /> {t('settingsHeading')}
            </h3>
            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Theme Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
              {t('themeHeading')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setThemeMode('dark');
                  addAuditLog('THEME_RECALIBRATION', 'Switched master lightwave back into Deep Cosmic Obsidian Dark mode.', 'AUTHORIZED');
                }}
                className={`py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1 border-2 ${
                  themeMode === 'dark'
                    ? 'bg-black border-[#c19a6b] text-[#c19a6b]'
                    : 'bg-stone-900 border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> {t('themeDark')}
              </button>
              <button
                onClick={() => {
                  setThemeMode('light');
                  addAuditLog('THEME_RECALIBRATION', 'Calibrated master lightwave into Champagne Light mode.', 'AUTHORIZED');
                }}
                className={`py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1 border-2 ${
                  themeMode === 'light'
                    ? 'bg-white border-black text-black'
                    : 'bg-stone-900 border-transparent text-stone-400 hover:text-stone-100'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" /> {t('themeLight')}
              </button>
            </div>
          </div>

          {/* 2. Visual Style Presets (5 Styles options) */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
              {t('aestheticHeading')}
            </label>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setStyleMode('standard');
                  addAuditLog('AESTHETIC_RECONFIG', 'Restored Zafir Command standard luxury visual layouts.', 'AUTHORIZED');
                }}
                className={`p-2.5 rounded-xl border-2 text-left text-xs font-mono font-bold flex justify-between items-center ${
                  styleMode === 'standard' 
                    ? 'bg-black border-[#c19a6b] text-[#c19a6b]' 
                    : 'bg-stone-900 border-transparent text-slate-300 hover:bg-stone-850'
                }`}
              >
                <span>{t('aestheticStandard')}</span>
                <span className="text-[9px] bg-[#c19a6b]/20 px-1.5 py-0.5 rounded text-[#c19a6b]">ACTIVE</span>
              </button>

              <button
                onClick={() => {
                  setStyleMode('cyberpunk');
                  addAuditLog('AESTHETIC_RECONFIG', 'Forced Cyberpunk Extrême mode. Active CRT scanlines, flicker & cyan neon spikes.', 'AUTHORIZED');
                }}
                className={`p-2.5 rounded-xl border-2 text-left text-xs font-mono font-bold flex justify-between items-center ${
                  styleMode === 'cyberpunk' 
                    ? 'bg-black border-[#00ffff] text-[#00ffff]' 
                    : 'bg-stone-900 border-transparent text-slate-300 hover:bg-stone-850'
                }`}
              >
                <span>{t('aestheticCyberpunk')}</span>
                <span className="text-[9px] bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-400">NEON</span>
              </button>

              <button
                onClick={() => {
                  setStyleMode('luxury');
                  addAuditLog('AESTHETIC_RECONFIG', 'Adopted Quiet Luxury style: thin Georgia serifs with muted borders.', 'AUTHORIZED');
                }}
                className={`p-2.5 rounded-xl border-2 text-left text-xs font-mono font-bold flex justify-between items-center ${
                  styleMode === 'luxury' 
                    ? 'bg-black border-[#ffd700] text-[#ffd700]' 
                    : 'bg-stone-900 border-transparent text-slate-300 hover:bg-stone-850'
                }`}
              >
                <span>{t('aestheticLuxury')}</span>
                <span className="text-[9px] bg-yellow-500/10 px-1.5 py-0.5 rounded text-yellow-300">ESTATE</span>
              </button>
            </div>
          </div>

          {/* 3. Gem Accent Light Options */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
              {t('glowHeading')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'gold', code: '#c19a6b', label: 'Gold' },
                { name: 'sapphire', code: '#3b82f6', label: 'Sapphire' },
                { name: 'emerald', code: '#10b981', label: 'Forest' },
                { name: 'sunset', code: '#f97316', label: 'Riviera' },
              ].map(gem => (
                <button
                  key={gem.name}
                  onClick={() => {
                    setColorScheme(gem.name as any);
                    addAuditLog('GLOW_PIGMENT_RECALIBRATION', `Adjusted parity pigment lightwave to ${gem.label.toUpperCase()}.`, 'AUTHORIZED');
                  }}
                  className={`flex flex-col items-center gap-1 p-1 py-2 rounded-xl border-2 transition ${
                    colorScheme === gem.name ? 'bg-black border-[#c19a6b]' : 'bg-stone-900 border-transparent hover:bg-stone-850'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full" style={{ backgroundColor: gem.code, boxShadow: `0 0 10px ${gem.code}` }} />
                  <span className="text-[8px] font-mono uppercase text-stone-400 font-bold">{gem.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Active Clearance Role Toggle */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
              {t('securityRoleHeading')}
            </label>
            <div className="flex bg-black p-1 rounded-xl border-2 border-stone-950">
              <button
                onClick={() => {
                  setUserRole('operator');
                  addAuditLog('MANUAL_ROLE_REVOCATION', 'Active operator manually revoked higher Level 5 clearance. Shifted back to Operator.', 'AUTHORIZED');
                  confetti({ particleCount: 15, spread: 25, colors: ['#3b82f6'] });
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase transition ${
                  userRole === 'operator'
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {t('operator')}
              </button>
              <button
                onClick={() => {
                  setUserRole('manager');
                  addAuditLog('MANUAL_ROLE_ELEVATION', 'Manual bypass switch to high Proprietor Level 5 clearance enabled.', 'AUTHORIZED');
                  confetti({ particleCount: 40, spread: 45, colors: ['#ffd700'] });
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
                  userRole === 'manager'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {t('manager')}
              </button>
            </div>
          </div>

          {/* 5. Aesthetic Language Matrix */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1 font-bold">
              <Languages className="w-3.5 h-3.5 text-[#c19a6b]" /> {t('languageMatrix')}
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-black p-1 rounded-xl border-2 border-stone-950">
              {[
                { code: 'EN', name: 'English', flag: '🇬🇧' },
                { code: 'FR', name: 'Français', flag: '🇫🇷' },
                { code: 'RU', name: 'Русский', flag: '🇷🇺' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as any);
                    addAuditLog('LANGUAGE_RECONSTITUTE', `Switched application linguistic framework to ${lang.name.toUpperCase()}.`, 'AUTHORIZED');
                    confetti({ particleCount: 15, spread: 30 });
                  }}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition flex flex-col items-center justify-center border-2 ${
                    language === lang.code
                      ? 'bg-black border-[#c19a6b] text-[#c19a6b] font-bold'
                      : 'bg-stone-900 border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                  }`}
                >
                  <span className="text-[11px] mb-0.5">{lang.flag}</span>
                  <span className="text-[9px] uppercase tracking-wider">{lang.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-850 text-center font-mono text-[9px] text-stone-500">
          <p>{t('stylesEngine')}</p>
          <p className="text-[#c19a6b]">{t('sovereignLive')}</p>
        </div>
      </div>
    );
  };

  return (
    <div 
      style={getDynamicStyles()}
      className={`min-h-screen flex flex-col relative selection:bg-[#c19a6b]/30 selection:text-[#7c5a30] transition-colors duration-300 ${
        themeMode === 'light' ? 'bg-[#faf7f0] text-stone-900 border-[#0a0a0c]' : 'bg-[#040914] text-slate-100'
      } ${
        styleMode === 'cyberpunk' ? 'font-mono text-cyan-400 font-bold cyberpunk-extreme' : 
        styleMode === 'luxury' ? 'font-serif text-stone-900 tracking-wide font-light' : 'font-sans'
      }`}
    >
      
      {/* BACKGROUNDS FOR LIGHT AND DARK MODES */}
      {themeMode === 'dark' ? (
        <>
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 opacity-40 transition-opacity duration-300" 
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2600&q=85')",
              transform: "scale(1.02)",
              filter: "blur(5px) brightness(0.6) contrast(1.1)"
            }} 
          />
          {/* Neon scanlines overlay for cyberpunk dark mode */}
          {styleMode === 'cyberpunk' && (
            <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-0 opacity-40 animate-pulse" />
          )}
          <div className="fixed inset-0 bg-gradient-to-tr from-[#02050b]/90 via-[#070e1b]/85 to-transparent pointer-events-none z-0" />
        </>
      ) : (
        <>
          <div className="fixed inset-0 bg-gradient-to-tr from-[#ede4d2]/35 via-[#faf8f4]/60 to-[#ffffff]/90 pointer-events-none z-0" />
          <div className="fixed inset-0 bg-[radial-gradient(#c19a6b_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none z-0" />
        </>
      )}

      {/* Floating Settings Button in bottom-right corner */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-black border-2 border-stone-800 shadow-[0_0_15px_rgba(193,154,107,0.85)] text-[#c19a6b] hover:text-white hover:scale-110 active:scale-95 transition-all duration-200"
        title="Custom Sovereign Aesthetics Deck"
      >
        <Settings className="w-5.5 h-5.5 animate-[spin_10s_linear_infinite]" />
      </button>

      {/* Drawers and modals renderers */}
      {renderSettingsDrawer()}
      {renderOverrideModal()}

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
                {activeTab === 'arrivals' && t('tabArrivalsHeader')}
                {activeTab === 'room-service' && t('tabRoomServiceHeader')}
                {activeTab === 'controls' && t('tabControlsHeader')}
                {activeTab === 'channel-sync' && t('tabChannelSyncHeader')}
                {activeTab === 'vault' && t('tabVaultHeader')}
                {activeTab === 'memberships' && t('tabMembershipsHeader')}
                {activeTab === 'maintenance' && t('tabMaintenanceHeader')}
                {activeTab === 'omni-stream' && t('tabOmniStreamHeader')}
                {activeTab === 'ledger' && t('tabLedgerHeader')}
                {activeTab === 'management' && t('tabManagementHeader')}
                {activeTab === 'hospitality-manager' && t('tabHospitalityHeader')}
                {activeTab === 'pos' && t('tabPOSHeader')}
                {activeTab === 'analytics' && t('tabAnalyticsHeader')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 bg-white/30 border border-white/60 px-4 py-1.5 rounded-lg text-xs shadow-sm">
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-700">{t('syncActive')}</span>
              </div>
              <span className="text-[#7c5a30] border-l border-slate-300 pl-3 font-mono font-semibold">October 26, 2024, 10:30 AM</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">{studentName}</p>
                <p className="text-[10px] text-[#7c5a30] font-mono">{t('registry')}: VIP-V</p>
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
            onClick={() => navigateToTab('arrivals')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'arrivals'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Plane className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono">{t('tabArrivals')}</span>
            <span className="ml-auto text-[10px] bg-sky-500/10 text-sky-700 px-1.5 py-0.2 rounded border border-sky-500/20 font-bold">VIP</span>
          </button>

          <button
            onClick={() => navigateToTab('room-service')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'room-service'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Utensils className="w-4 h-4 text-[#7c5a30]" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabRoomService')}</span>
            <span className="ml-auto text-[10px] bg-[#c19a6b]/15 text-[#7c5a30] px-1.5 py-0.2 rounded border border-[#c19a6b]/30 font-bold">6</span>
          </button>

          <button
            onClick={() => navigateToTab('controls')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'controls'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabControls')}</span>
            {userRole === 'operator' && <Lock className="w-3.5 h-3.5 text-red-500/80 shrink-0 ml-auto animate-pulse" />}
          </button>

          <button
            onClick={() => navigateToTab('channel-sync')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'channel-sync'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabChannelSync')}</span>
            {userRole === 'operator' ? (
              <Lock className="w-3.5 h-3.5 text-red-500/80 shrink-0 ml-auto animate-pulse" />
            ) : (
              <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded border border-emerald-500/20 font-semibold font-sans-luxury">99%</span>
            )}
          </button>

          <button
            onClick={() => navigateToTab('vault')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'vault'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Lock className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabVault')}</span>
            {userRole === 'operator' && <Lock className="w-3.5 h-3.5 text-red-500/80 shrink-0 ml-auto animate-pulse" />}
          </button>

          <button
            onClick={() => navigateToTab('memberships')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'memberships'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono flex-1 font-sans-luxury">{t('tabMemberships')}</span>
          </button>

          <button
            onClick={() => navigateToTab('maintenance')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'maintenance'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <HardHat className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabMaintenance')}</span>
            {userRole === 'operator' && <Lock className="w-3.5 h-3.5 text-red-500/80 shrink-0 ml-auto animate-pulse" />}
          </button>

          <button
            onClick={() => navigateToTab('omni-stream')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'omni-stream'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Activity className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabOmniStream')}</span>
          </button>

          <div className="hidden lg:block border-t border-slate-350/50 my-4" />

          <button
            onClick={() => navigateToTab('ledger')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'ledger'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabLedger')}</span>
            <span className="ml-auto text-[9px] bg-[#c19a6b]/20 text-[#7c5a30] px-1.5 py-0.2 rounded border border-[#c19a6b]/30 font-bold">GPA {totalGPA}</span>
          </button>

          <button
            onClick={() => navigateToTab('management')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'management'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Users className="w-4 h-4 text-[#7c5a30]" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabManagement')}</span>
            <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded border border-emerald-500/20 font-bold font-mono">SYS</span>
          </button>

          <button
            onClick={() => navigateToTab('hospitality-manager')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'hospitality-manager'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <Hotel className="w-4 h-4 text-[#7c5a30]" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabHospitality')}</span>
            <span className="ml-auto text-[10px] bg-[#c19a6b]/20 text-[#7c5a30] px-1.5 py-0.2 rounded border border-[#c19a6b]/40 font-bold font-mono">OPS</span>
          </button>

          <button
            onClick={() => navigateToTab('pos')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'pos'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabPOS')}</span>
            <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded border border-emerald-500/20 font-bold font-mono">NEW</span>
          </button>

          <button
            onClick={() => navigateToTab('analytics')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full shrink-0 lg:shrink text-left ${
              activeTab === 'analytics'
                ? 'bg-[#c19a6b]/20 border border-[#c19a6b]/40 text-[#7c5a30] font-bold shadow-sm font-sans-luxury'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/30 border border-transparent'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono font-sans-luxury">{t('tabAnalytics')}</span>
            <span className="ml-auto text-[10px] bg-indigo-500/10 text-indigo-600 px-1.5 py-0.2 rounded border border-indigo-500/20 font-bold font-mono">NEW</span>
          </button>
        </aside>

        {/* WORKSPACE PREVIEW GLASS STAGE CONTENT */}
        <main className="flex-1 flex flex-col gap-6 animate-fade-in" id="workspace-stage">
          {userRole === 'operator' && ['controls', 'channel-sync', 'vault', 'maintenance'].includes(activeTab) ? (
            renderClearanceLockScreen(activeTab)
          ) : (
            <Outlet />
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
