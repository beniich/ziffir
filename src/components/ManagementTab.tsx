import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Search, 
  Trash2, 
  Fingerprint,
  RefreshCw,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuditEntry } from '../App';

interface Personnel {
  id: string;
  name: string;
  role: 'Operator' | 'Manager' | 'VIP Butler' | 'Security VIP' | 'Aesthetic Engineer';
  clearance: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  status: 'Active' | 'On Break' | 'Suspended';
  department: string;
  avatar: string;
}

// Removed props interface as we now read from stores

const tabTranslations = {
  EN: {
    title: "Operations Oversight & Staff Control Deck",
    subtitle: "System command nodes, staff list, user management, permissions matrix, and holographic simulators.",
    staffDirectory: "Staff Directory & User Management",
    staffDirectoryDesc: "Enroll, delete, or re-clear operator nodes and active hotel personnel.",
    permissionsMatrix: "Permissions & Authorization Matrix",
    permissionsMatrixDesc: "Clearance bounds showing who is authorized to do what and how.",
    liveSimulator: "Operations Simulation Engine",
    liveSimulatorDesc: "Broadcast interactive mock actions into the live system audit logs.",
    addStaff: "Register Staff / Operator Node",
    nameLabel: "Full Name",
    roleLabel: "Assigned Role",
    clearanceLabel: "Clearance Gate",
    deptLabel: "Hotel Department",
    registerBtn: "Register Operator",
    simulationSuccess: "Simulation Broadcast Complete",
    simulationLogged: "Action logged with secure SHA-256 block hash validation.",
    matrixAction: "System Action",
    authBy: "Authorized By",
    statusLabel: "Status Code",
    clearanceLevel: "Clearance Gate Level",
    simulateBtn: "Broadcast Simulation Block",
    searchPlaceholder: "Search oversight records...",
    filterAll: "All Logs",
    filterAuth: "Authorized Only",
    filterBypass: "Sovereign Bypasses",
    filterAlerts: "Restricted Denials",
    alertConsole: "Secure System Forensic Console",
    alertConsoleDesc: "Live micro-ledger logs showing actions executed relative to user role authorities.",
    activeNodes: "Active System Nodes",
    alertLogsCount: "Total Records Processed",
    bypassLogsCount: "Bypasses Tracked",
    deniedAttempts: "Access Denied Counts",
    actionFulfillRoomService: "Fulfill VIP Caviar Order",
    actionDecryptedVault: "Decrypt Sovereign Vault Dossier",
    actionAdjustRates: "Modify Global Channel Pricing",
    actionBypassHVAC: "Recalibrate Suite Climate Gate",
    actionRecalibrateGlow: "Recalibrate Dynamic Glow Pigment",
    actionGrantAccess: "Authorize Guest Front-Desk Entrance",
    actionLogOff: "Logoff Node Console",
    statusActive: "Active",
    statusOnBreak: "On Break",
    statusSuspended: "Suspended",
    protocolLabel: "Execution Protocol",
    protocolStandard: "Standard Protocol // CLEARANCE PASS",
    protocolUrgent: "Dynamic Urgency Bypass // OVERRIDE MODE",
    protocolRestricted: "Unsanctioned Attack Simulation // AUDIT RECORD",
    selectStaffPlaceholder: "-- Select Staff Node --",
    selectActionPlaceholder: "-- Choose Action --",
    matrixExplanation: "This live matrix verifies security boundaries. Managers hold Level 5 access allowing administrative modifications. Operators hold Level 4 access for customer-facing services and general operations. Unsanctioned attempts are recorded in the Secure Forensic console instantly.",
    noLogs: "No matching forensic logs found.",
    idLabel: "ID Tag",
    actionsHeader: "Operations Controls",
    revokeAccess: "Revoke Access ID",
  },
  FR: {
    title: "Supervision des Opérations & Contrôle du Personnel",
    subtitle: "Nœuds de commande du système, registre du personnel, matrice des autorisations et simulateur holographique.",
    staffDirectory: "Registre du Personnel & Gestion des Utilisateurs",
    staffDirectoryDesc: "Enrôlez, révoquez ou recalibrez les accès du personnel actif de l'hôtel.",
    permissionsMatrix: "Matrice des Habilitations & Droits",
    permissionsMatrixDesc: "Limites d'accès définissant qui est autorisé à faire quoi et comment.",
    liveSimulator: "Moteur de Simulation des Opérations",
    liveSimulatorDesc: "Diffusez des actions interactives pour simuler l'activité dans les journaux d'audit.",
    addStaff: "Enregistrer un Agent / Nœud Opérateur",
    nameLabel: "Nom Complet",
    roleLabel: "Rôle Assigné",
    clearanceLabel: "Seuil d'Habilitation",
    deptLabel: "Département Hôtelier",
    registerBtn: "Enregistrer l'Opérateur",
    simulationSuccess: "Diffusion de la Simulation Terminée",
    simulationLogged: "Action enregistrée avec validation par signature SHA-256.",
    matrixAction: "Action Système",
    authBy: "Autorisé Par",
    statusLabel: "Code de Statut",
    clearanceLevel: "Seuil d'Habilitation Requis",
    simulateBtn: "Diffuser le Bloc de Simulation",
    searchPlaceholder: "Rechercher dans les enregistrements...",
    filterAll: "Tous les Journaux",
    filterAuth: "Autorisés Uniquement",
    filterBypass: "Contournements Souverains",
    filterAlerts: "Tentatives Refusées",
    alertConsole: "Console Forensique & Sécurisée du Système",
    alertConsoleDesc: "Journaux en direct montrant les actions exécutées selon les droits des utilisateurs.",
    activeNodes: "Nœuds Système Actifs",
    alertLogsCount: "Total des Enregistrements",
    bypassLogsCount: "Contournements Enregistrés",
    deniedAttempts: "Tentatives Refusées",
    actionFulfillRoomService: "Fidéliser la Commande Caviar VIP",
    actionDecryptedVault: "Déchiffrer le Coffre-fort Souverain",
    actionAdjustRates: "Modifier les Tarifs des Canaux Globaux",
    actionBypassHVAC: "Recalibrer la Climatisation des Suites",
    actionRecalibrateGlow: "Modifier le Pigment de Lueur",
    actionGrantAccess: "Autoriser l'Entrée d'un Client à l'Accueil",
    actionLogOff: "Déconnexion du Nœud",
    statusActive: "Actif",
    statusOnBreak: "En Pause",
    statusSuspended: "Suspendu",
    protocolLabel: "Protocole d'Exécution",
    protocolStandard: "Protocole Standard // ACCÈS AUTORISÉ",
    protocolUrgent: "Contournement d'Urgence // MODE PARÉ",
    protocolRestricted: "Simulation d'Attaque Non-Autorisée // AUDIT CONSOLE",
    selectStaffPlaceholder: "-- Sélectionner un Agent --",
    selectActionPlaceholder: "-- Choisir une Action --",
    matrixExplanation: "Cette matrice valide les limites d'accès. Le Propriétaire (L5) détient les droits d'administration globale. Les Opérateurs (L4) gèrent la réception et le service. Toute tentative non réglementaire est immédiatement transmise à la console forensique.",
    noLogs: "Aucun journal ne correspond à votre recherche.",
    idLabel: "Balise ID",
    actionsHeader: "Contrôles Opérationnels",
    revokeAccess: "Révoquer la Clé ID",
  },
  RU: {
    title: "Панель Оперативного Управления и Контроля Персонала",
    subtitle: "Командные узлы системы, реестр персонала, управление пользователями, матрица разрешений и симулятор операций.",
    staffDirectory: "Реестр Персонала и Управление Пользователями",
    staffDirectoryDesc: "Регистрация, удаление или изменение уровня доступа операторов и персонала.",
    permissionsMatrix: "Матрица Прав доступа и Авторизации",
    permissionsMatrixDesc: "Границы полномочий, показывающие, кто, что и как имеет право делать.",
    liveSimulator: "Двигатель Симуляции Операций",
    liveSimulatorDesc: "Интерактивная трансляция имитационных действий в системный журнал аудита.",
    addStaff: "Регистрация Нового Оператора",
    nameLabel: "Полное Имя",
    roleLabel: "Назначенная Роль",
    clearanceLabel: "Уровень Доступа",
    deptLabel: "Отдел Отеля",
    registerBtn: "Зарегистрировать Оператора",
    simulationSuccess: "Трансляция Симуляции Завершена",
    simulationLogged: "Действие записано и подтверждено криптографическим хэшем SHA-256.",
    matrixAction: "Системное Действие",
    authBy: "Кем Авторизовано",
    statusLabel: "Код Статуса",
    clearanceLevel: "Минимальный Допуск",
    simulateBtn: "Передать Блок Симуляции",
    searchPlaceholder: "Поиск записей контроля...",
    filterAll: "Все Записи",
    filterAuth: "Авторизованные",
    filterBypass: "Суверенные Обходы",
    filterAlerts: "Отказы в Доступе",
    alertConsole: "Криптографическая Консоль Судебного Аудита",
    alertConsoleDesc: "Прямая трансляция системного реестра операций, показывающая кто и как выполнил действия.",
    activeNodes: "Активные Узлы Системы",
    alertLogsCount: "Всего Обработано Записей",
    bypassLogsCount: "Зафиксировано Обходов",
    deniedAttempts: "Заблокировано Попыток",
    actionFulfillRoomService: "Выполнить заказ Черной Икры (VIP)",
    actionDecryptedVault: "Расшифровать Секретный Архив Документов",
    actionAdjustRates: "Изменить Глобальные Тарифы Каналов",
    actionBypassHVAC: "Калибровать Климат Контроль Апартаментов",
    actionRecalibrateGlow: "Перекалибровать Динамический Неон",
    actionGrantAccess: "Авторизовать Вход Гостя на Ресепшене",
    actionLogOff: "Выйти из Системной Консоли",
    statusActive: "Активен",
    statusOnBreak: "На Перерыве",
    statusSuspended: "Приостановлен",
    protocolLabel: "Протокол Исполнения",
    protocolStandard: "Стандартный Протокол // ДОПУСК ОДОБРЕН",
    protocolUrgent: "Экстренное Переопределение // РЕЖИМ ЖУРНАЛА",
    protocolRestricted: "Имитация Несанкционированного Доступа // ТРЕВОГА",
    selectStaffPlaceholder: "-- Выбрать Сотрудника --",
    selectActionPlaceholder: "-- Выбрать Операцию --",
    matrixExplanation: "Эта матрица проверяет границы безопасности. Владелец (L5) имеет полный доступ для административных изменений. Операторы (L4) обрабатывают базовые услуги. Попытки превышения лимитов немедленно фиксируются консолью аудита.",
    noLogs: "Записи судебного контроля не найдены.",
    idLabel: "ID Метка",
    actionsHeader: "Управление Операциями",
    revokeAccess: "Аннулировать Доступ",
  }
};

