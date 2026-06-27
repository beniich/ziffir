// @ts-nocheck
// src/contexts/AppContext.tsx
// ============================================================================
// Contexte global — toute la logique d'état extraite de App.tsx
// Pattern : Single source of truth, lazy-loaded data per domain
// ============================================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { api } from '../api';
import type { Course, RoomServiceOrder, VaultDocument } from '../types';

// ─── Types ──────────────────────────────────────────────────────────────────

export type TabId =
  | 'prestige-portal'
  | 'arrivals'
  | 'room-service'
  | 'controls'
  | 'channel-sync'
  | 'vault'
  | 'memberships'
  | 'billing'
  | 'maintenance'
  | 'omni-stream'
  | 'ledger'
  | 'management'
  | 'hospitality-manager'
  | 'wine-cellar'
  | 'profile'
  | 'settings'
  | 'design-showcase'
  | 'user-directory';

export type Language = 'EN' | 'FR' | 'RU';
export type StyleMode = 'standard' | 'cyberpunk' | 'luxury';
export type ThemeMode = 'dark' | 'light';
export type ColorScheme = 'gold' | 'sapphire' | 'emerald' | 'sunset';
export type UserRole = 'operator' | 'manager';
export type FingerprintStatus = 'idle' | 'scanning' | 'success';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  role: string;
  reason: string;
  previousHash: string;
  hash: string;
  status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT';
}

export interface VipGuest {
  id: string;
  name: string;
  vip: string;
  status: string;
  info: string;
  flight: string;
  serviceLevel: string;
  totalSpend: number;
  checkInDate: string;
}

interface AppContextValue {
  // ── Navigation ─────────────────────────────────────────────
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // ── UI / Theme ─────────────────────────────────────────────
  language: Language;
  setLanguage: (lang: Language) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  styleMode: StyleMode;
  setStyleMode: (mode: StyleMode) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
  getDynamicStyles: () => React.CSSProperties;

  // ── Student / Profile ──────────────────────────────────────
  studentName: string;
  setStudentName: (n: string) => void;
  studentId: string;
  dob: string;
  major: string;
  blockchainId: string;

  // ── Audit Logs ─────────────────────────────────────────────
  auditLogs: AuditEntry[];
  addAuditLog: (
    action: string,
    reason: string,
    status: AuditEntry['status'],
    roleStr?: string
  ) => void;

  // ── Elevation/Override Modal ───────────────────────────────
  showOverrideModal: boolean;
  setShowOverrideModal: (v: boolean) => void;
  overrideReason: string;
  setOverrideReason: (v: string) => void;
  countdown: number;
  isCounting: boolean;
  setIsCounting: (v: boolean) => void;
  attemptedTab: string | null;
  startOverrideSequence: (tab: string) => void;
  fingerprintScanStatus: FingerprintStatus;
  setFingerprintScanStatus: (v: FingerprintStatus) => void;

  // ── Arrivals ───────────────────────────────────────────────
  vipGuests: VipGuest[];
  flights: { id: string; status: string; time: string }[];

  // ── Room Service ───────────────────────────────────────────
  roomOrders: RoomServiceOrder[];
  advanceOrderStatus: (id: string) => void;

  // ── Controls ───────────────────────────────────────────────
  lightScene: 'ambient' | 'bright' | 'relax' | 'night';
  setLightScene: (s: 'ambient' | 'bright' | 'relax' | 'night') => void;
  currentTemp: number;
  setCurrentTemp: (v: number) => void;
  targetTemp: number;
  setTargetTemp: (v: number) => void;
  glassOpacity: number;
  setGlassOpacity: (v: number) => void;
  glowingRooms: Record<string, boolean>;
  toggleRoomGlow: (room: string) => void;

  // ── Channel Sync ───────────────────────────────────────────
  channels: { name: string; status: string; iconColor: string }[];
  syncLogs: string[];

  // ── Vault ──────────────────────────────────────────────────
  vaultDocs: VaultDocument[];
  handleDecrypt: (id: string) => void;

  // ── Ledger / Courses ───────────────────────────────────────
  courses: Course[];
  totalGPA: string;
  totalCredits: number;
  addCourse: (c: Course) => void;
  removeCourse: (code: string) => void;
  qrCodeUrl: string;

