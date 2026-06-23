import React, { useState } from 'react';
import { 
  User, 
  Database, 
  Plus, 
  Search, 
  TrendingUp, 
  Save, 
  BarChart2, 
  Settings2,
  Users,
  Percent,
  Trash2,
  ShieldCheck,
  Award,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Button,
  Card,
  CardTitle,
  CardDescription,
  Input,
  Select,
  Badge,
  toast
} from './ui';

interface ProfileTabProps {
  language: 'EN' | 'FR' | 'RU';
  addAuditLog: (
    action: string, 
    reason: string, 
    status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT', 
    roleStr?: string
  ) => void;
  onUserChange?: (name: string, role: 'operator' | 'manager') => void;
}

// Interfaces for our interactive Database Tables
interface GuestRecord {
  id: string;
  name: string;
  suite: string;
  serviceLevel: 'ROYAL' | 'VIP' | 'EXECUTIVE' | 'STANDARD';
  totalSpend: number;
  status: 'Checked-In' | 'Arriving' | 'Checked-Out';
  checkInDate: string;
}

interface PriceContract {
  id: string;
  suiteType: string;
  baseRate: number;
  seasonalMultiplier: number;
  caviarInclusion: 'YES' | 'NO';
  butlerAssign: 'YES' | 'NO';
  lastModified: string;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  language,
  addAuditLog,
  onUserChange
}) => {
  // L10n translations
  const t = {
    EN: {
      title: "Sovereign Profile & Database Ledger",
      subtitle: "Configure administration profiles, coordinate multi-admin roles, and execute visual database inputs & analytics.",
      profileConfig: "Agent Profile & Credentials",
      roleClearance: "Current Authority Clearance",
      activePrivilege: "Active Security Privilege",
      multiAdmin: "Multi-Admin & User Directory",
      addUserBtn: "Enroll Admin Node",
      dbConsole: "Imperial Database Ledger",
      tableSelector: "Active Table Node",
      searchPlaceholder: "Query database records...",
      insertTitle: "Insert New Table Record",
      analyticsTitle: "Sovereign Resource Analytics",
      deleteBtn: "Delete Row",
      successInsert: "Record Committed Successfully",
      successDelete: "Record Revoked Successfully",
      colId: "ID REF",
      colName: "Name",
      colSuite: "Suite",
      colStatus: "Status",
      colSpend: "Aggregated Spend",
      colAction: "Action Console",
      btnSave: "Commit to Ledger",
      totalAssetsVal: "Total Database Value",
      avgSpendVal: "Average Guest Value",
      occupancyVal: "Est. Room Occupancy",
      activeUser: "Active Operator Node",
      lvl5: "Level 5 Proprietor",
      lvl4: "Level 4 Manager Office"
    },
    FR: {
      title: "Profil Souverain & Registre Base de Données",
      subtitle: "Configurez les profils d'administration, gérez le multi-admin et contrôlez le registre des bases de données de l'hôtel.",
      profileConfig: "Profil d'Agent & Accréditation",
      roleClearance: "Seuil d'Habilitation Actuel",
      activePrivilege: "Privilège de Sécurité Actif",
      multiAdmin: "Gestion Multi-Admin & Annuaire",
      addUserBtn: "Enrôler un Administrateur",
      dbConsole: "Registre de Base de Données Impérial",
      tableSelector: "Table Active",
      searchPlaceholder: "Filtrer les enregistrements...",
      insertTitle: "Saisir de Nouvelles Données",
      analyticsTitle: "Analyse des Ressources & Revenus",
      deleteBtn: "Supprimer",
      successInsert: "Enregistrement ajouté avec succès",
      successDelete: "Donnée révoquée du registre",
      colId: "RÉF ID",
      colName: "Nom Complet",
      colSuite: "Suite",
      colStatus: "Statut",
      colSpend: "Dépenses Cumulées",
      colAction: "Console d'Action",
      btnSave: "Valider dans la Base",
      totalAssetsVal: "Valeur Totale Base",
      avgSpendVal: "Panier Moyen Client",
      occupancyVal: "Taux d'Occupation Suites",
      activeUser: "Noeud Utilisateur Actif",
      lvl5: "Propriétaire Niveau 5",
      lvl4: "Bureau d'Administration L4"
    },
    RU: {
      title: "Профиль Администратора и База Данных",
      subtitle: "Настройка профилей, управление правами мульти-администраторов, регистрация данных в таблицах и аналитика.",
      profileConfig: "Профиль оператора и полномочия",
      roleClearance: "Текущий уровень допуска",
      activePrivilege: "Активная системная привилегия",
      multiAdmin: "Мульти-админ и списки учетных записей",
      addUserBtn: "Создать Администратора",
      dbConsole: "Командный пульт базы данных",
      tableSelector: "Активная Таблица",
      searchPlaceholder: "Поиск записей в базе...",
      insertTitle: "Произвести запись данных",
      analyticsTitle: "Анализ ресурсов и показателей",
      deleteBtn: "Удалить",
      successInsert: "Запись успешно зафиксирована в базе",
      successDelete: "Запись удалена из основного реестра",
      colId: "ID ТЕГ",
      colName: "ФИО",
      colSuite: "Апартаменты",
      colStatus: "Статус",
      colSpend: "Сумма расходов",
      colAction: "Консоль Действий",
      btnSave: "Записать в реестр",
      totalAssetsVal: "Общая стоимость активов",
      avgSpendVal: "Средний чек гостя",
      occupancyVal: "Показатель Занятости",
      activeUser: "Активный профиль оператора",
      lvl5: "Владелец (Уровень 5)",
      lvl4: "Кабинет Управления L4"
    }
  }[language];

  // 1) Current active profile state (The user can switch this instantly to multi-admin mode)
  const [currentUser, setCurrentUser] = useState({
    name: 'Elena Petrova',
    role: 'Aesthetic Engineer',
    clearance: 'L5',
    department: 'Command Desk',
    avatar: 'EP',
    jwtToken: 'ZFR-9941A-SHA256-CERTIFIED',
    preferenceNotify: true,
    aestheticBrightness: 95
  });

  // Multi-Admin User Database State
  const [adminUsers, setAdminUsers] = useState([
    { name: 'Elena Petrova', role: 'manager', title: 'Aesthetic Engineer', clearance: 'L5', avatar: 'EP', dept: 'Main Deck' },
    { name: 'Marc Laurent', role: 'manager', title: 'Grand Manager', clearance: 'L5', avatar: 'ML', dept: 'Front Office' },
    { name: 'Vladimir Sokolov', role: 'operator', title: 'Security VIP Director', clearance: 'L4', avatar: 'VS', dept: 'Main Gate' },
    { name: 'Marie Dubois', role: 'operator', title: 'Elite Butler Concierge', clearance: 'L4', avatar: 'MD', dept: 'Suites Concierge' }
  ]);

  // Modal / Inputs state for adding novel administrator
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminTitle, setNewAdminTitle] = useState('Assistant Manager');
  const [newAdminRole, setNewAdminRole] = useState<'manager' | 'operator'>('operator');
  const [newAdminDept, setNewAdminDept] = useState('Front Desk');

  // DATABASE STATE (Simulating real tabular tables with full input/edit/delete capability client-side + analysis)
  const [activeTable, setActiveTable] = useState<'guests' | 'contracts'>('guests');
  const [dbSearch, setDbSearch] = useState('');

  // Table Data State
  const [guestsTable, setGuestsTable] = useState<GuestRecord[]>([
    { id: 'GST-103', name: 'Archduke Ferdinand von Hapsburg', suite: 'Suite 501 (Royal)', serviceLevel: 'ROYAL', totalSpend: 24500, status: 'Checked-In', checkInDate: '2026-06-18' },
    { id: 'GST-208', name: 'Lady Charlotte Montague', suite: 'Suite 404 (Imperial)', serviceLevel: 'VIP', totalSpend: 18200, status: 'Checked-In', checkInDate: '2026-06-19' },
    { id: 'GST-345', name: 'Dr. Evelyn Sterling', suite: 'Suite 302 (Executive)', serviceLevel: 'EXECUTIVE', totalSpend: 8900, status: 'Checked-In', checkInDate: '2026-06-15' },
    { id: 'GST-911', name: 'Sovereign Trust Envoy', suite: 'Suite 505 (Penthouse)', serviceLevel: 'ROYAL', totalSpend: 42000, status: 'Arriving', checkInDate: '2026-06-21' },
    { id: 'GST-542', name: 'Aleksey Volkov', suite: 'Suite 201 (Discreet)', serviceLevel: 'VIP', totalSpend: 15400, status: 'Checked-In', checkInDate: '2026-06-16' },
    { id: 'GST-702', name: 'Sir Julian Mercer', suite: 'Suite 101 (Standard)', serviceLevel: 'STANDARD', totalSpend: 4500, status: 'Checked-Out', checkInDate: '2026-06-10' }
  ]);

  const [contractsTable, setContractsTable] = useState<PriceContract[]>([
    { id: 'CTR-881', suiteType: 'Royal Suite Deluxe', baseRate: 4500, seasonalMultiplier: 1.25, caviarInclusion: 'YES', butlerAssign: 'YES', lastModified: '2026-06-18' },
    { id: 'CTR-704', suiteType: 'Imperial Embassy Suite', baseRate: 3200, seasonalMultiplier: 1.15, caviarInclusion: 'YES', butlerAssign: 'YES', lastModified: '2026-06-19' },
    { id: 'CTR-521', suiteType: 'Sovereign Executive Suite', baseRate: 1800, seasonalMultiplier: 1.10, caviarInclusion: 'NO', butlerAssign: 'YES', lastModified: '2026-06-15' },
    { id: 'CTR-301', suiteType: 'Aesthetic Light Penthouse', baseRate: 2500, seasonalMultiplier: 1.20, caviarInclusion: 'YES', butlerAssign: 'NO', lastModified: '2026-06-20' },
    { id: 'CTR-110', suiteType: 'Standard Botanical Suite', baseRate: 950, seasonalMultiplier: 1.00, caviarInclusion: 'NO', butlerAssign: 'NO', lastModified: '2026-06-10' }
  ]);

  // Insert Record states - Guest Saisir
  const [insGuestName, setInsGuestName] = useState('');
  const [insGuestSuite, setInsGuestSuite] = useState('');
  const [insGuestLevel, setInsGuestLevel] = useState<GuestRecord['serviceLevel']>('VIP');
  const [insGuestSpend, setInsGuestSpend] = useState(5000);
  const [insGuestStatus, setInsGuestStatus] = useState<GuestRecord['status']>('Checked-In');

  // Insert Record states - Contract Saisir
  const [insCtrType, setInsCtrType] = useState('');
  const [insCtrRate, setInsCtrRate] = useState(1200);
  const [insCtrMult, setInsCtrMult] = useState(1.10);
  const [insCtrCaviar, setInsCtrCaviar] = useState<'YES' | 'NO'>('NO');
  const [insCtrButler, setInsCtrButler] = useState<'YES' | 'NO'>('YES');

  // Multi-Admin switcher handler
  const handleSwitchAdmin = (admin: typeof adminUsers[0]) => {
    setCurrentUser({
      name: admin.name,
      role: admin.role === 'manager' ? 'Aesthetic Engineer' : 'Concierge Guard',
      clearance: admin.clearance,
      department: admin.dept,
      avatar: admin.avatar,
      jwtToken: `ZFR-${Math.floor(1000 + Math.random() * 9000)}B-SHA256`,
      preferenceNotify: currentUser.preferenceNotify,
      aestheticBrightness: currentUser.aestheticBrightness
    });
    
    // Propagate up to App component
    if (onUserChange) {
      onUserChange(admin.name, admin.role as 'operator' | 'manager');
    }

    addAuditLog(
      'CREDENTIALS_ACCESS_ROUTED',
      `Switched live administrative node to user: ${admin.name} (${admin.clearance})`,
      'AUTHORIZED',
      admin.role.toUpperCase()
    );

    // Blast celebratory sparkle
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#c19a6b', '#fcfaf2', '#7c5a30']
    });

    toast.success(
      language === 'FR' ? `Utilisateur actif : ${admin.name}` : 
      language === 'RU' ? `Активный профиль : ${admin.name}` : `Active Operator Node: ${admin.name}`,
      language === 'FR' ? `Privilèges ${admin.clearance} octroyés.` : `Clearance level ${admin.clearance} applied.`
    );
  };

  // Add new Admin/Staff User
  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim()) return;

    const initials = newAdminName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const newAdmin = {
      name: newAdminName,
      role: newAdminRole,
      title: newAdminTitle,
      clearance: newAdminRole === 'manager' ? 'L5' as const : 'L4' as const,
      avatar: initials || 'UA',
      dept: newAdminDept
    };

    setAdminUsers([...adminUsers, newAdmin]);
    setShowAddAdmin(false);
    setNewAdminName('');
    setNewAdminTitle('Assistant Manager');

    addAuditLog(
      'ADMIN_PRIVILEGE_ENROLLED',
      `Registered a new multi-admin identity node: ${newAdminName} (${newAdmin.clearance})`,
      'AUTHORIZED'
    );

    confetti({
      particleCount: 50,
      spread: 40,
      colors: ['#c19a6b', '#10b981']
    });

    toast.success(
      language === 'FR' ? 'Administrateur enrôlé' : 'Administrator enrolled successfully',
      `${newAdminName} - Access level ${newAdmin.clearance}`
    );
  };

  // Database Inserting (Saisir) Actions
  const handleInsertGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!insGuestName.trim() || !insGuestSuite.trim()) return;

    const randomID = `GST-${Math.floor(100 + Math.random() * 900)}`;
    const newGuest: GuestRecord = {
      id: randomID,
      name: insGuestName,
      suite: insGuestSuite,
      serviceLevel: insGuestLevel,
      totalSpend: Number(insGuestSpend),
      status: insGuestStatus,
      checkInDate: new Date().toISOString().split('T')[0]
    };

    setGuestsTable([newGuest, ...guestsTable]);
    setInsGuestName('');
    setInsGuestSuite('');

    addAuditLog(
      'DATABASE_INSERT_COMMIT',
      `Inserted fresh guest dossier: ${insGuestName} assigning table row ${randomID}`,
      'AUTHORIZED'
    );

    toast.success(t.successInsert, `${randomID} - ${insGuestName}`);
  };

  const handleInsertContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!insCtrType.trim()) return;

    const randomID = `CTR-${Math.floor(100 + Math.random() * 900)}`;
    const newCtr: PriceContract = {
      id: randomID,
      suiteType: insCtrType,
      baseRate: Number(insCtrRate),
      seasonalMultiplier: Number(insCtrMult),
      caviarInclusion: insCtrCaviar,
      butlerAssign: insCtrButler,
      lastModified: new Date().toISOString().split('T')[0]
    };

    setContractsTable([newCtr, ...contractsTable]);
    setInsCtrType('');

    addAuditLog(
      'DATABASE_INSERT_COMMIT',
      `Registered suite tariff scheme code ${randomID} base scale unit $${insCtrRate}`,
      'AUTHORIZED'
    );

    toast.success(t.successInsert, `${randomID} - ${insCtrType}`);
  };

  // Database Row Deletion (Suppression)
  const handleDeleteRow = (id: string, nameField: string) => {
    if (activeTable === 'guests') {
      setGuestsTable(prev => prev.filter(row => row.id !== id));
    } else {
      setContractsTable(prev => prev.filter(row => row.id !== id));
    }

    addAuditLog(
      'DATABASE_RECORD_REVOKED',
      `Purged row reference entity ${id} (${nameField}) from core ledger systems`,
      'AUTHORIZED'
    );

    toast.error(t.successDelete, `${id} revoked from ledger.`);
  };

  // ANALYTICS COMPUTATIONS (Sovereign KPIs)
  const totalSpendAggregated = guestsTable.reduce((acc, curr) => acc + curr.totalSpend, 0);
  const avgSpendPerGuest = Math.round(totalSpendAggregated / (guestsTable.length || 1));
  const estimatedOccupancy = Math.min(100, Math.round((guestsTable.filter(g => g.status === 'Checked-In').length / 10) * 100));

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/85 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-serif-luxury text-slate-100 tracking-tight flex items-center gap-3">
            <User className="text-zaphir-400 w-8 h-8" />
            {t.title}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mt-1">
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <Badge variant="cyber" outline pulse>
            SYNC: ON
          </Badge>
          <span className="px-3.5 py-1.5 bg-obsidian-900 border border-slate-700/60 text-slate-300 rounded-xl shadow-md font-bold text-[10px]">
            JWT TOKEN: {currentUser.jwtToken}
          </span>
        </div>
      </div>

      {/* ADMIN LEVEL STATS / PREFERENCES KEYS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* KPI: Total Managed Spend */}
        <Card variant="gold" glow padding="md" className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zaphir-300 uppercase font-mono font-bold tracking-widest">{t.totalAssetsVal}</span>
            <TrendingUp className="w-4 h-4 text-zaphir-400" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-50 tracking-tight">${totalSpendAggregated.toLocaleString()}</p>
            <p className="text-[10px] text-zaphir-400/70 font-mono mt-1">Captured real-time</p>
          </div>
        </Card>

        {/* KPI: Average Spend Value */}
        <Card variant="default" padding="md" className="bg-obsidian-900/80 border-slate-700/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-widest">{t.avgSpendVal}</span>
            <BarChart2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-100 tracking-tight">${avgSpendPerGuest.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Weighted metric calculation</p>
          </div>
        </Card>

        {/* KPI: Suite Occupancy Rate */}
        <Card variant="default" padding="md" className="bg-obsidian-900/80 border-slate-700/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-widest">{t.occupancyVal}</span>
            <Percent className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-3xl font-bold text-slate-100 tracking-tight">{estimatedOccupancy}%</p>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${estimatedOccupancy}%` }} />
            </div>
          </div>
        </Card>

        {/* KPI: Clearance level */}
        <Card variant="cyber" padding="md" className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cyan-300 uppercase font-mono font-bold tracking-widest">{t.roleClearance}</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-4">
            <p className="text-xl font-bold tracking-wide text-cyan-100">{currentUser.clearance} ACCESS PROTOCOL</p>
            <p className="text-[10px] text-cyan-400/80 font-mono mt-1">{currentUser.department} STATION</p>
          </div>
        </Card>

      </div>

      {/* TWO PANEL CORE: PROFILE & MULTI_ADMIN | INTERACTIVE DATABASE LEDGER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: PROFILE SETTING CARD & MULTI ADMIN SWAP (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* PROFILE CONTROL CARD */}
          <Card variant="default" padding="lg" className="border-slate-700/50 bg-obsidian-900/40 relative overflow-hidden space-y-6">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-zaphir-500 via-cyber-cyan to-cyber-magenta" />
            
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <Settings2 className="w-4 h-4 text-zaphir-400" />
              <CardTitle as="h4" className="text-xs font-mono uppercase tracking-widest text-slate-200">
                {t.profileConfig}
              </CardTitle>
            </div>

            <div className="flex flex-col items-center text-center py-5 bg-obsidian-950/70 rounded-xl border border-slate-800/80 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-zaphir-500 to-amber-700 text-obsidian-950 flex items-center justify-center font-serif-luxury text-2xl font-bold tracking-widest shadow-lg border-2 border-zaphir-400/30">
                {currentUser.avatar}
              </div>
              <h4 className="font-serif-luxury font-bold text-slate-100 text-xl mt-3">{currentUser.name}</h4>
              <p className="text-[10px] text-zaphir-400 font-mono font-semibold uppercase tracking-wider">{currentUser.role}</p>
            </div>

            {/* Editable Profile Inputs */}
            <div className="space-y-4">
              <Input
                label={language === 'FR' ? "Nom d'affichage" : "Custom Display Handle"}
                type="text"
                value={currentUser.name}
                onChange={(e) => {
                  const nextVal = e.target.value;
                  setCurrentUser(prev => ({ ...prev, name: nextVal }));
                  if (onUserChange) onUserChange(nextVal, currentUser.clearance === 'L5' ? 'manager' : 'operator');
                }}
                leftIcon={<User className="w-4 h-4 text-zaphir-400" />}
              />

              <Input
                label={language === 'FR' ? "Station de Département" : "Department Station"}
                type="text"
                value={currentUser.department}
                onChange={(e) => setCurrentUser(prev => ({ ...prev, department: e.target.value }))}
                leftIcon={<Award className="w-4 h-4 text-zaphir-400" />}
              />

              {/* Toggle Preference notifications */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-950 border border-slate-800 text-xs font-mono">
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">ENCRYPT COMMUNICATION FLOW</span>
                <input 
                  type="checkbox" 
                  checked={currentUser.preferenceNotify} 
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setCurrentUser(prev => ({ ...prev, preferenceNotify: checked }));
                    addAuditLog(
                      'PREF_SECURITY_MUTATED',
                      `Set cryptographic flow tunnel encryption to ${checked ? 'ON' : 'OFF'} on agent console`,
                      'AUTHORIZED'
                    );
                    toast.info(
                      language === 'FR' ? "Flux sécurisé modifié" : "Secure channel modified",
                      `SSL tunnel encryption is now ${checked ? 'active' : 'disabled'}.`
                    );
                  }}
                  className="w-4 h-4 text-zaphir-400 rounded-md border-slate-700 bg-obsidian-900 focus:ring-zaphir-500 cursor-pointer"
                />
              </div>

              <Button 
                variant="primary"
                fullWidth
                leftIcon={<Save className="w-4 h-4" />}
                onClick={() => {
                  addAuditLog(
                    'AGENT_PROFILE_COMMITTED',
                    `Committed fully customized preference settings & biometric hashes to local registry.`,
                    'AUTHORIZED'
                  );
                  confetti({ particleCount: 30, spread: 20 });
                  toast.success(
                    language === 'FR' ? "Préférences sauvegardées" : "Preferences Saved",
                    language === 'FR' ? "Données encryptées réappliquées" : "Identity parameters applied to secure kernel"
                  );
                }}
              >
                {t.btnSave}
              </Button>
            </div>
          </Card>

          {/* MULTI_ADMIN USER DIRECTORY */}
          <Card variant="default" padding="lg" className="border-slate-700/50 bg-obsidian-900/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-zaphir-400" />
                <CardTitle as="h4" className="text-xs font-mono uppercase tracking-widest text-slate-200">
                  {t.multiAdmin}
                </CardTitle>
              </div>
              <Button
                variant={showAddAdmin ? "secondary" : "ghost"}
                size="xs"
                className="p-1 px-2.5 rounded-full"
                onClick={() => setShowAddAdmin(!showAddAdmin)}
              >
                {showAddAdmin ? (language === 'FR' ? "Fermer" : "Close") : (language === 'FR' ? "Enrôler" : "Enroll")}
              </Button>
            </div>

            {/* Quick switcher list */}
            <div className="space-y-2">
              {adminUsers.map((user, idx) => {
                const isActive = currentUser.name === user.name;
                return (
                  <div 
                    key={idx}
                    onClick={() => handleSwitchAdmin(user)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-zaphir-500/10 border-zaphir-500/40 shadow-md ring-1 ring-zaphir-500/10' 
                        : 'bg-obsidian-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-obsidian-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-obsidian-800 to-obsidian-950 border border-slate-700 text-zaphir-400 flex items-center justify-center font-bold font-serif-luxury text-sm">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-100 leading-tight">{user.name}</p>
                        <p className="text-[9px] text-zaphir-400/80 font-mono tracking-wider uppercase mt-0.5">{user.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.clearance === 'L5' ? 'gold' : 'neutral'} size="sm">
                        {user.clearance}
                      </Badge>
                      {isActive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Saisir form to add administrative operator */}
            {showAddAdmin && (
              <form onSubmit={handleAddAdminSubmit} className="pt-4 border-t border-slate-800 space-y-4 animate-fade-in text-xs font-mono">
                <p className="text-[10px] text-zaphir-300 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-zaphir-400" />
                  Enroll Administration Node
                </p>
                
                <Input
                  label={language === 'FR' ? "Nom complet" : "Full Name"}
                  type="text"
                  placeholder="e.g. Lord Sterling"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  required
                />

                <Input
                  label={language === 'FR' ? "Titre administratif" : "Administrative Title"}
                  type="text"
                  placeholder="e.g. Sovereign Auditor"
                  value={newAdminTitle}
                  onChange={(e) => setNewAdminTitle(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label={language === 'FR' ? "Sécurité" : "Clearance"}
                    options={[
                      { value: 'manager', label: 'L5 Manager' },
                      { value: 'operator', label: 'L4 Operator' },
                    ]}
                    value={newAdminRole}
                    onChange={(e: any) => setNewAdminRole(e.target.value)}
                  />

                  <Input
                    label={language === 'FR' ? "Département" : "Station Dept"}
                    type="text"
                    value={newAdminDept}
                    onChange={(e) => setNewAdminDept(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  variant="outline"
                  fullWidth
                  className="font-mono text-xs uppercase tracking-widest py-2"
                >
                  {t.addUserBtn}
                </Button>
              </form>
            )}

          </Card>

        </div>

        {/* RIGHT PANEL: INTERACTIVE DATABASE & SAISIR (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          <Card variant="default" padding="lg" className="border-slate-700/50 bg-obsidian-900/40 space-y-6">
            
            {/* Tab selector for our database tables */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-zaphir-400" />
                <div>
                  <CardTitle className="text-base text-slate-100">{t.dbConsole}</CardTitle>
                  <CardDescription>Secure relational database directory schema</CardDescription>
                </div>
              </div>

              {/* Database selectors */}
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTable === 'guests' ? "outline" : "ghost"}
                  size="sm"
                  leftIcon={<Users className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setActiveTable('guests');
                    setDbSearch('');
                  }}
                  className="font-mono text-xs"
                >
                  guests_directory
                </Button>

                <Button
                  variant={activeTable === 'contracts' ? "outline" : "ghost"}
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setActiveTable('contracts');
                    setDbSearch('');
                  }}
                  className="font-mono text-xs"
                >
                  pricing_contracts
                </Button>
              </div>
            </div>

            {/* Search query box */}
            <div className="max-w-md">
              <Input
                placeholder={t.searchPlaceholder}
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-500" />}
              />
            </div>

            {/* Table layout displaying active database contents */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-obsidian-950/60 shadow-inner">
              
              {activeTable === 'guests' ? (
                // GUESTS DATABASE TABLE
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-obsidian-900 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">{t.colId}</th>
                      <th className="py-3 px-4">{t.colName}</th>
                      <th className="py-3 px-4">{t.colSuite}</th>
                      <th className="py-3 px-4">Service Clears</th>
                      <th className="py-3 px-4">{t.colSpend}</th>
                      <th className="py-3 px-4">{t.colStatus}</th>
                      <th className="py-3 px-4 text-right">{t.colAction}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 font-mono text-xs text-slate-300">
                    {guestsTable
                      .filter(row => 
                        row.name.toLowerCase().includes(dbSearch.toLowerCase()) ||
                        row.suite.toLowerCase().includes(dbSearch.toLowerCase()) ||
                        row.id.toLowerCase().includes(dbSearch.toLowerCase())
                      )
                      .map((row) => (
                        <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-400">{row.id}</td>
                          <td className="py-3 px-4 text-slate-100 font-sans font-bold">{row.name}</td>
                          <td className="py-3 px-4 text-zaphir-300 text-xs">{row.suite}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={
                                row.serviceLevel === 'ROYAL' ? 'gold' : 
                                row.serviceLevel === 'VIP' ? 'cyber' : 
                                row.serviceLevel === 'EXECUTIVE' ? 'purple' : 'neutral'
                              }
                            >
                              {row.serviceLevel}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-100">${row.totalSpend.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={
                                row.status === 'Checked-In' ? 'success' :
                                row.status === 'Arriving' ? 'info' : 'neutral'
                              }
                              pulse={row.status === 'Checked-In'}
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td className="py-2 px-4 text-right">
                            <Button 
                              variant="danger" 
                              size="xs"
                              leftIcon={<Trash2 className="w-3 h-3" />}
                              onClick={() => handleDeleteRow(row.id, row.name)}
                            >
                              {language === 'FR' ? "Révoquer" : "Revoke"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    {guestsTable.filter(row => 
                      row.name.toLowerCase().includes(dbSearch.toLowerCase()) ||
                      row.suite.toLowerCase().includes(dbSearch.toLowerCase()) ||
                      row.id.toLowerCase().includes(dbSearch.toLowerCase())
                    ).length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                          {language === 'FR' ? "Aucun passager trouvé" : "No matching guests contained inside ledger."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                // PRICING CONTRACTS DATABASE TABLE
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-obsidian-900 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">{t.colId}</th>
                      <th className="py-3 px-4">Suite Category</th>
                      <th className="py-3 px-4">Base Tariff Rate</th>
                      <th className="py-3 px-4">Seasonal Mult.</th>
                      <th className="py-3 px-4">Caviar Booking</th>
                      <th className="py-3 px-4">Assigned Butler</th>
                      <th className="py-3 px-4 text-right">{t.colAction}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 font-mono text-xs text-slate-300">
                    {contractsTable
                      .filter(row => 
                        row.suiteType.toLowerCase().includes(dbSearch.toLowerCase()) || 
                        row.id.toLowerCase().includes(dbSearch.toLowerCase())
                      )
                      .map((row) => (
                        <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-400">{row.id}</td>
                          <td className="py-3 px-4 text-slate-100 font-sans font-bold">{row.suiteType}</td>
                          <td className="py-3 px-4 text-zaphir-300 font-bold">${row.baseRate} / night</td>
                          <td className="py-3 px-4">x{row.seasonalMultiplier}</td>
                          <td className="py-3 px-4">
                            <Badge variant={row.caviarInclusion === 'YES' ? 'gold' : 'neutral'}>
                              {row.caviarInclusion}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-300">
                            {row.butlerAssign}
                          </td>
                          <td className="py-2 px-4 text-right">
                            <Button 
                              variant="danger" 
                              size="xs"
                              leftIcon={<Trash2 className="w-3 h-3" />}
                              onClick={() => handleDeleteRow(row.id, row.suiteType)}
                            >
                              {language === 'FR' ? "Purger" : "Purge"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    {contractsTable.filter(row => 
                      row.suiteType.toLowerCase().includes(dbSearch.toLowerCase()) || 
                      row.id.toLowerCase().includes(dbSearch.toLowerCase())
                    ).length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                          {language === 'FR' ? "Aucun tarif trouvé" : "No pricing schemes matching active query schema."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

            </div>

            {/* INSERT PANEL (SAISIR DONNÉES) FOR FRESH DATABASE COMMITS */}
            <div className="bg-obsidian-950/65 border border-slate-800 p-5 rounded-xl space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zaphir-400 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-zaphir-400" />
                {t.insertTitle}
              </h4>

              {activeTable === 'guests' ? (
                // GUEST INPUT (SAISIR GUEST)
                <form onSubmit={handleInsertGuest} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                    <Input
                      label={language === 'FR' ? "Nom du client" : "Guest Name"}
                      type="text"
                      placeholder="e.g. Duke Ellington"
                      value={insGuestName}
                      onChange={(e) => setInsGuestName(e.target.value)}
                      required
                    />

                    <Input
                      label={language === 'FR' ? "Code Suite" : "Target Suite"}
                      type="text"
                      placeholder="e.g. Suite 509"
                      value={insGuestSuite}
                      onChange={(e) => setInsGuestSuite(e.target.value)}
                      required
                    />

                    <Select
                      label={language === 'FR' ? "Catégorie" : "Service Clears"}
                      options={[
                        { value: 'ROYAL', label: 'ROYAL ACCORD' },
                        { value: 'VIP', label: 'VIP CONCIERGE' },
                        { value: 'EXECUTIVE', label: 'EXECUTIVE PLATINUM' },
                        { value: 'STANDARD', label: 'STANDARD DISCREET' },
                      ]}
                      value={insGuestLevel}
                      onChange={(e: any) => setInsGuestLevel(e.target.value)}
                    />

                    <Input
                      label={language === 'FR' ? "Pré-Acompte ($)" : "Prepaid Spend ($)"}
                      type="number"
                      value={insGuestSpend}
                      onChange={(e) => setInsGuestSpend(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="w-full md:max-w-xs">
                      <Select
                        label="Status"
                        options={[
                          { value: 'Checked-In', label: 'Checked-In' },
                          { value: 'Arriving', label: 'Arriving' },
                          { value: 'Checked-Out', label: 'Checked-Out' },
                        ]}
                        value={insGuestStatus}
                        onChange={(e: any) => setInsGuestStatus(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="font-mono text-xs uppercase tracking-widest px-8"
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Commit Row
                    </Button>
                  </div>
                </form>
              ) : (
                // CONTRACTS INPUT (SAISIR CONFIG CONTRACTS)
                <form onSubmit={handleInsertContract} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                    <Input
                      label={language === 'FR' ? "Désignation de la Suite" : "Suite Type Title"}
                      type="text"
                      placeholder="e.g. Amber Sand Sanctuary"
                      value={insCtrType}
                      onChange={(e) => setInsCtrType(e.target.value)}
                      required
                    />

                    <Input
                      label={language === 'FR' ? "Tarif Standard ($)" : "Base Rate ($)"}
                      type="number"
                      value={insCtrRate}
                      onChange={(e) => setInsCtrRate(Number(e.target.value))}
                      required
                    />

                    <Input
                      label={language === 'FR' ? "Facteur Saisonnier" : "Seasonal Factor"}
                      type="number"
                      step="0.05"
                      value={insCtrMult}
                      onChange={(e) => setInsCtrMult(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:items-end">
                    <Select
                      label="Beluga Caviar Reserv."
                      options={[
                        { value: 'YES', label: 'YES' },
                        { value: 'NO', label: 'NO' },
                      ]}
                      value={insCtrCaviar}
                      onChange={(e: any) => setInsCtrCaviar(e.target.value)}
                    />

                    <Select
                      label="Level 5 personal butler"
                      options={[
                        { value: 'YES', label: 'YES' },
                        { value: 'NO', label: 'NO' },
                      ]}
                      value={insCtrButler}
                      onChange={(e: any) => setInsCtrButler(e.target.value)}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      className="font-mono text-xs uppercase tracking-widest"
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Setup Contract
                    </Button>
                  </div>
                </form>
              )}

            </div>

          </Card>

        </div>

      </div>

    </div>
  );
};