const INITIAL_STAFF: Personnel[] = [
  { id: 'ST-9182', name: 'Elena Petrova', role: 'Aesthetic Engineer', clearance: 'L5', status: 'Active', department: 'Command Desk', avatar: 'EP' },
  { id: 'ST-4902', name: 'Marc Laurent', role: 'Manager', clearance: 'L5', status: 'Active', department: 'Front Desk', avatar: 'ML' },
  { id: 'ST-8831', name: 'Vladimir Sokolov', role: 'Security VIP', clearance: 'L4', status: 'On Break', department: 'Main Gate', avatar: 'VS' },
  { id: 'ST-1033', name: 'Marie Dubois', role: 'VIP Butler', clearance: 'L4', status: 'Active', department: 'Luxury Suites', avatar: 'MD' },
  { id: 'ST-7741', name: 'Jean-Pierre', role: 'Operator', clearance: 'L3', status: 'Suspended', department: 'Plant Room', avatar: 'JP' }
];

import { useAuditStore, useAddAuditLog } from '../shared/store/auditStore';

export const ManagementTab: React.FC = () => {
  const language = 'EN';
  const auditLogs = useAuditStore(state => state.audits);
  const addAuditLog = useAddAuditLog();
  const trans = tabTranslations[language] || tabTranslations.EN;

  // Personnel State
  const [staffList, setStaffList] = useState<Personnel[]>(INITIAL_STAFF);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Personnel['role']>('Operator');
  const [newClearance, setNewClearance] = useState<Personnel['clearance']>('L3');
  const [newDept, setNewDept] = useState('Front Desk');

  // Simulation State
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [simAction, setSimAction] = useState('');
  const [simProtocol, setSimProtocol] = useState<'standard' | 'override' | 'attack'>('standard');
  const [simulating, setSimulating] = useState(false);
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  // Filter Console State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT'>('ALL');

  // Add staff
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const initials = newName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const idNum = Math.floor(1000 + Math.random() * 9000);
    const newMember: Personnel = {
      id: `ST-${idNum}`,
      name: newName,
      role: newRole,
      clearance: newClearance,
      status: 'Active',
      department: newDept,
      avatar: initials || 'ST'
    };

    setStaffList([...staffList, newMember]);
    setNewName('');
    addAuditLog(
      'PERSONNEL_ENROLLED', 
      `Enrolled new Operator Node: ${newName} as ${newRole} (ID: ${newMember.id}, clearance: ${newClearance}).`, 
      'AUTHORIZED'
    );
    confetti({ particleCount: 15, spread: 45 });
  };

  // Delete staff
  const handleDeleteStaff = (id: string, name: string) => {
    setStaffList(staffList.filter(s => s.id !== id));
    addAuditLog(
      'CREDENTIALS_REVOKED', 
      `Revoked ID Tag access and security keys for staff node: ${name} (ID: ${id}).`, 
      'AUTHORIZED'
    );
    confetti({ particleCount: 10, colors: ['#ff0033'] });
  };

  // Toggle status staff
  const handleToggleStatus = (id: string) => {
    setStaffList(staffList.map(s => {
      if (s.id === id) {
        let nextStatus: Personnel['status'] = 'Active';
        if (s.status === 'Active') nextStatus = 'On Break';
        else if (s.status === 'On Break') nextStatus = 'Suspended';
        
        addAuditLog(
          'NODE_METRIC_RECALIBRATED', 
          `Shifted staff worker status for ${s.name} from ${s.status} to ${nextStatus}.`, 
          'AUTHORIZED'
        );
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  // Simulate Operations Action
  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId || !simAction) return;

    const actor = staffList.find(s => s.id === selectedStaffId);
    if (!actor) return;

    setSimulating(true);

    setTimeout(() => {
      setSimulating(false);

      // Determine authorization outcome based on role and protocol
      let outcomeStatus: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT' = 'AUTHORIZED';
      
      // If simulated as an attack or if clearance level of actor is too low for sensitive documents/channels
      const requiresHighClearance = ['actionDecryptedVault', 'actionAdjustRates', 'actionBypassHVAC'].includes(simAction);
      
      if (simProtocol === 'attack') {
        outcomeStatus = 'RESTRICTED_ATTEMPT';
      } else if (requiresHighClearance && actor.clearance !== 'L5') {
        if (simProtocol === 'override') {
          outcomeStatus = 'BYPASS';
        } else {
          outcomeStatus = 'RESTRICTED_ATTEMPT';
        }
      } else if (simProtocol === 'override') {
        outcomeStatus = 'BYPASS';
      }

      // Map actions to labels
      const actionLabels: Record<string, string> = {
        actionFulfillRoomService: trans.actionFulfillRoomService,
        actionDecryptedVault: trans.actionDecryptedVault,
        actionAdjustRates: trans.actionAdjustRates,
        actionBypassHVAC: trans.actionBypassHVAC,
        actionRecalibrateGlow: trans.actionRecalibrateGlow,
        actionGrantAccess: trans.actionGrantAccess,
        actionLogOff: trans.actionLogOff,
      };

      const actionText = actionLabels[simAction] || simAction;
      const uppercaseAction = simAction.replace(/([A-Z])/g, '_$1').toUpperCase();

      // Custom audit log text
      let reasonText = '';
      if (outcomeStatus === 'AUTHORIZED') {
        reasonText = `Executed ${actionText.toLowerCase()} safely under standard staff clearance protocol. Verified by Operator: ${actor.name} (${actor.role}).`;
      } else if (outcomeStatus === 'BYPASS') {
        reasonText = `Sovereign emergency bypass invoked for ${actionText.toLowerCase()} by ${actor.name} (${actor.role}). Action recorded and security matrix verified.`;
      } else {
        reasonText = `ALERT: Non-sanctioned execution of ${actionText.toLowerCase()} attempted by unauthorized staff: ${actor.name} - Role: ${actor.role} (Clearance Level: ${actor.clearance}). BLOCKED.`;
      }

      // Record to master audit log
      addAuditLog(
        uppercaseAction, 
        reasonText, 
        outcomeStatus, 
        `${actor.name.toUpperCase()} (${actor.clearance})`
      );

      // Trigger user-friendly validation visual cues
      if (outcomeStatus === 'RESTRICTED_ATTEMPT') {
        confetti({ particleCount: 20, colors: ['#f43f5e', '#ef4444', '#f59e0b'] });
      } else {
        confetti({ particleCount: 25, colors: ['#10b981', '#059669', '#d97706'], spread: 50 });
      }

      setLastNotification(`${actor.name}: ${actionText} -> [${outcomeStatus}]`);
      setTimeout(() => setLastNotification(null), 4000);

      // Reset
      setSimAction('');
    }, 1200);
  };

  // Statistics calculation
  const totalLogs = auditLogs.length;
  const countBypasses = auditLogs.filter(l => l.status === 'BYPASS').length;
  const countDenied = auditLogs.filter(l => l.status === 'RESTRICTED_ATTEMPT').length;
  const countActiveStaff = staffList.filter(s => s.status === 'Active').length;

  // Filtering Audit Records
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      activeFilter === 'ALL' ||
      (activeFilter === 'AUTHORIZED' && log.status === 'AUTHORIZED') ||
      (activeFilter === 'BYPASS' && log.status === 'BYPASS') ||
      (activeFilter === 'RESTRICTED_ATTEMPT' && log.status === 'RESTRICTED_ATTEMPT');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="management-tab">
      
      {/* Dynamic Statistics Grid Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        <div className="glass-panel p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#c19a6b]/20 flex items-center justify-center text-[#7c5a30] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">{trans.activeNodes}</p>
            <p className="text-xl font-bold font-mono text-slate-800">{countActiveStaff} / {staffList.length}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">{trans.alertLogsCount}</p>
            <p className="text-xl font-bold font-mono text-slate-800">{totalLogs}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">{trans.bypassLogsCount}</p>
            <p className="text-xl font-bold font-mono text-slate-800">{countBypasses}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">{trans.deniedAttempts}</p>
            <p className="text-xl font-bold font-mono text-slate-800">{countDenied}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: STAFF DIRECTORY & REGISTER */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl relative overflow-hidden">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-black/5">
              <div>
                <h3 className="text-xl font-serif-luxury text-slate-800 font-bold flex items-center gap-2">
                  🛡️ {trans.staffDirectory}
                </h3>
                <p className="text-xs text-slate-600 mt-1">{trans.staffDirectoryDesc}</p>
              </div>
            </div>

            {/* Staff list grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {staffList.map((member) => (
                <div 
                  key={member.id} 
                  className={`p-4 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col justify-between h-44 ${
                    member.status === 'Suspended' 
                      ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                      : member.status === 'On Break'
                        ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                        : 'bg-white/45 border-white/60 hover:border-[#c19a6b]/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-900 border border-[#c19a6b]/30 flex items-center justify-center text-[#c19a6b] font-serif-luxury text-sm font-bold shadow-sm">
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 tracking-tight">{member.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono tracking-wider">{member.id} // {member.department}</p>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      member.clearance === 'L5' ? 'bg-[#c19a6b]/20 text-[#7c5a30] border border-[#c19a6b]/30' :
                      member.clearance === 'L4' ? 'bg-sky-500/10 text-sky-700 border border-sky-500/20' :
                      'bg-slate-500/10 text-slate-700 border border-slate-500/20'
                    }`}>
                      {member.clearance}
                    </span>
                  </div>

                  <div className="border-t border-black/5 pt-3 mt-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-mono uppercase text-slate-400 font-bold">{trans.roleLabel}</p>
                      <p className="font-semibold text-slate-700">{member.role}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(member.id)}
                        className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border transition ${
                          member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20' :
                          member.status === 'On Break' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20' :
                          'bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20'
                        }`}
                        title="Click to cycle status"
                      >
                        {member.status === 'Active' ? trans.statusActive :
                         member.status === 'On Break' ? trans.statusOnBreak :
                         trans.statusSuspended}
                      </button>

                      {/* Protect deleting Elena Petrova to keep default admin */}
                      {member.id !== 'ST-9182' && (
                        <button
                          onClick={() => handleDeleteStaff(member.id, member.name)}
                          className="p-1 px-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 transition-all duration-200"
                          title={trans.revokeAccess}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ADD OPERATOR COMPONENT */}
            <form onSubmit={handleAddStaff} className="mt-6 pt-6 border-t border-black/5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end animate-fade-in bg-white/20 p-4 rounded-2xl border border-slate-300">
              <div className="sm:col-span-12">
                <h4 className="text-xs uppercase font-mono tracking-widest text-[#7c5a30] font-bold">
                  ➕ {trans.addStaff}
                </h4>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">{trans.nameLabel}</label>
                <input 
                  type="text" 
                  value={newName} 
                  required
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="Jean-Luc Picard" 
                  className="w-full p-2.5 text-xs rounded-xl bg-white/60 border border-slate-300 text-slate-800 focus:border-[#c19a6b] focus:ring-0 focus:outline-none placeholder-slate-400" 
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">{trans.roleLabel}</label>
                <select 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value as any)} 
                  className="w-full p-2.5 text-xs rounded-xl bg-white/60 border border-slate-300 text-slate-800 font-mono focus:border-[#c19a6b] focus:ring-0"
                >
                  <option value="Operator">Operator</option>
                  <option value="Manager">Manager</option>
                  <option value="VIP Butler">VIP Butler</option>
                  <option value="Security VIP">Security VIP</option>
                  <option value="Aesthetic Engineer">Aesthetic Engineer</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">{trans.clearanceLabel}</label>
                <select 
                  value={newClearance} 
                  onChange={(e) => setNewClearance(e.target.value as any)} 
                  className="w-full p-2.5 text-xs rounded-xl bg-white/60 border border-slate-300 text-slate-800 font-mono focus:border-[#c19a6b] focus:ring-0"
                >
                  <option value="L1">L1 Clearance</option>
                  <option value="L2">L2 Clearance</option>
                  <option value="L3">L3 Clearance</option>
                  <option value="L4">L4 Clearance</option>
                  <option value="L5">L5 Clearance (Full)</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">{trans.deptLabel}</label>
                <input 
                  type="text" 
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)} 
                  className="w-full p-2.5 text-xs rounded-xl bg-white/60 border border-slate-300 text-slate-800 focus:border-[#c19a6b] focus:ring-0 focus:outline-none" 
                />
              </div>

              <div className="sm:col-span-2">
                <button 
                  type="submit" 
                  className="w-full py-2.5 bg-[#c19a6b] hover:bg-[#7c5a30] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition shadow active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{trans.registerBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE SIMULATOR & PERMISSIONS MATRIX */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          
          {/* SIMULATOR */}
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl flex flex-col justify-between h-auto space-y-6 relative overflow-hidden">
            
            <div className="space-y-1">
              <span className="text-[8px] bg-[#c19a6b]/15 text-[#7c5a30] border border-[#c19a6b]/30 px-2.5 py-1 rounded font-mono font-bold uppercase tracking-widest leading-none">
                {trans.liveSimulator.toUpperCase()}
              </span>
              <h3 className="text-lg font-serif-luxury text-slate-800 font-bold leading-tight mt-1">{trans.liveSimulator}</h3>
              <p className="text-xs text-slate-600">{trans.liveSimulatorDesc}</p>
            </div>

            {lastNotification && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 animate-bounce text-xs font-mono text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">{trans.simulationSuccess}!</p>
                  <p className="text-[10px] text-emerald-700">{lastNotification}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  1. {trans.authBy}
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-white/70 border border-slate-300 text-[#7c5a30] font-mono focus:border-[#c19a6b] focus:ring-0 font-bold cursor-pointer"
                >
                  <option value="">{trans.selectStaffPlaceholder}</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>
                      [{s.clearance}] {s.name} - {s.role} ({s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  2. {trans.matrixAction}
                </label>
                <select
                  required
                  value={simAction}
                  onChange={(e) => setSimAction(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-white/70 border border-slate-300 text-slate-800 focus:border-[#c19a6b] focus:ring-0 font-semibold cursor-pointer"
                >
                  <option value="">{trans.selectActionPlaceholder}</option>
                  <option value="actionFulfillRoomService">🍽️ {trans.actionFulfillRoomService} (L1+)</option>
                  <option value="actionGrantAccess">🔑 {trans.actionGrantAccess} (L3+)</option>
                  <option value="actionRecalibrateGlow">🎨 {trans.actionRecalibrateGlow} (L4+)</option>
                  <option value="actionDecryptedVault">📂 {trans.actionDecryptedVault} (L5 Required)</option>
                  <option value="actionAdjustRates">📊 {trans.actionAdjustRates} (L5 Required)</option>
                  <option value="actionBypassHVAC">🌡️ {trans.actionBypassHVAC} (L5 Required)</option>
                  <option value="actionLogOff">🔐 {trans.actionLogOff} (L1+)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  3. {trans.protocolLabel}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { mode: 'standard', label: trans.protocolStandard, color: 'border-slate-300 text-slate-700' },
                    { mode: 'override', label: trans.protocolUrgent, color: 'border-amber-400 text-amber-800' },
                    { mode: 'attack', label: trans.protocolRestricted, color: 'border-red-500 text-red-800' }
                  ].map(proto => (
                    <button
                      key={proto.mode}
                      type="button"
                      onClick={() => setSimProtocol(proto.mode as any)}
                      className={`p-2.5 rounded-xl text-left font-mono text-[10px] border-2 transition-all flex items-center gap-2 ${
                        simProtocol === proto.mode 
                          ? 'bg-black text-[#c19a6b] border-[#c19a6b] shadow-sm' 
                          : 'bg-white/40 border-transparent hover:bg-white/60'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        proto.mode === 'standard' ? 'bg-emerald-500' :
                        proto.mode === 'override' ? 'bg-amber-500 animate-pulse' :
                        'bg-red-500 animate-ping'
                      }`} />
                      <span className="font-bold">{proto.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={simulating || !selectedStaffId || !simAction}
                className="w-full py-3 bg-black hover:bg-stone-900 disabled:bg-stone-300 disabled:text-stone-500 text-[#c19a6b] font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition duration-150 flex items-center justify-center gap-2 border border-stone-800 shadow shadow-[#c19a6b]/20"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#c19a6b]" />
                    <span>BROADCASTING TRANSACTION PROTOCOL...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{trans.simulateBtn}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* PERMISSIONS MATRIX CHECKLIST */}
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-serif-luxury text-slate-800 font-bold flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#c19a6b]" /> {trans.permissionsMatrix}
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">{trans.permissionsMatrixDesc}</p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              {[
                { name: trans.actionFulfillRoomService, req: 'L1', desc: 'Prepare and dispatch gourmet courses to client suites' },
                { name: trans.actionGrantAccess, req: 'L3', desc: 'Produce cryptographically encoded physical RFID gate cards' },
                { name: trans.actionRecalibrateGlow, req: 'L4', desc: 'Calibrate dynamic lightwave and ambient color pigments' },
                { name: trans.actionDecryptedVault, req: 'L5', desc: 'Decrypt permanent records of hotel operations' },
                { name: trans.actionAdjustRates, req: 'L5', desc: 'Alter sync coefficients across global room distribution channels' },
                { name: trans.actionBypassHVAC, req: 'L5', desc: 'Unshackle mechanical safety limits on environmental HVAC gates' }
              ].map((act, i) => (
                <div key={i} className="p-2.5 bg-white/45 border border-slate-350/50 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 text-[11px]">{act.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono tracking-tight leading-none">{act.desc}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#c19a6b]/15 text-[#7c5a30] border border-[#c19a6b]/30 rounded-lg px-2 py-0.5 shrink-0">
                    {trans.clearanceLevel}: {act.req}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 font-mono italic leading-normal border-t border-black/5 pt-3">
              💡 {trans.matrixExplanation}
            </p>
          </div>

        </div>

        {/* FULL-WIDTH SECURITY FORENSIC CONSOLE LOGS */}
        <div className="lg:col-span-12 premium-border-glow rounded-3xl p-6 bg-slate-950/90 border-2 border-stone-900 text-stone-100 shadow-[0_0_20px_rgba(193,154,107,0.4)] relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-sm font-mono tracking-widest text-[#c19a6b] font-bold uppercase flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-[#c19a6b]" /> {trans.alertConsole}
                </h4>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {trans.alertConsoleDesc}
              </p>
            </div>

            {/* Logs Search & Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={trans.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-black/80 border border-stone-800 rounded-xl text-stone-200 text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#c19a6b] focus:ring-0 max-w-xs"
                />
              </div>

              <div className="flex bg-black p-0.5 rounded-xl border border-stone-800 font-mono text-[9px] font-bold">
                {[
                  { filter: 'ALL', label: trans.filterAll },
                  { filter: 'AUTHORIZED', label: trans.filterAuth },
                  { filter: 'BYPASS', label: trans.filterBypass },
                  { filter: 'RESTRICTED_ATTEMPT', label: trans.filterAlerts },
                ].map(item => (
                  <button
                    key={item.filter}
                    onClick={() => setActiveFilter(item.filter as any)}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      activeFilter === item.filter
                        ? 'bg-[#c19a6b] text-black font-bold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-800 bg-[#060a12]/85 max-h-72 overflow-y-auto">
            <table className="w-full text-left border-collapse font-mono text-[10.5px]">
              <thead>
                <tr className="bg-stone-900 border-b border-stone-800 text-[#c19a6b] uppercase tracking-wider text-[9px]">
                  <th className="p-3 pl-4">ID</th>
                  <th className="p-3">{trans.statusLabel}</th>
                  <th className="p-3">Event / Action</th>
                  <th className="p-3">Subject / Node Clearance</th>
                  <th className="p-3">Action Description // Forensic Reason Log</th>
                  <th className="p-3 pr-4 text-right">Block Hash (SHA-256)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-900">
                {filteredLogs.length > 0 ? (
                  filteredLogs.slice().reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition">
                      <td className="p-3 pl-4 font-bold text-slate-600">{log.id}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                          log.status === 'AUTHORIZED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          log.status === 'BYPASS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                          'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse font-bold'
                        }`}>
                          {log.status === 'AUTHORIZED' && 'AUTHORIZED'}
                          {log.status === 'BYPASS' && 'SOVEREIGN_BYPASS'}
                          {log.status === 'RESTRICTED_ATTEMPT' && 'SEC_BREACH_REJECTED'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-100 uppercase tracking-wide">{log.action}</td>
                      <td className="p-3 font-semibold text-[#c19a6b] text-nowrap">{log.role}</td>
                      <td className="p-3 text-slate-300 max-w-lg font-mono tracking-tight leading-normal" title={log.details}>
                        {log.details}
                        <span className="block text-[8px] text-slate-500 mt-0.5 font-mono">Timestamp: {new Date(log.timestamp).toLocaleString()}</span>
                      </td>
                      <td className="p-3 pr-4 text-right font-mono text-stone-500 text-[10px] select-all uppercase">
                        {log.hash ? log.hash.slice(0, 20) : 'N/A'}...
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-stone-500 font-mono text-xs">
                      {trans.noLogs}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 pt-3 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center text-[9px] text-stone-500 font-mono gap-2">
            <span>CHAIN ANCHOR COMPLIANCE LOGS SHIELDED WITH DUAL-SIGN SIGNATURES</span>
            <span className="text-[#c19a6b] select-none">SHA_CHAINING_LINKED_BY_HASH: TRUE // REVISION v1.9</span>
          </div>
        </div>

      </div>
    </div>
  );
};