  // ── PDF Export ─────────────────────────────────────────────
  isGenerating: boolean;
  generationStep: string;
  exportPDF: () => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeSimpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0').repeat(4).slice(0, 64);
}

const INITIAL_COURSES: Course[] = [
  { code: 'HOT-501', name: 'Advanced Revenue Management', credits: 4, grade: 'A+' },
  { code: 'HOT-502', name: 'Luxury Service Design', credits: 3, grade: 'A' },
  { code: 'HOT-503', name: 'Strategic Hospitality Leadership', credits: 4, grade: 'A+' },
  { code: 'HOT-504', name: 'Digital Guest Experience', credits: 3, grade: 'B+' },
  { code: 'HOT-505', name: 'Culinary Arts & Sommelier Practice', credits: 3, grade: 'A-' },
];

const INITIAL_AUDITS: AuditEntry[] = [
  {
    id: 'LOG-001',
    timestamp: '06/01/2026 09:00 AM',
    action: 'SYSTEM_BOOT',
    role: 'SYSTEM',
    reason: 'Zafir Command Nexus initialized.',
    previousHash: '0'.repeat(64),
    hash: computeSimpleHash('SYSTEM_BOOT-LOG-001'),
    status: 'AUTHORIZED',
  },
];

// ─── Context ─────────────────────────────────────────────────────────────────

