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
  Shield,
  Lock,
  Unlock,
  Clock,
  UserCog,
  Terminal,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuditEntry } from '../App';

export interface AdminAccount {
  id: string;
  username: string;
  email: string;
  assignedRole: 'Inventory Manager' | 'Financial Auditor' | 'Security Officer' | 'Super Admin' | 'L5 Operations Chief';
  permissions: {
    readLogs: boolean;
    modifyInventory: boolean;
    approveBudgets: boolean;
    overrideFirewalls: boolean;
    decryptData: boolean;
  };
  status: 'Active' | 'Locked' | 'Awaiting Activation';
  createdAt: string;
}

export interface PrivilegeChange {
  id: string;
  timestamp: string;
  adminName: string;
  actionBy: string;
  changeType: 'ACCOUNT_CREATED' | 'ROLE_UPGRADED' | 'PERMISSION_REVOKED' | 'PERMISSION_GRANTED' | 'ACCOUNT_LOCKED' | 'ACCOUNT_UNLOCKED';
  description: string;
  affectedPermissions: string[];
}

const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: 'ADM-2041',
    username: 'maximilian.core',
    email: 'm.vance@sapphir.academy',
    assignedRole: 'Financial Auditor',
    permissions: {
      readLogs: true,
      modifyInventory: false,
      approveBudgets: true,
      overrideFirewalls: false,
      decryptData: false,
    },
    status: 'Active',
    createdAt: '2026-06-19T08:30:12Z'
  },
  {
    id: 'ADM-5509',
    username: 'seraphina.security',
    email: 's.sterling@sapphir.academy',
    assignedRole: 'Security Officer',
    permissions: {
      readLogs: true,
      modifyInventory: false,
      approveBudgets: false,
      overrideFirewalls: true,
      decryptData: true,
    },
    status: 'Active',
    createdAt: '2026-06-18T14:15:33Z'
  },
  {
    id: 'ADM-7112',
    username: 'viktor.kael',
    email: 'v.kael@sapphir.academy',
    assignedRole: 'Inventory Manager',
    permissions: {
      readLogs: false,
      modifyInventory: true,
      approveBudgets: false,
      overrideFirewalls: false,
      decryptData: false,
    },
    status: 'Awaiting Activation',
    createdAt: '2026-06-20T04:22:15Z'
  }
];

const INITIAL_PRIVILEGE_HISTORY: PrivilegeChange[] = [
  {
    id: 'PRV-1102',
    timestamp: '2026-06-20T04:22:15-07:00',
    adminName: 'viktor.kael',
    actionBy: 'Sovereign Super Admin',
    changeType: 'ACCOUNT_CREATED',
    description: 'Provisioned new Inventory Manager node. Awaiting identity cryptographic handshakes.',
    affectedPermissions: ['Modify Inventory']
  },
  {
    id: 'PRV-0984',
    timestamp: '2026-06-19T08:30:12-07:00',
    adminName: 'maximilian.core',
    actionBy: 'Sovereign Super Admin',
    changeType: 'ROLE_UPGRADED',
    description: 'Upgraded admin category to Financial Auditor and granted Approve Budgets scopes.',
    affectedPermissions: ['Read Logs', 'Approve Budgets']
  },
  {
    id: 'PRV-0871',
    timestamp: '2026-06-18T15:20:00-07:00',
    adminName: 'seraphina.security',
    actionBy: 'Sovereign Super Admin',
    changeType: 'PERMISSION_GRANTED',
    description: 'Elevated override credentials to bypass safety limit firewalls.',
    affectedPermissions: ['Override Firewalls']
  }
];

interface Personnel {
  id: string;
  name: string;
  role: 'Operator' | 'Manager' | 'VIP Butler' | 'Security VIP' | 'Aesthetic Engineer';
  clearance: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  status: 'Active' | 'On Break' | 'Suspended';
  department: string;
  avatar: string;
}

interface ManagementTabProps {
  language: 'EN' | 'FR' | 'RU';
  auditLogs: AuditEntry[];
  addAuditLog: (
    action: string, 
    reason: string, 
    status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT', 
    roleStr?: string
  ) => void;
}

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
    superAdminPanel: "Super Admin Command Center // RBAC Engine",
    superAdminDesc: "Elevated sovereignty sector. Provision secondary administration accounts, assign specific micro-permissions, and query privilege logs.",
    adminAccounts: "Administrative accounts & Roles",
    createAdminTitle: "Provision Administrative Account",
    adminName: "Username / Agent Handle",
    adminRole: "Assigned Privilege Title",
    adminPermissions: "Discrete Domain Permissions",
    adminStatus: "Account Access Gate",
    historyTitle: "Administrative Privilege Alteration Ledger",
    historyDesc: "Immutable record tracking every privilege elevation, token grant or account creation.",
    assignedPerms: "Assigned Domain Scopes",
    prmInventory: "Inventory Manager",
    prmAuditor: "Financial Auditor",
    prmSecurity: "Security Officer",
    actCreateAccount: "CREATION",
    actUpdatePerms: "PRIVILEGE MODIFICATION",
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
    superAdminPanel: "Centre de Commandement Admin // Moteur RBAC",
    superAdminDesc: "Secteur de souveraineté élevée. Créez des comptes d'administration secondaires, attribuez des permissions spécifiques et consultez les journaux de privilèges.",
    adminAccounts: "Comptes d'Administration",
    createAdminTitle: "Créer un Compte de Gouvernance Admin",
    adminName: "Nom d'utilisateur / Identifiant",
    adminRole: "Titre de Privilège Assigné",
    adminPermissions: "Permissions de Domaine Spécifiques",
    adminStatus: "Statut d'Accès du Compte",
    historyTitle: "Grand Livre de Contrôle des Privilèges",
    historyDesc: "Registre cryptographique immuable suivant chaque élévation de privilège ou création de compte administratif.",
    assignedPerms: "Domaines Assignés",
    prmInventory: "Gestionnaire d'Inventaire",
    prmAuditor: "Auditeur Financier",
    prmSecurity: "Officier de Sécurité",
    actCreateAccount: "CRÉATION",
    actUpdatePerms: "MODIFICATION PRIVILÈGE",
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
    superAdminPanel: "Командный Центр Супер-Администратора // Движок RBAC",
    superAdminDesc: "Сектор повышенного суверенитета. Создание вспомогательных административных учетных записей, назначение прав и аудит изменения привилегий.",
    adminAccounts: "Административные Учетные Записи",
    createAdminTitle: "Создать Административный Конспект",
    adminName: "Имя Пользователя / Псевдоним",
    adminRole: "Назначенный Полномочный Титул",
    adminPermissions: "Специфические Права Доступа",
    adminStatus: "Статус Доступа Конспеккта",
    historyTitle: "Реестр Изменения Административных Привилегий",
    historyDesc: "Неизменяемый криптографический реестр, отслеживающий каждое изменение привилегий и создание прав.",
    assignedPerms: "Назначенные Сферы Полномочий",
    prmInventory: "Менеджер Инвентаря",
    prmAuditor: "Финансовый Аудитор",
    prmSecurity: "Офицер Безопасности",
    actCreateAccount: "СОЗДАНИЕ",
    actUpdatePerms: "ИЗМЕНЕНИЕ ПРИВИЛЕГИЙ",
  }
};

const INITIAL_STAFF: Personnel[] = [
  { id: 'ST-9182', name: 'Elena Petrova', role: 'Aesthetic Engineer', clearance: 'L5', status: 'Active', department: 'Command Desk', avatar: 'EP' },
  { id: 'ST-4902', name: 'Marc Laurent', role: 'Manager', clearance: 'L5', status: 'Active', department: 'Front Desk', avatar: 'ML' },
  { id: 'ST-8831', name: 'Vladimir Sokolov', role: 'Security VIP', clearance: 'L4', status: 'On Break', department: 'Main Gate', avatar: 'VS' },
  { id: 'ST-1033', name: 'Marie Dubois', role: 'VIP Butler', clearance: 'L4', status: 'Active', department: 'Luxury Suites', avatar: 'MD' },
  { id: 'ST-7741', name: 'Jean-Pierre', role: 'Operator', clearance: 'L3', status: 'Suspended', department: 'Plant Room', avatar: 'JP' }
];