const AppCtx = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  // ── Navigation ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('prestige-portal');

  // ── UI / Theme ────────────────────────────────────────────────────────────
  const [language, setLanguage] = useState<Language>('EN');
  const [userRole, setUserRole] = useState<UserRole>('operator');
  const [styleMode, setStyleMode] = useState<StyleMode>('standard');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('gold');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getDynamicStyles = useCallback((): React.CSSProperties => {
    const map: Record<ColorScheme, { color: string; rgb: string }> = {
      gold: { color: '#c19a6b', rgb: '193, 154, 107' },
      sapphire: { color: '#3b82f6', rgb: '59, 130, 246' },
      emerald: { color: '#10b981', rgb: '16, 185, 129' },
      sunset: { color: '#f97316', rgb: '249, 115, 22' },
    };
    return {
      '--accent-color': map[colorScheme].color,
      '--accent-rgb': map[colorScheme].rgb,
    } as React.CSSProperties;
  }, [colorScheme]);

  // ── Student / Profile ─────────────────────────────────────────────────────
  const [studentName, setStudentName] = useState('Elena Petrova');
  const studentId = 'ZCA-2024-9182';
  const dob = '1998-05-14';
  const major = 'Master of Premium Hospitality';
  const blockchainId = '0x89C...D4AF';

  // ── Audit Logs ────────────────────────────────────────────────────────────
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(INITIAL_AUDITS);

  useEffect(() => {
    api.audits.list(50).then((res: any) => {
      if (res.success && res.data?.length > 0) {
        setAuditLogs(
          res.data.map((a: any) => ({
            id: a.logId || a.id,
            timestamp: new Date(a.timestamp).toLocaleString('en-US'),
            action: a.action,
            role: a.userName || 'SYSTEM',
            reason: a.reason,
            previousHash: a.previousHash,
            hash: a.hash,
            status: a.status,
          }))
        );
      }
    }).catch(() => {});
  }, []);

  const addAuditLog = useCallback(
    (
      action: string,
      reason: string,
      status: AuditEntry['status'],
      roleStr = 'SYSTEM'
    ) => {
      setAuditLogs((prev) => {
        const lastEntry = prev[prev.length - 1] || INITIAL_AUDITS[0];
        const prevHash = lastEntry.hash;
        const timestampStr = new Date().toLocaleString('en-US', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        }).replace(',', '');
        const id = `LOG-${String(prev.length + 1).padStart(3, '0')}`;
        const newEntry: AuditEntry = {
          id,
          timestamp: timestampStr,
          action,
          role: roleStr,
          reason,
          previousHash: prevHash,
          hash: computeSimpleHash(`${prevHash}-${action}-${id}-${timestampStr}-${reason}`),
          status,
        };
        return [...prev, newEntry];
      });
      api.audits.create({ action, reason, status }).catch(() => {});
    },
    []
  );

  // ── Elevation / Override ─────────────────────────────────────────────────
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [isCounting, setIsCounting] = useState(false);
  const [attemptedTab, setAttemptedTab] = useState<string | null>(null);
  const [fingerprintScanStatus, setFingerprintScanStatus] = useState<FingerprintStatus>('idle');

  const startOverrideSequence = useCallback((tab: string) => {
    setAttemptedTab(tab);
    setCountdown(5);
    setOverrideReason('');
    setShowOverrideModal(true);
    setFingerprintScanStatus('idle');
    setIsCounting(false);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isCounting) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown((p) => p - 1), 1000);
      } else {
        setIsCounting(false);
        setUserRole('manager');
        setShowOverrideModal(false);
        addAuditLog(
          'EMERGENCY_SOVEREIGN_BYPASS',
          `Bypassed access restriction with reason: "${overrideReason || 'Direct emergency override'}"`,
          'BYPASS',
          'MANAGER'
        );
        if (attemptedTab) setActiveTab(attemptedTab as TabId);
        confetti({ particleCount: 150, spread: 85, colors: ['#c19a6b', '#ffffff', '#ffd700'] });
      }
    }
    return () => clearTimeout(timer);
  }, [countdown, isCounting, addAuditLog, attemptedTab, overrideReason]);

  // ── Arrivals ──────────────────────────────────────────────────────────────
  const [vipGuests] = useState<VipGuest[]>([
    { id: 'GST-101', name: 'Mr. Chen & Family', vip: 'VIP GOLD', status: 'En route animate-pulse', info: 'Limo Pickup in 20m', flight: 'Flight BA245 / LHR-JFK', serviceLevel: 'VIP', totalSpend: 15400, checkInDate: '2026-06-18' },
    { id: 'GST-102', name: 'Ms. Al-Fayed', vip: 'VIP PLATINUM', status: 'Landed', info: 'Arrived at Terminal 4 / Chauffeur en route', flight: 'Flight Emirates EM5 / DXB-JFK', serviceLevel: 'ROYAL', totalSpend: 28500, checkInDate: '2026-06-19' },
    { id: 'GST-103', name: 'Dr. Rossi', vip: 'VIP BRONZE', status: 'In-flight', info: 'Estimated arrival 2h 15m', flight: 'Flight AF112 / CDG-JFK', serviceLevel: 'EXECUTIVE', totalSpend: 7900, checkInDate: '2026-06-20' },
  ]);
  const flights = useMemo(() => [
    { id: 'BA245', status: 'On Time', time: '11:15 AM' },
    { id: 'AF112', status: 'Delayed 15m', time: '12:45 PM' },
    { id: 'EM5', status: 'Landed', time: '09:50 AM' },
  ], []);

  // ── Room Service ──────────────────────────────────────────────────────────
  const [roomOrders, setRoomOrders] = useState<RoomServiceOrder[]>([
    { id: 'order-1', guest: 'Mr. Chen & Family', room: 'Suite 201', details: 'Gourmet French Breakfast platter, freshly pressed organic orange juice', status: 'Quality Check', imgUrl: '' },
    { id: 'order-2', guest: 'Ms. Al-Fayed', room: 'Suite 202', details: 'Chef Selection Premium Sushi platter, Wagyu Beef skewers', status: 'Quality Check', imgUrl: '' },
    { id: 'order-3', guest: 'Dr. Rossi', room: 'Suite 203', details: 'Dry Standard Ribeye Steak, Truffle fries, Barolo Reserve wine', status: 'Quality Check', imgUrl: '' },
    { id: 'order-4', guest: 'Al Gtore', room: 'Villa 1', details: 'Gourmet Buttermilk Pancakes, Canadian maple syrup, hot espresso', status: 'Preparation', imgUrl: '' },
    { id: 'order-5', guest: 'Contarah', room: 'Villa 2', details: 'Traditional Premium Angus Beef burger, gold leaf garnish', status: 'Quality Check', imgUrl: '' },
    { id: 'order-6', guest: 'Fonuhery', room: 'Suite 304', details: 'Fettuccine Vongole with fresh Mediterranean clams, Pinot Grigio', status: 'Quality Check', imgUrl: '' },
  ]);

  useEffect(() => {
    if (activeTab !== 'room-service') return;
    api.roomOrders.list().then((res: any) => {
      if (res.success && res.data?.length > 0) {
        setRoomOrders(res.data.map((o: any) => ({
          id: o.id,
          guest: o.guestName || 'Guest',
          room: o.roomNo || 'Room',
          details: o.details || '',
          status: (o.status as RoomServiceOrder['status']) || 'Preparation',
          imgUrl: '',
        })));
      }
    }).catch(() => {});
  }, [activeTab]);

  const advanceOrderStatus = useCallback((id: string) => {
    setRoomOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;
        const statusMap: Record<RoomServiceOrder['status'], RoomServiceOrder['status']> = {
          Preparation: 'Quality Check',
          'Quality Check': 'Out for Delivery',
          'Out for Delivery': 'Delivered',
          Delivered: 'Preparation',
        };
        return { ...order, status: statusMap[order.status] };
      })
    );
    confetti({ particleCount: 15, spread: 35, colors: ['#c19a6b', '#ffffff'] });
  }, []);

  // ── Controls ──────────────────────────────────────────────────────────────
  const [lightScene, setLightScene] = useState<'ambient' | 'bright' | 'relax' | 'night'>('ambient');
  const [currentTemp, setCurrentTemp] = useState(22);
  const [targetTemp, setTargetTemp] = useState(23);
  const [glassOpacity, setGlassOpacity] = useState(65);
  const [glowingRooms, setGlowingRooms] = useState<Record<string, boolean>>({
    '201': true, '202': false, '203': true, corridor: true, meeting: false,
  });
  const [suiteControlIds, setSuiteControlIds] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeTab !== 'controls') return;
    api.controls.list().then((res: any) => {
      if (res.success && res.data?.length > 0) {
        const first = res.data[0];
        setLightScene((first.lights as any) || 'ambient');
        setCurrentTemp(first.climate || 22);
        setTargetTemp(first.climate || 23);
        setGlassOpacity(first.curtains || 65);
        const ids: Record<string, string> = {};
        res.data.forEach((c: any) => { if (c.room?.number) ids[c.room.number] = c.id; });
        setSuiteControlIds(ids);
      }
    }).catch(() => {});
  }, [activeTab]);

  const toggleRoomGlow = useCallback(
    (room: string) => {
      setGlowingRooms((prev) => {
        const next = { ...prev, [room]: !prev[room] };
        const controlId = suiteControlIds[room];
        if (controlId) api.controls.update(controlId, { doNotDisturb: !prev[room] }).catch(() => {});
        return next;
      });
    },
    [suiteControlIds]
  );

  // ── Channel Sync ──────────────────────────────────────────────────────────
  const [channels, setChannels] = useState([
    { name: 'Booking.com', status: 'Synced', iconColor: 'bg-emerald-500' },
    { name: 'Expedia.com', status: 'Synced', iconColor: 'bg-emerald-500' },
    { name: 'Airbnb Luxury', status: 'Pending', iconColor: 'bg-amber-400 animate-pulse' },
    { name: 'Direct Zafir', status: 'Synced', iconColor: 'bg-emerald-500' },
  ]);
  const [syncLogs, setSyncLogs] = useState([
    '01:59 AM - Booking.com price parity audit completed',
    '01:59 AM - Expedia price update distributed successfully',
    '01:53 AM - Airbnb API availability handshake verified',
    '01:53 AM - Direct portal local server cache sync updated',
  ]);

  useEffect(() => {
    if (activeTab !== 'channel-sync') return;
    api.pricing.list().then((res: any) => {
      if (res.success && res.data?.length > 0) {
        setChannels(res.data.map((r: any) => ({
          name: r.suite || 'Channel',
          status: r.status === 'active' ? 'Synced' : 'Pending',
          iconColor: r.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse',
        })));
        const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        setSyncLogs(res.data.map((r: any) => `${timeStr} - ${r.suite}: base rate €${r.basePrice} — ${r.status?.toUpperCase()}`));
      }
    }).catch(() => {});
  }, [activeTab]);

  // ── Vault ─────────────────────────────────────────────────────────────────
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([
    { id: '1', name: 'Zafir_Acquisition_Contract_2024.pdf', encrypted: true, decrypting: false, progress: 0, securityLevel: 'VIP Elite Class V' },
    { id: '2', name: 'Global_Merger_Sovereign_Agreement_X89.docx', encrypted: true, decrypting: false, progress: 0, securityLevel: 'Presidential Clearance' },
    { id: '3', name: 'Strategic_Sovereign_Financial_Report_Q3.xlsx', encrypted: true, decrypting: false, progress: 0, securityLevel: 'Secretariat Level IV' },
  ]);

  useEffect(() => {
    if (activeTab !== 'vault') return;
    api.vault.list().then((res: any) => {
      if (res.success && res.data?.length > 0) {
        setVaultDocs(res.data.map((d: any) => ({
          id: d.id, name: d.name, encrypted: !d.withdrawnAt, decrypting: false, progress: 0, securityLevel: d.category || 'Classified',
        })));
      }
    }).catch(() => {});
  }, [activeTab]);

  useEffect(() => {
    const active = vaultDocs.find((d) => d.decrypting);
    if (!active) return;
    const interval = setInterval(() => {
      setVaultDocs((prev) =>
        prev.map((doc) => {
          if (!doc.decrypting) return doc;
          const next = doc.progress + 20;
          return next >= 100
            ? { ...doc, progress: 100, encrypted: false, decrypting: false }
            : { ...doc, progress: next };
        })
      );
    }, 400);
    return () => clearInterval(interval);
  }, [vaultDocs]);

  const handleDecrypt = useCallback(
    (id: string) => {
      setVaultDocs((prev) => prev.map((d) => (d.id === id ? { ...d, decrypting: true } : d)));
      api.vault.withdraw(id).then((res: any) => {
        if (res.success) {
          setVaultDocs((prev) => prev.map((d) => (d.id === id ? { ...d, encrypted: false, decrypting: false, progress: 100 } : d)));
          addAuditLog('VAULT_DOCUMENT_WITHDRAW', `Vault document ${id} decrypted.`, 'AUTHORIZED');
        } else {
          setVaultDocs((prev) => prev.map((d) => (d.id === id ? { ...d, decrypting: false } : d)));
        }
      }).catch(() => {});
    },
    [addAuditLog]
  );

  // ── Ledger / Courses ──────────────────────────────────────────────────────
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);

  const totalCredits = useMemo(() => courses.reduce((acc, c) => acc + c.credits, 0), [courses]);
  const totalGPA = useMemo(() => {
    const gradePoints: Record<string, number> = { 'A+': 4.3, A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7, 'C+': 2.3, C: 2.0, F: 0 };
    let val = 0; let creds = 0;
    courses.forEach((c) => { val += (gradePoints[c.grade] || 4.0) * c.credits; creds += c.credits; });
    return creds > 0 ? (val / creds).toFixed(2) : '4.00';
  }, [courses]);

  const addCourse = useCallback((course: Course) => {
    setCourses((prev) => [...prev, course]);
    confetti({ particleCount: 50, spread: 60, colors: ['#c19a6b', '#ffffff', '#0c1b33'] });
  }, []);
  const removeCourse = useCallback((code: string) => {
    setCourses((prev) => prev.filter((c) => c.code !== code));
  }, []);

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  useEffect(() => {
    const params = new URLSearchParams({
      verify: 'true', student: studentName, id: studentId, gpa: totalGPA, credits: totalCredits.toFixed(1), courses: courses.length.toString(), hash: blockchainId,
    });
    QRCode.toDataURL(`${window.location.origin}${window.location.pathname}?${params}`, {
      margin: 1, width: 250, color: { dark: '#c19a6b', light: '#050b16' },
    }).then(setQrCodeUrl).catch(() => {});
  }, [courses, totalGPA, totalCredits, studentName, studentId, blockchainId]);

  // ── PDF Export ────────────────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const exportPDF = useCallback(async () => {
    setIsGenerating(true);
    setGenerationStep('Assembling cryptographic block variables...');
    await new Promise((r) => setTimeout(r, 800));
    setGenerationStep('Aligning authorized seal from Dean Alistair Vance...');
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const doc = new jsPDF();
      doc.setDrawColor(193, 154, 107); doc.setLineWidth(1.0); doc.rect(8, 8, 194, 281);
      doc.setDrawColor(12, 27, 51); doc.setLineWidth(0.2); doc.rect(10, 10, 190, 277);
      doc.setFillColor(12, 27, 51); doc.rect(12, 12, 186, 32, 'F');
      doc.setTextColor(255, 255, 255); doc.setFont('Helvetica', 'bold'); doc.setFontSize(18);
      doc.text('ZAFIR ELITE COMMAND ACADEMY', 105, 24, { align: 'center' });
      doc.setTextColor(193, 154, 107); doc.setFont('Helvetica', 'normal'); doc.setFontSize(10);
      doc.text('Registry Hub & permanent decentralized credentials ledger', 105, 31, { align: 'center' });
      doc.setTextColor(12, 27, 51); doc.setFont('Helvetica', 'bold'); doc.setFontSize(15);
      doc.text('OFFICIAL REGISTERED TRANSCRIPT', 105, 56, { align: 'center' });
      doc.setFillColor(245, 230, 211); doc.rect(15, 66, 180, 36, 'F');
      doc.setTextColor(12, 27, 51); doc.setFontSize(9);
      doc.text('STUDENT LEGAL NAME:', 18, 73); doc.text(studentName.toUpperCase(), 64, 73);
      doc.text('ACADEMIC MAJOR:', 18, 80); doc.text(major, 64, 80);
      doc.text('DATE OF BIRTH:', 18, 87); doc.text(dob, 64, 87);
      doc.text('GPA CUMULATIVE:', 120, 73); doc.text(`${totalGPA} / 4.30`, 160, 73);
      doc.text('BLOCKCHAIN ROOT:', 120, 80); doc.text(blockchainId, 160, 80);
      doc.setFillColor(12, 27, 51); doc.rect(15, 110, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      ['CODE', 'MODULE TITLE', 'CREDITS', 'GRADE'].forEach((t, i) => doc.text(t, [18, 38, 144, 174][i], 115.5));
      let y = 118;
      doc.setTextColor('#1E293B');
      courses.forEach((c) => {
        [c.code, c.name, c.credits.toFixed(1), c.grade].forEach((v, i) => doc.text(v.toString(), [18, 38, 144, 174][i], y + 5.5));
        y += 8;
      });
      const sigY = y + 16;
      doc.setDrawColor(193, 154, 107); doc.circle(45, sigY + 16, 18);
      doc.text('ZAFIR OFFICIAL', 45, sigY + 14, { align: 'center' });
      doc.text('AUTHORIZED', 45, sigY + 19, { align: 'center' });
      doc.line(100, sigY + 16, 180, sigY + 16);
      doc.text('Dr. Alistair Vance, Dean of Academic Registry', 100, sigY + 21);
      doc.save(`Zafir_Official_Ledger_${studentName.replace(' ', '_')}.pdf`);
      confetti({ particleCount: 100, spread: 85, colors: ['#c19a6b', '#ffffff'] });
    } catch (e) { console.error(e); } finally {
      setIsGenerating(false); setGenerationStep('');
    }
  }, [studentName, major, dob, totalGPA, blockchainId, courses]);

  // ─────────────────────────────────────────────────────────────────────────
  const value = useMemo<AppContextValue>(
    () => ({
      activeTab, setActiveTab, language, setLanguage, userRole, setUserRole,
      styleMode, setStyleMode, themeMode, setThemeMode, colorScheme, setColorScheme,
      sidebarCollapsed, setSidebarCollapsed, showSettings, setShowSettings, getDynamicStyles,
      studentName, setStudentName, studentId, dob, major, blockchainId,
      auditLogs, addAuditLog,
      showOverrideModal, setShowOverrideModal, overrideReason, setOverrideReason,
      countdown, isCounting, setIsCounting, attemptedTab, startOverrideSequence,
      fingerprintScanStatus, setFingerprintScanStatus,
      vipGuests, flights,
      roomOrders, advanceOrderStatus,
      lightScene, setLightScene, currentTemp, setCurrentTemp, targetTemp, setTargetTemp,
      glassOpacity, setGlassOpacity, glowingRooms, toggleRoomGlow,
      channels, syncLogs,
      vaultDocs, handleDecrypt,
      courses, totalGPA, totalCredits, addCourse, removeCourse, qrCodeUrl,
      isGenerating, generationStep, exportPDF,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      activeTab, language, userRole, styleMode, themeMode, colorScheme, sidebarCollapsed,
      showSettings, studentName, auditLogs, showOverrideModal, overrideReason, countdown,
      isCounting, attemptedTab, fingerprintScanStatus, vipGuests, roomOrders, lightScene,
      currentTemp, targetTemp, glassOpacity, glowingRooms, channels, syncLogs, vaultDocs,
      courses, totalGPA, totalCredits, qrCodeUrl, isGenerating, generationStep,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