export const ManagementTab: React.FC<ManagementTabProps> = ({ 
  language, 
  auditLogs, 
  addAuditLog 
}) => {
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

  // Super Admin RBAC State variables
  const [viewMode, setViewMode] = useState<'standard' | 'rbac'>('standard');
  const [admins, setAdmins] = useState<AdminAccount[]>(INITIAL_ADMINS);
  const [privilegeHistory, setPrivilegeHistory] = useState<PrivilegeChange[]>(INITIAL_PRIVILEGE_HISTORY);
  
  // Create Administrative Account Form State
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminAccount['assignedRole']>('Security Officer');
  const [newAdminPerms, setNewAdminPerms] = useState<AdminAccount['permissions']>({
    readLogs: true,
    modifyInventory: false,
    approveBudgets: false,
    overrideFirewalls: true,
    decryptData: true,
  });

  // Helper to change form defaults based on role select
  const handleRoleSelectPreset = (role: AdminAccount['assignedRole']) => {
    setNewAdminRole(role);
    if (role === 'Inventory Manager') {
      setNewAdminPerms({ readLogs: true, modifyInventory: true, approveBudgets: false, overrideFirewalls: false, decryptData: false });
    } else if (role === 'Financial Auditor') {
      setNewAdminPerms({ readLogs: true, modifyInventory: false, approveBudgets: true, overrideFirewalls: false, decryptData: false });
    } else if (role === 'Security Officer') {
      setNewAdminPerms({ readLogs: true, modifyInventory: false, approveBudgets: false, overrideFirewalls: true, decryptData: true });
    } else if (role === 'L5 Operations Chief' || role === 'Super Admin') {
      setNewAdminPerms({ readLogs: true, modifyInventory: true, approveBudgets: true, overrideFirewalls: true, decryptData: true });
    }
  };

  // Create Admin
  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUser.trim() || !newAdminEmail.trim()) return;

    const idNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `ADM-${idNum}`;
    const newAccount: AdminAccount = {
      id: newId,
      username: newAdminUser.trim().toLowerCase(),
      email: newAdminEmail.trim(),
      assignedRole: newAdminRole,
      permissions: { ...newAdminPerms },
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    setAdmins([...admins, newAccount]);

    // Track active permissions
    const bounds = Object.entries(newAdminPerms)
      .filter(([_, active]) => active)
      .map(([k]) => k.replace(/([A-Z])/g, ' $1').trim());

    // Privilege log history entry
    const newLogId = `PRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newHistoryRecord: PrivilegeChange = {
      id: newLogId,
      timestamp: new Date().toISOString(),
      adminName: newAccount.username,
      actionBy: 'Sovereign Super Admin',
      changeType: 'ACCOUNT_CREATED',
      description: `Provisioned new admin account (${newAccount.username}) with role [${newAccount.assignedRole}].`,
      affectedPermissions: bounds
    };

    setPrivilegeHistory([newHistoryRecord, ...privilegeHistory]);

    // External System audit log link
    addAuditLog(
      'ADMIN_ACCOUNT_PROVISIONED',
      `Super Admin created account: ${newAccount.username} with role: ${newAccount.assignedRole} & discrete permissions: [${bounds.join(', ')}].`,
      'AUTHORIZED',
      'SUPER_ADMIN'
    );

    // Reset form
    setNewAdminUser('');
    setNewAdminEmail('');
    handleRoleSelectPreset('Security Officer');

    confetti({ particleCount: 40, spread: 60, colors: ['#c19a6b', '#1e293b'] });
  };

  // Toggle Admin Domain Permission Checkbox
  const handleToggleAdminPermission = (adminId: string, permKey: keyof AdminAccount['permissions']) => {
    setAdmins(prevAdmins => prevAdmins.map(admin => {
      if (admin.id === adminId) {
        const revisedVal = !admin.permissions[permKey];
        const updatedPerms = { ...admin.permissions, [permKey]: revisedVal };

        const label = permKey.replace(/([A-Z])/g, ' $1').trim();
        const changeType = revisedVal ? 'PERMISSION_GRANTED' : 'PERMISSION_REVOKED';
        const description = revisedVal
          ? `Granted standalone domain scope [${label}] to admin user: ${admin.username}.`
          : `Revoked domain scope [${label}] from admin user: ${admin.username}.`;

        const newLogId = `PRV-${Math.floor(1000 + Math.random() * 9000)}`;
        const newHistoryRecord: PrivilegeChange = {
          id: newLogId,
          timestamp: new Date().toISOString(),
          adminName: admin.username,
          actionBy: 'Sovereign Super Admin',
          changeType,
          description,
          affectedPermissions: [label]
        };

        setPrivilegeHistory(prev => [newHistoryRecord, ...prev]);

        addAuditLog(
          revisedVal ? 'PRIVILEGE_ELEVATED' : 'PRIVILEGE_DEGRADED',
          `Super Admin changed ${admin.username} bounds: ${revisedVal ? 'GRANTED' : 'REVOKED'} [${label}] scope.`,
          'AUTHORIZED',
          'SUPER_ADMIN'
        );

        return { ...admin, permissions: updatedPerms };
      }
      return admin;
    }));
  };

  // Update Admin Role
  const handleUpdateAdminRole = (adminId: string, role: AdminAccount['assignedRole']) => {
    setAdmins(prevAdmins => prevAdmins.map(admin => {
      if (admin.id === adminId) {
        const previousRole = admin.assignedRole;
        
        // Auto-apply standard presets for convenience
        let updatedPerms = { ...admin.permissions };
        if (role === 'Inventory Manager') {
          updatedPerms = { readLogs: true, modifyInventory: true, approveBudgets: false, overrideFirewalls: false, decryptData: false };
        } else if (role === 'Financial Auditor') {
          updatedPerms = { readLogs: true, modifyInventory: false, approveBudgets: true, overrideFirewalls: false, decryptData: false };
        } else if (role === 'Security Officer') {
          updatedPerms = { readLogs: true, modifyInventory: false, approveBudgets: false, overrideFirewalls: true, decryptData: true };
        } else if (role === 'L5 Operations Chief' || role === 'Super Admin') {
          updatedPerms = { readLogs: true, modifyInventory: true, approveBudgets: true, overrideFirewalls: true, decryptData: true };
        }

        const newLogId = `PRV-${Math.floor(1000 + Math.random() * 9000)}`;
        const newHistoryRecord: PrivilegeChange = {
          id: newLogId,
          timestamp: new Date().toISOString(),
          adminName: admin.username,
          actionBy: 'Sovereign Super Admin',
          changeType: 'ROLE_UPGRADED',
          description: `Transferred admin track from [${previousRole}] to [${role}]. Preset permission templates applied.`,
          affectedPermissions: Object.keys(updatedPerms).filter(k => updatedPerms[k as keyof AdminAccount['permissions']])
        };

        setPrivilegeHistory(prev => [newHistoryRecord, ...prev]);

        addAuditLog(
          'ADMIN_ROLE_UPDATED',
          `Super Admin changed ${admin.username} role from ${previousRole} to ${role} (and synchronised matching permission presets).`,
          'AUTHORIZED',
          'SUPER_ADMIN'
        );

        return { ...admin, assignedRole: role, permissions: updatedPerms };
      }
      return admin;
    }));
  };

  // Switch Admin Status Check
  const handleToggleAdminStatus = (adminId: string) => {
    setAdmins(prevAdmins => prevAdmins.map(admin => {
      if (admin.id === adminId) {
        let revisedStatus: AdminAccount['status'] = 'Active';
        if (admin.status === 'Active') revisedStatus = 'Locked';
        else if (admin.status === 'Locked') revisedStatus = 'Awaiting Activation';

        const changeType = revisedStatus === 'Locked' ? 'ACCOUNT_LOCKED' : 'ACCOUNT_UNLOCKED';
        const newLogId = `PRV-${Math.floor(1000 + Math.random() * 9000)}`;
        const newHistoryRecord: PrivilegeChange = {
          id: newLogId,
          timestamp: new Date().toISOString(),
          adminName: admin.username,
          actionBy: 'Sovereign Super Admin',
          changeType,
          description: `Changed account status for admin ${admin.username} to [${revisedStatus}].`,
          affectedPermissions: []
        };

        setPrivilegeHistory(prev => [newHistoryRecord, ...prev]);

        addAuditLog(
          revisedStatus === 'Locked' ? 'ADMIN_ACCOUNT_SUSPENDED' : 'ADMIN_ACCOUNT_ACTIVATED',
          `Super Admin modified ${admin.username} access state to [${revisedStatus}].`,
          'AUTHORIZED',
          'SUPER_ADMIN'
        );

        return { ...admin, status: revisedStatus };
      }
      return admin;
    }));
  };

  // Remove Admin Account
  const handleDeleteAdmin = (adminId: string, username: string) => {
    setAdmins(admins.filter(a => a.id !== adminId));

    const newLogId = `PRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newHistoryRecord: PrivilegeChange = {
      id: newLogId,
      timestamp: new Date().toISOString(),
      adminName: username,
      actionBy: 'Sovereign Super Admin',
      changeType: 'ACCOUNT_LOCKED',
      description: `Irrevocably deleted admin security profile from the directory. Keys recycled.`,
      affectedPermissions: []
    };

    setPrivilegeHistory(prev => [newHistoryRecord, ...prev]);

    addAuditLog(
      'ADMIN_ACCOUNT_DELETED',
      `Super Admin deleted admin profile: ${username} (ADM-ID: ${adminId}). Security credentials cancelled.`,
      'AUTHORIZED',
      'SUPER_ADMIN'
    );

    confetti({ particleCount: 20, colors: ['#ff0333', '#000000'] });
  };

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
      log.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

      {/* Dynamic Segmented Switcher for Operations vs Super Admin RBAC */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2.5 bg-stone-900 border border-stone-800 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#c19a6b]/5 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-2.5 px-3">
          <ShieldAlert className="w-4 h-4 text-[#c19a6b] animate-pulse" />
          <div className="font-mono text-left">
            <p className="text-[10px] text-[#c19a6b] font-bold tracking-widest uppercase">GOUVERNANCE SECURITY SHIELD</p>
            <p className="text-[9px] text-stone-400">AUTHORIZED ACCESS MODE ONLY</p>
          </div>
        </div>

        <div className="flex p-1 bg-black/80 rounded-2xl border border-stone-800 w-full sm:w-auto font-mono text-xs">
          <button
            onClick={() => setViewMode('standard')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 font-bold ${
              viewMode === 'standard'
                ? 'bg-[#c19a6b] text-stone-950 shadow-md shadow-[#c19a6b]/25 font-sans-luxury'
                : 'text-stone-300 hover:text-stone-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{language === 'FR' ? "Personnel & Simulateur" : language === 'RU' ? "Персонал и Имитатор" : "Operations & Simulator"}</span>
          </button>
          
          <button
            onClick={() => setViewMode('rbac')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 font-bold ${
              viewMode === 'rbac'
                ? 'bg-gradient-to-r from-[#c19a6b] to-[#dcba92] text-stone-950 shadow-md shadow-[#c19a6b]/35 font-sans-luxury'
                : 'text-stone-300 hover:text-stone-100'
            }`}
          >
            <UserCog className="w-3.5 h-3.5" />
            <span>⚔️ {language === 'FR' ? "Super Admin (RBAC)" : language === 'RU' ? "Супер Администратор" : "Super Admin (RBAC)"}</span>
          </button>
        </div>
      </div>

      {viewMode === 'rbac' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* LEFT PANEL: ADMINS LIST & STATUS + CREATION FORM */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            
            {/* ADMIN REGISTERED NODES CHASSIS */}
            <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[#c19a6b]/5 opacity-30 pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-black/5">
                <div>
                  <h3 className="text-xl font-serif-luxury text-slate-800 font-bold flex items-center gap-2">
                    🛡️ {trans.adminAccounts}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">{trans.superAdminDesc}</p>
                </div>
              </div>

              {/* Grid of Admin Accounts */}
              <div className="grid grid-cols-1 gap-4">
                {admins.map((adm) => (
                  <div
                    key={adm.id}
                    className={`p-5 rounded-2xl border transition-all duration-300 shadow-sm ${
                      adm.status === 'Locked'
                        ? 'bg-red-50/70 border-red-200 opacity-80'
                        : adm.status === 'Awaiting Activation'
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-white/60 border-white/80 hover:border-[#c19a6b]/60 hover:shadow-md'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-3.5 mb-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-[#c19a6b]/40 flex items-center justify-center text-[#c19a6b] font-mono text-sm font-bold shadow-inner">
                          {adm.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800">{adm.username}</h4>
                            <span className="text-[9px] font-mono text-slate-400 font-bold">({adm.id})</span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono">{adm.email}</p>
                        </div>
                      </div>

                      {/* Active Actions: Role selector and Status toggle */}
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded-xl border border-slate-200">
                          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold px-1">{language === 'FR' ? "RÔLE" : language === 'RU' ? "РОЛЬ" : "ROLE"}:</span>
                          <select
                            value={adm.assignedRole}
                            onChange={(e) => handleUpdateAdminRole(adm.id, e.target.value as any)}
                            className="bg-transparent border-0 font-sans-luxury font-bold text-xs text-[#7c5a30] focus:ring-0 p-0 pr-6 select-clean cursor-pointer"
                          >
                            <option value="Inventory Manager">📦 {trans.prmInventory}</option>
                            <option value="Financial Auditor">📊 {trans.prmAuditor}</option>
                            <option value="Security Officer">🛡️ {trans.prmSecurity}</option>
                            <option value="L5 Operations Chief">👑 L5 Operations Chief</option>
                            <option value="Super Admin">🔱 Super Admin</option>
                          </select>
                        </div>

                        {/* Status Toggle Button */}
                        <button
                          onClick={() => handleToggleAdminStatus(adm.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-mono text-[9.5px] font-bold transition-all duration-200 ${
                            adm.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/15'
                              : adm.status === 'Locked'
                                ? 'bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/15'
                                : 'bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/15'
                          }`}
                          title="Click to toggle account access state"
                        >
                          {adm.status === 'Active' ? (
                            <>
                              <Unlock className="w-3 h-3 text-emerald-600" />
                              <span>{adm.status.toUpperCase()}</span>
                            </>
                          ) : adm.status === 'Locked' ? (
                            <>
                              <Lock className="w-3 h-3 text-red-600" />
                              <span>{adm.status.toUpperCase()}</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                              <span>STANDBY</span>
                            </>
                          )}
                        </button>

                        {/* Irrevocable revoking of account */}
                        <button
                          onClick={() => handleDeleteAdmin(adm.id, adm.username)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all"
                          title="Revoke Admin Access Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Checkboxes Row */}
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                        🔑 {trans.adminPermissions} :
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { key: 'readLogs', label: language === 'FR' ? "Journaux" : language === 'RU' ? "Логи" : "Logs", icon: "📋" },
                          { key: 'modifyInventory', label: language === 'FR' ? "Inventaire" : "Inventory", icon: "📦" },
                          { key: 'approveBudgets', label: language === 'FR' ? "Budget" : "Budget", icon: "💰" },
                          { key: 'overrideFirewalls', label: language === 'FR' ? "Sécurité" : "Bypass", icon: "🔥" },
                          { key: 'decryptData', label: language === 'FR' ? "Fichiers" : "Decrypt", icon: "📂" },
                        ].map((p) => (
                          <label
                            key={p.key}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-xl cursor-pointer select-none transition text-[11px] font-mono ${
                              adm.permissions[p.key as keyof AdminAccount['permissions']]
                                ? 'bg-[#c19a6b]/15 text-[#7c5a30] border-[#c19a6b]/35 font-bold shadow-sm'
                                : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={adm.permissions[p.key as keyof AdminAccount['permissions']]}
                              onChange={() => handleToggleAdminPermission(adm.id, p.key as any)}
                              className="w-3 h-3 text-[#c19a6b] focus:ring-0 border-slate-300 rounded cursor-pointer"
                            />
                            <span>{p.icon}</span>
                            <span>{p.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PROVISION NEW ADMIN BOX */}
              <form onSubmit={handleCreateAdmin} className="mt-6 pt-6 border-t border-black/5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-gradient-to-br from-stone-900 to-slate-950 p-6 rounded-2xl border border-stone-800 text-stone-100">
                <div className="sm:col-span-12 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs uppercase font-mono tracking-widest text-[#c19a6b] font-bold">
                      ⚜️ {trans.createAdminTitle}
                    </h4>
                    <p className="text-[10px] text-stone-400 font-mono">Provision secondary nodes with custom privileges.</p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-[#c19a6b] animate-pulse" />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-stone-400">{trans.adminName}</label>
                  <input
                    type="text"
                    value={newAdminUser}
                    required
                    onChange={(e) => setNewAdminUser(e.target.value)}
                    placeholder="e.g. adrian.audits"
                    className="w-full p-2.5 text-xs text-stone-100 placeholder-stone-600 rounded-xl bg-black/60 border border-stone-800 focus:border-[#c19a6b] focus:ring-0 focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-stone-400">Agent Email Address</label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    required
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="agent@sapphir.academy"
                    className="w-full p-2.5 text-xs text-stone-100 placeholder-stone-600 rounded-xl bg-black/60 border border-stone-800 focus:border-[#c19a6b] focus:ring-0 focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-stone-400">Standard Template Profile</label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => handleRoleSelectPreset(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl bg-black/60 border border-stone-800 text-[#c19a6b] font-mono font-semibold focus:border-[#c19a6b] focus:ring-0 cursor-pointer"
                  >
                    <option value="Security Officer">🛡️ {trans.prmSecurity}</option>
                    <option value="Financial Auditor">📊 {trans.prmAuditor}</option>
                    <option value="Inventory Manager">📦 {trans.prmInventory}</option>
                    <option value="L5 Operations Chief">👑 L5 Operations Chief</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#c19a6b] hover:bg-[#a68054] text-[#0d0d0d] font-bold text-xs uppercase tracking-wider font-mono rounded-xl flex items-center justify-center gap-1 transition shadow active:scale-95"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>CREATE</span>
                  </button>
                </div>

                {/* Scope Preview in creation */}
                <div className="sm:col-span-12 bg-black/40 p-3 rounded-xl border border-stone-800/80 mt-2">
                  <p className="text-[9px] font-mono text-stone-400 uppercase font-bold mb-1.5 font-bold">INITIAL DOMAIN CLEARANCES:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
                    {[
                      { key: 'readLogs', label: 'Security Logs' },
                      { key: 'modifyInventory', label: 'Inventory Access' },
                      { key: 'approveBudgets', label: 'Budget Approval' },
                      { key: 'overrideFirewalls', label: 'Firewall Bypass' },
                      { key: 'decryptData', label: 'Data Decryption' },
                    ].map((p) => (
                      <div
                        key={p.key}
                        className={`px-2 py-1 rounded border flex items-center justify-between font-mono ${
                          newAdminPerms[p.key as keyof AdminAccount['permissions']]
                            ? 'bg-[#c19a6b]/10 text-[#c19a6b] border-[#c19a6b]/30'
                            : 'bg-stone-900/50 text-stone-600 border-transparent'
                        }`}
                      >
                        <span>{p.label}</span>
                        {newAdminPerms[p.key as keyof AdminAccount['permissions']] ? (
                          <span className="text-emerald-400 text-[8px] font-bold">▲ ON</span>
                        ) : (
                          <span className="text-stone-700 text-[8px]">▼ OFF</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </form>

            </div>
          </div>

          {/* RIGHT PANEL: PRIVILEGE AUDITING TIMELINE */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            
            <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl space-y-5">
              <div className="space-y-1">
                <span className="text-[8px] bg-[#c19a6b]/15 text-[#7c5a30] border border-[#c19a6b]/30 px-2.5 py-1 rounded font-mono font-bold uppercase tracking-widest leading-none">
                  SECURE COMPLIANCE LEDGER
                </span>
                <h3 className="text-lg font-serif-luxury text-slate-800 font-bold leading-tight mt-1">
                  {trans.historyTitle}
                </h3>
                <p className="text-xs text-slate-600">
                  {trans.historyDesc}
                </p>
              </div>

              {/* History Timeline */}
              <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
                {privilegeHistory.map((h) => {
                  const getColorsAndLabels = (type: PrivilegeChange['changeType']) => {
                    switch (type) {
                      case 'ACCOUNT_CREATED':
                        return { bg: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25', label: trans.actCreateAccount };
                      case 'ROLE_UPGRADED':
                        return { bg: 'bg-[#c19a6b]/20 text-[#7c5a30] border-[#c19a6b]/30', label: trans.actUpdatePerms };
                      case 'ACCOUNT_LOCKED':
                        return { bg: 'bg-red-500/10 text-red-800 border-red-500/25', label: "LOCKED" };
                      case 'ACCOUNT_UNLOCKED':
                        return { bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25', label: "UNLOCKED" };
                      case 'PERMISSION_GRANTED':
                        return { bg: 'bg-sky-500/10 text-sky-800 border-sky-500/25', label: "SCOPE ELEVATION" };
                      case 'PERMISSION_REVOKED':
                        return { bg: 'bg-amber-500/10 text-amber-800 border-amber-500/25', label: "SCOPE REVOCATION" };
                      default:
                        return { bg: 'bg-slate-500/10 text-slate-800 border-slate-500/25', label: "ALTERATION" };
                    }
                  };

                  const meta = getColorsAndLabels(h.changeType);
                  return (
                    <div
                      key={h.id}
                      className="p-3 bg-white/45 border border-slate-200 rounded-xl space-y-2 relative transition hover:bg-white/60"
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${meta.bg}`}>
                          {meta.label}
                        </span>
                        <div className="flex items-center gap-1 text-[9.5px] font-mono text-slate-400">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-slate-800 leading-normal font-medium">
                          {h.description}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono tracking-tight">
                          Agent Subject: <span className="font-bold text-slate-700">@{h.adminName}</span> | Sovereign Verified: <span className="text-[#7c5a30] font-bold">YES</span>
                        </p>
                      </div>

                      {h.affectedPermissions && h.affectedPermissions.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-dashed border-black/5">
                          <span className="text-[8.5px] font-mono text-slate-400 uppercase font-bold py-0.5 mr-1">{trans.assignedPerms}:</span>
                          {h.affectedPermissions.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-[8px] font-mono font-semibold bg-slate-900 text-[#c19a6b] border border-stone-800 px-1.5 py-0.2 rounded"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Secure fingerprint anchor */}
                      <span className="absolute bottom-2 right-3 text-[8px] font-mono text-slate-300 pointer-events-none select-none uppercase font-bold">
                        {h.id} // SEC_BLOCK
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 bg-stone-900 border border-stone-800 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#c19a6b] shrink-0 animate-pulse" />
                <div className="font-mono text-[9px] text-stone-400 leading-tight">
                  <p className="text-stone-200 font-bold">MUTUAL CRYPTOGRAPHIC SIGNING ACTIVE</p>
                  <p>Changes are securely linked to SHA-256 blocks and permanently anchor on-chain.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
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
      </div>
    )}

        {/* FULL-WIDTH SECURITY FORENSIC CONSOLE LOGS */}
        <div className="w-full premium-border-glow rounded-3xl p-6 bg-slate-950/90 border-2 border-stone-900 text-stone-100 shadow-[0_0_20px_rgba(193,154,107,0.4)] relative overflow-hidden mt-6">
          
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
                      <td className="p-3 text-slate-300 max-w-lg font-mono tracking-tight leading-normal" title={log.reason}>
                        {log.reason}
                        <span className="block text-[8px] text-slate-500 mt-0.5 font-mono">Timestamp: {log.timestamp}</span>
                      </td>
                      <td className="p-3 pr-4 text-right font-mono text-stone-500 text-[10px] select-all uppercase">
                        {log.hash.slice(0, 20)}...
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
  );
};
