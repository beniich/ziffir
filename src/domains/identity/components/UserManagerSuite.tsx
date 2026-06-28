import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  Hotel, 
  Mail, 
  RefreshCw, 
  Sliders, 
  CheckCircle,
  Edit2,
  Eye,
  Calendar,
  Clock,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db, handleFirestoreError, OperationType } from '../../../firebase';
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc
} from 'firebase/firestore';

interface UserHistoryItem {
  timestamp: string;
  label: string;
  details: string;
  badge: string;
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'administrateur' | 'client' | 'hotel';
  status: 'Active' | 'Suspended' | 'Inactive';
  createdAt: string;
  departmentOrCompany?: string;
  lastActivity?: string;
  customHistory?: UserHistoryItem[];
}

interface UserManagerSuiteProps {
  language: 'EN' | 'FR' | 'RU';
  addAuditLog: (
    action: string, 
    reason: string, 
    status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT', 
    roleStr?: string
  ) => void;
  sessionRole: 'administrateur' | 'client' | 'hotel';
}

const DEFAULT_USERS: UserAccount[] = [
  { 
    id: 'usr-001', 
    name: 'Jean-Pierre Laurent', 
    email: 'jp.laurent@zafir.academy', 
    role: 'administrateur', 
    status: 'Active', 
    createdAt: '2026-06-15T09:30:00Z', 
    departmentOrCompany: 'Operations Headquarters',
    lastActivity: '2026-06-22T07:15:00Z',
    customHistory: [
      { timestamp: '2026-06-22T07:15:00Z', label: 'Rotation des clés AES-256', details: 'A renouvelé les jetons cryptographiques de la Chambre Forte avec succès.', badge: 'SÉCURITÉ' },
      { timestamp: '2026-06-21T18:30:00Z', label: 'Audit des comptes d\'accès', details: 'A inspecté la liste des comptes d\'accès et suspendu le compte de Viktor Kael.', badge: 'AUDIT' },
      { timestamp: '2026-06-20T10:00:00Z', label: 'Restauration système', details: 'A validé la correspondance de la base locale avec le cloud Firebase.', badge: 'SYNC' }
    ]
  },
  { 
    id: 'usr-002', 
    name: 'Alice Smith', 
    email: 'alice.v@premium.com', 
    role: 'client', 
    status: 'Active', 
    createdAt: '2026-06-18T14:20:00Z', 
    departmentOrCompany: 'Elite Membership',
    lastActivity: '2026-06-22T06:50:00Z',
    customHistory: [
      { timestamp: '2026-06-22T06:50:00Z', label: 'Commande Room Service', details: 'A commandé un assortiment de caviar Imperial Beluga et champagne Hennessy.', badge: 'COMMERCE' },
      { timestamp: '2026-06-21T15:20:00Z', label: 'Paiement Prestige', details: 'A soldé son grand livre de dépenses d\'un montant de 1,200 EUR.', badge: 'FINANCE' },
      { timestamp: '2026-06-18T14:30:00Z', label: 'Remboursement cautions', details: 'Virement de caution de sécurité vérifié sur le compte Elite.', badge: 'VIP' }
    ]
  },
  { 
    id: 'usr-003', 
    name: 'Marcus Sterling', 
    email: 'm.sterling@sapphir.academy', 
    role: 'hotel', 
    status: 'Active', 
    createdAt: '2026-06-20T11:05:00Z', 
    departmentOrCompany: 'Front Desk Office',
    lastActivity: '2026-06-22T06:10:00Z',
    customHistory: [
      { timestamp: '2026-06-22T06:10:00Z', label: 'Enregistrement de bagages', details: 'A attribué des clés RFID physiques à la Suite Présidentielle Royale.', badge: 'LOGISTIQUE' },
      { timestamp: '2026-06-21T12:00:00Z', label: 'Vérification vols privés', details: 'A validé l\'arrivée imminente du vol d\'affaires S-891.', badge: 'ARRIVÉES' },
      { timestamp: '2026-06-20T11:15:00Z', label: 'Changement de poste d\'accueil', details: 'Prise de fonction sur la console de contrôle Prestige.', badge: 'STATION' }
    ]
  },
  { 
    id: 'usr-004', 
    name: 'Elena Petrova', 
    email: 'e.petrova@zafir.academy', 
    role: 'administrateur', 
    status: 'Active', 
    createdAt: '2026-06-10T08:00:00Z', 
    departmentOrCompany: 'Registry Commandant',
    lastActivity: '2026-06-22T04:20:00Z',
    customHistory: [
      { timestamp: '2026-06-22T04:20:00Z', label: 'Inspection globale', details: 'Exécution d\'un diagnostic complet du réseau des capteurs d\'éclairage.', badge: 'SYSTÈME' },
      { timestamp: '2026-06-21T14:00:00Z', label: 'Modification tarification', details: 'Mise à jour des tarifs séculiers de la suite thématique d\'accueil.', badge: 'RÉSEAU' }
    ]
  },
  { 
    id: 'usr-005', 
    name: 'Viktor Kael', 
    email: 'v.kael@sapphir.academy', 
    role: 'hotel', 
    status: 'Suspended', 
    createdAt: '2026-06-21T16:45:00Z', 
    departmentOrCompany: 'Security Services',
    lastActivity: '2026-06-21T18:00:00Z',
    customHistory: [
      { timestamp: '2026-06-21T18:00:00Z', label: 'Échec d\'authentification', details: '3 essais erronés détectés. Accès au noeud de synchronisation bloqué par l\'admin.', badge: 'ALERTE' },
      { timestamp: '2026-06-21T16:50:00Z', label: 'Initialisation de badge', details: 'Enregistrement de l\'empreinte sur le lecteur d\'habilitation 4A.', badge: 'SÉCURITÉ' }
    ]
  }
];

const i18n = {
  EN: {
    title: "User Management Suite",
    subtitle: "Configure accounts, assign roles, and administer permissions for system operators, clients, and hotel staff.",
    totalUsers: "Total Registered Users",
    adminUsers: "Administrators",
    clientUsers: "Clients / VIPs",
    hotelUsers: "Hotel Operators",
    searchPlaceholder: "Search users by name, email, or company...",
    filterAll: "All Roles",
    addUserBtn: "Add New System Node",
    roleLabel: "User Authority Role",
    statusLabel: "Account Status",
    nameLabel: "Full User Name",
    emailLabel: "Secured Email Address",
    corpLabel: "Department / Association Label",
    saveUserBtn: "Provision Access Node",
    deleteConfirm: "Are you sure you want to delete this user?",
    authRequired: "Elevated access level or local authorization required to view logs.",
    permissionMatrix: "Decentralized Access Boundary Map",
    matrixHeading: "Authority Mapping Matrix",
    matrixDesc: "Verify which structural areas are unlocked under your current session.",
    areaName: "System Jurisdiction Sector",
    unlockedFor: "Credentials Unlock State",
    actions: "Oversight Actions",
    statusActive: "Active Node",
    statusSuspended: "Suspended / Offline",
    statusInactive: "Pending Activation",
    successAdded: "Successfully provisioned user node!",
    successDeleted: "User credentials successfully revoked.",
    successUpdated: "System role/status updated successfully.",
    syncCloudBtn: "Synchronize Cloud Registry",
    syncSuccess: "Bidirectional cloud synchronization complete."
  },
  FR: {
    title: "Gestionnaire Privilégié des Utilisateurs",
    subtitle: "Configurez les comptes de gouvernance, attribuez les rôles et administrez les autorisations d'accès.",
    totalUsers: "Total des Utilisateurs",
    adminUsers: "Administrateurs",
    clientUsers: "Clients / Membres VIP",
    hotelUsers: "Opérateurs Hôtel",
    searchPlaceholder: "Rechercher par nom, adresse e-mail ou entité...",
    filterAll: "Tous les Rôles",
    addUserBtn: "Ajouter un Nouvel Utilisateur",
    roleLabel: "Rôle d'Autorité",
    statusLabel: "Statut du Compte",
    nameLabel: "Nom Complet de l'Utilisateur",
    emailLabel: "Adresse E-mail Sécurisée",
    corpLabel: "Département ou Organisation",
    saveUserBtn: "Déployer le Compte d'Accès",
    deleteConfirm: "Êtes-vous certain de vouloir révoquer cet utilisateur ?",
    authRequired: "Accès de niveau supérieur requis pour inspecter les privilèges.",
    permissionMatrix: "Matrice Synoptique des Habilitations",
    matrixHeading: "Droits Systèmes Validés",
    matrixDesc: "Vérifiez quels secteurs et fonctions sont déverrouillés sous votre identité actuelle.",
    areaName: "Secteur de Juridiction",
    unlockedFor: "État de Déverrouillage",
    actions: "Commandes de Supervision",
    statusActive: "Nœud Actif",
    statusSuspended: "Suspendu / Hors-ligne",
    statusInactive: "En Attente de Clés",
    successAdded: "Nœud d'utilisateur enregistré avec succès !",
    successDeleted: "Les accès système de l'utilisateur ont été révoqués.",
    successUpdated: "Le rôle ou le statut de l'utilisateur a été mis à jour.",
    syncCloudBtn: "Synchroniser le Registre Cloud",
    syncSuccess: "La synchronisation avec la base cloud Firestore est terminée."
  },
  RU: {
    title: "Менеджер Учетных Записей",
    subtitle: "Конфигурируйте учетные записи, назначайте роли и управляйте разрешениями администраторов, клиентов и персонала.",
    totalUsers: "Всего Пользователей",
    adminUsers: "Администраторы",
    clientUsers: "Клиенты / VIP",
    hotelUsers: "Персонал Отеля",
    searchPlaceholder: "Поиск пользователей по имени, почте или отделу...",
    filterAll: "Все Роли",
    addUserBtn: "Добавить Нового Пользователя",
    roleLabel: "Назначенная Роль",
    statusLabel: "Статус доступа",
    nameLabel: "Полное Имя Пользователя",
    emailLabel: "Электронный Адрес",
    corpLabel: "Департамент / Ассоциация",
    saveUserBtn: "Зарегистрировать Допуск",
    deleteConfirm: "Вы уверены, что хотите аннулировать этого пользователя?",
    authRequired: "Требуются повышенные права для инспекции.",
    permissionMatrix: "Децентрализованная Матрица Прав",
    matrixHeading: "Контроль Допуска",
    matrixDesc: "Разрешенные разделы системы под вашим текущим доступом.",
    areaName: "Сектор Системы",
    unlockedFor: "Разрешен Вход",
    actions: "Контроль Операций",
    statusActive: "Активен",
    statusSuspended: "Заблокирован",
    statusInactive: "Ожидает ключа",
    successAdded: "Пользователь успешно зарегистрирован!",
    successDeleted: "Полномочия пользователя аннулированы.",
    successUpdated: "Статус пользователя успешно обновлен.",
    syncCloudBtn: "Синхронизировать Облако",
    syncSuccess: "Синхронизация с облаком Firestore успешно завершена."
  }
};

export const UserManagerSuite: React.FC<UserManagerSuiteProps> = ({
  language,
  addAuditLog,
  sessionRole
}) => {
  const trans = i18n[language] || i18n.EN;

  // React State for user management
  const [userList, setUserList] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('zafir_users_registry');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'administrateur' | 'client' | 'hotel'>('all');
  const [loading, setLoading] = useState(false);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'administrateur' | 'client' | 'hotel'>('client');
  const [newStatus, setNewStatus] = useState<'Active' | 'Suspended' | 'Inactive'>('Active');
  const [newDept, setNewDept] = useState('');

  // Editing states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<'administrateur' | 'client' | 'hotel'>('client');
  const [editStatus, setEditStatus] = useState<'Active' | 'Suspended' | 'Inactive'>('Active');

  // Modal edit states
  const [selectedUserForModal, setSelectedUserForModal] = useState<UserAccount | null>(null);
  const [modalRole, setModalRole] = useState<'administrateur' | 'client' | 'hotel'>('client');

  // Details Modal state
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserAccount | null>(null);

  // Save from Modal
  const handleSaveModalRole = async () => {
    if (!selectedUserForModal) return;
    setLoading(true);
    const userId = selectedUserForModal.id;
    try {
      const updatedUser: UserAccount = {
        ...selectedUserForModal,
        role: modalRole
      };

      await setDoc(doc(db, 'users', userId), {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
        departmentOrCompany: updatedUser.departmentOrCompany || ''
      });

      const updatedList = userList.map(u => u.id === userId ? updatedUser : u);
      updateLocalAndStateList(updatedList);

      addAuditLog(
        'USER_ROLE_MUTATED_MODAL',
        `Updated role for ${selectedUserForModal.name} (ID: ${userId}) via quick modal to [${modalRole.toUpperCase()}].`,
        'AUTHORIZED',
        sessionRole.toUpperCase()
      );

      setSelectedUserForModal(null);
      confetti({ particleCount: 40, colors: ['#c19a6b', '#10b981', '#ffffff'] });
    } catch (err) {
      console.error(err);
      // Fallback
      const updatedUser: UserAccount = {
        ...selectedUserForModal,
        role: modalRole
      };
      const updatedList = userList.map(u => u.id === userId ? updatedUser : u);
      updateLocalAndStateList(updatedList);
      setSelectedUserForModal(null);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Firestore list loading on boot
  useEffect(() => {
    fetchUsersFromFirestore();
  }, []);

  // Save changes to localStorage helper
  const updateLocalAndStateList = (list: UserAccount[]) => {
    setUserList(list);
    localStorage.setItem('zafir_users_registry', JSON.stringify(list));
  };

  // Helper to extract creation, relative/absolute last active and procedural histories
  const getUserDetails = (user: UserAccount) => {
    const defaultCreation = user.createdAt || new Date().toISOString();
    
    // Parse clean date
    const formatDate = (isoStr: string) => {
      try {
        const d = new Date(isoStr);
        return d.toLocaleDateString(language === 'FR' ? 'fr-FR' : language === 'RU' ? 'ru-RU' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return isoStr;
      }
    };

    const creationStr = formatDate(defaultCreation);

    // Generate a realistic last activity
    let lastActiveStr = "";
    if (user.lastActivity) {
      lastActiveStr = formatDate(user.lastActivity);
    } else {
      // Generate one slightly after creation, or default to some hours ago
      const cTime = new Date(defaultCreation).getTime();
      const actTime = cTime + (1000 * 60 * 60 * 2.5); // + 2.5 hours
      const maxPoss = Date.now() - (1000 * 60 * 15); // max is 15 mins ago or actual time
      const finalTime = Math.min(actTime, maxPoss);
      lastActiveStr = formatDate(new Date(finalTime).toISOString());
    }

    // Get action history elements
    let history = user.customHistory || [];
    if (history.length === 0) {
      // Generate procedurally based on role!
      if (user.role === 'administrateur') {
        history = [
          {
            timestamp: new Date(new Date(defaultCreation).getTime() + (1000 * 60 * 5)).toISOString(),
            label: language === 'FR' ? 'Initialisation Systémique' : 'System Initialisation',
            details: 'Core security keys generated and root ledger synchronized with Google Cloud Service.',
            badge: 'SYS_BOOT'
          },
          {
            timestamp: new Date(new Date(defaultCreation).getTime() + (1000 * 60 * 60 * 2)).toISOString(),
            label: language === 'FR' ? 'Sécurité Réseau Audit' : 'Clearance Inspection',
            details: 'Audited active sessions and checked credentials integrity across active nodes.',
            badge: 'SECURITY'
          },
          {
            timestamp: new Date(new Date(defaultCreation).getTime() + (1000 * 60 * 60 * 4)).toISOString(),
            label: language === 'FR' ? 'Configuration Privilège' : 'Privilege Alteration',
            details: 'Modified permissions for service adapters and certified local database encryption keys.',
            badge: 'MUTATION'
          }
        ];
      } else if (user.role === 'hotel') {
        history = [
          {
            timestamp: new Date(new Date(defaultCreation).getTime() + (1000 * 60 * 10)).toISOString(),
            label: language === 'FR' ? 'Enregistrement de Garde' : 'Checked In On Duty',
            details: 'Clocked in at front hospitality reception desk. Standard clearance activated.',
            badge: 'DUTY_ON'
          },
          {
            timestamp: new Date(new Date(defaultCreation).getTime() + (1000 * 60 * 60 * 1.5)).toISOString(),
            label: language === 'FR' ? 'Mise à jour d\'Ordre' : 'Room Service Logs Reposited',
            details: 'Updated room logs for incoming clients and set status codes to APPROVED.',
            badge: 'OPERATION'
          },
          {
            timestamp: new Date(new Date(defaultCreation).getTime() + (1000 * 60 * 60 * 3)).toISOString(),
            label: language === 'FR' ? 'Supervision de Panne' : 'Report Facility Ticket',
            details: 'Logged standard maintenance request for room HVAC filter exchange.',
            badge: 'SUPPORT'
          }
        ];
      } else {
        history = [
          {
            timestamp: new Date(new Date(defaultCreation).getTime() + (1000 * 60 * 12)).toISOString(),
            label: language === 'FR' ? 'Activation Profil VIP' : 'Elite Node Activation',
            details: 'Account profile linked to luxury tier subscription privileges.',
            badge: 'WELCOME'
          },
          {
            timestamp: new Date(new Date(defaultCreation).getTime() + (1000 * 60 * 60 * 1)).toISOString(),
            label: language === 'FR' ? 'Transaction Enregistrée' : 'Room Service Request Locked',
            details: 'Ordered selected luxury room delivery services utilizing active vault wallet.',
            badge: 'TRANSACTION'
          },
          {
            timestamp: new Date(new Date(defaultCreation).getTime() + (1000 * 60 * 60 * 2.5)).toISOString(),
            label: language === 'FR' ? 'Ajustement de Profil' : 'Preferences Modified',
            details: 'Updated flight arrivals preferences and customized notification matrix.',
            badge: 'USER_PREF'
          }
        ];
      }
    }

    return {
      creationStr,
      lastActiveStr,
      history
    };
  };

  // Fetch from Firestore
  const fetchUsersFromFirestore = async () => {
    setLoading(true);
    const path = 'users';
    try {
      const snap = await getDocs(collection(db, path));
      if (!snap.empty) {
        const cloudUsers: UserAccount[] = [];
        snap.forEach(doc => {
          cloudUsers.push({ id: doc.id, ...doc.data() } as UserAccount);
        });
        updateLocalAndStateList(cloudUsers);
      } else {
        // Seed initial default users into firestore if collection is brand new or empty
        for (const user of DEFAULT_USERS) {
          await setDoc(doc(db, path, user.id), {
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            departmentOrCompany: user.departmentOrCompany || ''
          });
        }
        updateLocalAndStateList(DEFAULT_USERS);
      }
    } catch (err) {
      console.warn("Using offline storage for users mapping:", err);
    } finally {
      setLoading(false);
    }
  };

  // Synchronize Cloud Registry (Firestore DB)
  const handleCloudSync = async () => {
    setLoading(true);
    const path = 'users';
    try {
      // Dump local changes back to cloud
      for (const user of userList) {
        await setDoc(doc(db, path, user.id), {
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          departmentOrCompany: user.departmentOrCompany || ''
        });
      }
      
      // Reload matching cloud data
      await fetchUsersFromFirestore();
      
      addAuditLog(
        'USER_REGISTRY_CLOUD_SYNC',
        `Initiated cryptographic synchronization of user accounts with Firestore cluster. Loaded ${userList.length} verified sessions.`,
        'AUTHORIZED',
        sessionRole.toUpperCase()
      );

      confetti({
        particleCount: 50,
        spread: 60,
        colors: ['#c19a6b', '#10b981', '#ffffff']
      });

      alert(trans.syncSuccess);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setLoading(false);
    }
  };

  // Provision New User
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    setLoading(true);
    const userId = `usr-${Math.floor(100 + Math.random() * 900)}`;
    const newUser: UserAccount = {
      id: userId,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      status: newStatus,
      createdAt: new Date().toISOString(),
      departmentOrCompany: newDept.trim() || 'Zafir Guest Network'
    };

    try {
      // Put to Firestore
      await setDoc(doc(db, 'users', userId), {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt,
        departmentOrCompany: newUser.departmentOrCompany
      });

      const updatedList = [newUser, ...userList];
      updateLocalAndStateList(updatedList);

      addAuditLog(
        'USER_NODE_PROVISIONED',
        `Provisioned credentials node: ${newUser.name} as role [${newUser.role.toUpperCase()}] status: ${newUser.status}.`,
        'AUTHORIZED',
        sessionRole.toUpperCase()
      );

      // Reset Form
      setNewName('');
      setNewEmail('');
      setNewDept('');
      setShowAddForm(false);

      confetti({
        particleCount: 40,
        spread: 45,
        colors: ['#c19a6b', '#ffffff']
      });
    } catch (err) {
      console.error(err);
      // Fallback local persistence if network block is active
      const updatedList = [newUser, ...userList];
      updateLocalAndStateList(updatedList);
    } finally {
      setLoading(false);
    }
  };

  // Revoke / Delete user
  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(trans.deleteConfirm)) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'users', id));
      
      const updatedList = userList.filter(u => u.id !== id);
      updateLocalAndStateList(updatedList);

      addAuditLog(
        'USER_NODE_REVOKED',
        `Permanent revocation of credentials keys for account handle: ${name} (ID: ${id}). Cleaned security logs database.`,
        'AUTHORIZED',
        sessionRole.toUpperCase()
      );

      confetti({ particleCount: 20, colors: ['#f43f5e', '#ef4444'] });
    } catch (err) {
      console.warn("Deleted locally:", err);
      const updatedList = userList.filter(u => u.id !== id);
      updateLocalAndStateList(updatedList);
    } finally {
      setLoading(false);
    }
  };

  // Modify existing user
  const handleUpdateUserSave = async (id: string) => {
    const original = userList.find(u => u.id === id);
    if (!original) return;

    setLoading(true);
    try {
      const updatedUser: UserAccount = {
        ...original,
        role: editRole,
        status: editStatus
      };

      await setDoc(doc(db, 'users', id), {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
        departmentOrCompany: updatedUser.departmentOrCompany || ''
      });

      const updatedList = userList.map(u => u.id === id ? updatedUser : u);
      updateLocalAndStateList(updatedList);

      addAuditLog(
        'USER_NODE_MUTATED',
        `Recalibrated authorities for ${original.name} (ID: ${id}): Role -> [${editRole.toUpperCase()}], Status -> [${editStatus.toUpperCase()}].`,
        'AUTHORIZED',
        sessionRole.toUpperCase()
      );

      setEditingUserId(null);
      confetti({ particleCount: 30, colors: ['#c19a6b', '#ffffff'] });
    } catch (err) {
      console.error(err);
      // Fallback
      const updatedUser: UserAccount = {
        ...original,
        role: editRole,
        status: editStatus
      };
      const updatedList = userList.map(u => u.id === id ? updatedUser : u);
      updateLocalAndStateList(updatedList);
      setEditingUserId(null);
    } finally {
      setLoading(false);
    }
  };

  // Active statistics counters
  const sumAdmins = userList.filter(u => u.role === 'administrateur').length;
  const sumClients = userList.filter(u => u.role === 'client').length;
  const sumHotels = userList.filter(u => u.role === 'hotel').length;

  const filteredUsers = userList.filter(u => {
    const textQuery = searchQuery.trim().toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(textQuery) || 
                        u.email.toLowerCase().includes(textQuery) ||
                        (u.departmentOrCompany && u.departmentOrCompany.toLowerCase().includes(textQuery));
    
    const matchRole = roleFilter === 'all' || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  // Permissions boundaries logic based on role connected
  const areaClearanceMap = [
    { sector: "General Arrivals & Flight Check", admin: true, hotel: true, client: true, desc: "Welcome dashboard & en route VIP statuses" },
    { sector: "Room Service Preparation & Chef Deck", admin: true, hotel: true, client: false, desc: "Order pipeline and status escalation triggers" },
    { sector: "Environmental Suit Controls (HVAC / Luminosity)", admin: true, hotel: true, client: true, desc: "Smart-thermostats & crystal glass opacity modifiers" },
    { sector: "Decentralized Channel Syncer & Price Parity", admin: true, hotel: false, client: false, desc: "Global OTA price indexes & Booking.com distribution nodes" },
    { sector: "Underground Vault Operations & Ledger Decryption", admin: true, hotel: false, client: false, desc: "Decryption of Class V Acquisition Agreements" },
    { sector: "SaaS Enterprise Billing Profiles", admin: true, hotel: true, client: false, desc: "Invoices tracking, credits, and subscription keys" },
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="user-manager-suite">
      
      {/* Upper Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#c19a6b]/20 flex items-center justify-center text-[#7c5a30] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">{trans.totalUsers}</p>
            <p className="text-xl font-bold font-mono text-slate-800">{userList.length}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#c19a6b]/15 flex items-center justify-center text-[#7c5a30] shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">{trans.adminUsers}</p>
            <p className="text-xl font-bold font-mono text-slate-800">{sumAdmins}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#c19a6b]/15 flex items-center justify-center text-[#7c5a30] shrink-0">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">{trans.clientUsers}</p>
            <p className="text-xl font-bold font-mono text-slate-800">{sumClients}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#c19a6b]/15 flex items-center justify-center text-[#7c5a30] shrink-0">
            <Hotel className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">{trans.hotelUsers}</p>
            <p className="text-xl font-bold font-mono text-slate-800">{sumHotels}</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Directory and Matrice */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* User registry directory box */}
        <div className="xl:col-span-8 space-y-6">
          <div className="glass-panel p-5 sm:p-6 rounded-3xl bg-white/50 border border-white/70 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[#c19a6b]/5 opacity-20 pointer-events-none" />
            
            {sessionRole !== 'administrateur' && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-600/30 text-[#7c5a30] text-xs shadow-xs animate-fade-in font-sans">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600 border border-amber-300 font-bold text-sm">
                    ⚠️
                  </div>
                  <div>
                    <h5 className="font-bold text-[#7c5a30] leading-none mb-1">
                      {language === 'FR' ? 'Mode Lecture Seule' : language === 'RU' ? 'Режим Чтения' : 'Read-Only Clearance Mode'}
                    </h5>
                    <p className="text-[11px] leading-relaxed text-slate-600 mt-1.5 font-medium">
                      {language === 'FR' 
                        ? `Votre profil de session simulé est "${sessionRole.toUpperCase()}". Seuls les utilisateurs habilités en tant qu' "ADMINISTRATEUR" possèdent les privilèges d'écriture pour ajouter, supprimer ou altérer des clés d'accès applicatives.`
                        : language === 'RU'
                          ? `Ваш текущий профиль сессии: "${sessionRole.toUpperCase()}". Только администраторы имеют право регистрировать, удалять или редактировать доступы пользователей.`
                          : `The active cognitive session is authenticated as "${sessionRole.toUpperCase()}". Registry modification and role mutations are strictly reserved for accounts authorized under "ADMINISTRATEUR" clearance.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-black/5 pb-4">
              <div>
                <h3 className="text-lg font-serif-luxury text-slate-800 font-bold flex items-center gap-2">
                  💼 {trans.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{trans.subtitle}</p>
              </div>

              {/* Dynamic Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCloudSync}
                  disabled={loading || sessionRole !== 'administrateur'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#c19a6b]/40 bg-white/80 hover:bg-[#c19a6b]/10 text-stone-800 font-mono text-[10px] uppercase font-bold tracking-wider transition shadow-xs ${
                    sessionRole !== 'administrateur' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  title="Synchronise direct active variables to Google Cloud database backend"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#c19a6b] ${loading ? 'animate-spin' : ''}`} />
                  <span>{trans.syncCloudBtn}</span>
                </button>
                <button
                  onClick={() => {
                    if (sessionRole === 'administrateur') {
                      setShowAddForm(!showAddForm);
                    }
                  }}
                  disabled={sessionRole !== 'administrateur'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-stone-100 font-mono text-[10px] uppercase font-bold tracking-wider transition shadow-sm ${
                    sessionRole !== 'administrateur' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#c19a6b]" />
                  <span>{trans.addUserBtn}</span>
                </button>
              </div>
            </div>

            {/* Quick Add User Node Form */}
            {showAddForm && (
              <form onSubmit={handleAddUserSubmit} className="bg-slate-950/95 border-2 border-[#c19a6b]/45 rounded-2xl p-5 mb-6 text-stone-100 space-y-4 shadow-lg animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <h4 className="text-xs font-mono font-bold text-[#c19a6b] uppercase flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" /> {language === 'FR' ? "ENRÔLER NOUVEL OUTIL D'ACCÈS" : "PROVISION NEW ACCESS SEGMENT"}
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="text-stone-400 hover:text-white font-mono text-xs uppercase"
                  >
                    [{language === 'FR' ? "Fermer" : "Close"}]
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">{trans.nameLabel}</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Marc Laurent"
                      required
                      className="w-full bg-black/80 border border-stone-800 rounded-xl p-2.5 text-xs text-white focus:border-[#c19a6b] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">{trans.emailLabel}</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. jp.laurent@zafir.academy"
                      required
                      className="w-full bg-black/80 border border-stone-800 rounded-xl p-2.5 text-xs text-white focus:border-[#c19a6b] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">{trans.corpLabel}</label>
                    <input
                      type="text"
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      placeholder="e.g. Imperial Hospitality S.A."
                      className="w-full bg-black/80 border border-stone-800 rounded-xl p-2.5 text-xs text-white focus:border-[#c19a6b] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">{trans.roleLabel}</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full bg-black/80 border border-stone-800 rounded-xl p-2.5 text-xs text-white focus:border-[#c19a6b] outline-none cursor-pointer"
                    >
                      <option value="administrateur">🛡️ Administrateur</option>
                      <option value="client">👤 Client VIP</option>
                      <option value="hotel">🏨 Hôtel / Staff</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">{trans.statusLabel}</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full bg-black/80 border border-stone-800 rounded-xl p-2.5 text-xs text-white focus:border-[#c19a6b] outline-none cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#c19a6b] hover:bg-white text-slate-950 font-mono text-xs uppercase font-bold tracking-widest rounded-xl transition shadow-md"
                  >
                    {trans.saveUserBtn}
                  </button>
                </div>
              </form>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={trans.searchPlaceholder}
                  className="w-full bg-white/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#c19a6b] outline-none text-slate-800 shadow-inner"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pr-1">
                {[
                  { id: 'all', label: trans.filterAll },
                  { id: 'administrateur', label: 'Admin' },
                  { id: 'client', label: 'Client' },
                  { id: 'hotel', label: 'Hotel' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setRoleFilter(item.id as any)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase whitespace-nowrap transition cursor-pointer border ${
                      roleFilter === item.id 
                        ? 'bg-slate-900 border-slate-950 text-white shadow-xs' 
                        : 'bg-white/80 border-slate-200 text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Users grid list */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-black/5 text-[#7c5a30] font-mono text-[10px] tracking-widest uppercase">
                    <th className="py-3 px-2">User / Email</th>
                    <th className="py-3 px-2">Role</th>
                    <th className="py-3 px-2">Department</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-mono text-[11px]">
                        No matching user nodes registered on this network.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const isEditing = editingUserId === user.id;

                      return (
                        <tr key={user.id} className="hover:bg-amber-50/20 transition-all">
                          <td className="py-3.5 px-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#c19a6b]/20 border border-[#c19a6b]/40 flex items-center justify-center text-[#7c5a30] font-bold text-xs">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                              <div>
                                <h5 className="font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                  <span>{user.name}</span>
                                  <span className="text-[9px] font-mono text-slate-400">({user.id})</span>
                                </h5>
                                <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 sm:gap-1.5 leading-none">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{user.email}</span>
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-2 font-mono">
                            {isEditing ? (
                              <select
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value as any)}
                                className="bg-white/90 border border-slate-300 rounded px-1.5 py-1 text-[11px] cursor-pointer"
                              >
                                <option value="administrateur">administrateur</option>
                                <option value="client">client</option>
                                <option value="hotel">hotel</option>
                              </select>
                            ) : (
                              <>
                                {user.role === 'administrateur' && (
                                  <span key={`role-${user.id}-${user.role}-${roleFilter}-${searchQuery}`} className="animate-badge-pop inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold bg-amber-500/15 text-amber-700 border border-amber-500/35 shadow-xs dark:bg-amber-500/20 dark:text-amber-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    <span>🛡️ {language === 'FR' ? 'Administrateur' : language === 'RU' ? 'Администратор' : 'Administrator'}</span>
                                  </span>
                                )}
                                {user.role === 'client' && (
                                  <span key={`role-${user.id}-${user.role}-${roleFilter}-${searchQuery}`} className="animate-badge-pop inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/35 shadow-xs dark:bg-emerald-500/20 dark:text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span>👤 {language === 'FR' ? 'Client' : language === 'RU' ? 'Клиент' : 'Client'}</span>
                                  </span>
                                )}
                                {user.role === 'hotel' && (
                                  <span key={`role-${user.id}-${user.role}-${roleFilter}-${searchQuery}`} className="animate-badge-pop inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold bg-indigo-500/15 text-indigo-700 border border-indigo-500/35 shadow-xs dark:bg-indigo-500/20 dark:text-indigo-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    <span>🏨 {language === 'FR' ? 'Hôtel' : language === 'RU' ? 'Отель' : 'Hotel'}</span>
                                  </span>
                                )}
                              </>
                            )}
                          </td>

                          <td className="py-3.5 px-2 text-slate-500">
                            {user.departmentOrCompany || 'Guest Services'}
                          </td>

                          <td className="py-3.5 px-2">
                            {isEditing ? (
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as any)}
                                className="bg-white/90 border border-slate-300 rounded px-1.5 py-1 text-[11px] cursor-pointer animate-fade-in"
                              >
                                <option value="Active">Active</option>
                                <option value="Suspended">Suspended</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            ) : (
                              <span key={`status-${user.id}-${user.status}-${roleFilter}-${searchQuery}`} className={`animate-badge-pop inline-flex items-center gap-1 text-[10px] font-semibold ${
                                user.status === 'Active' 
                                  ? 'text-emerald-600' 
                                  : user.status === 'Suspended' 
                                    ? 'text-rose-500 animate-pulse' 
                                    : 'text-stone-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : user.status === 'Suspended' ? 'bg-rose-500' : 'bg-stone-400'}`} />
                                {user.status === 'Active' ? trans.statusActive : user.status === 'Suspended' ? trans.statusSuspended : trans.statusInactive}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-2 text-right">
                            <div className="flex items-center justify-end gap-1 px-1">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateUserSave(user.id)}
                                    className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-mono text-[10px] font-bold uppercase transition"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingUserId(null)}
                                    className="p-1 px-2 bg-stone-200 hover:bg-stone-300 text-stone-600 rounded font-mono text-[10px] font-bold uppercase transition"
                                  >
                                    X
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setSelectedUserForDetails(user)}
                                    className="p-1 px-2 border border-slate-200 hover:border-[#c19a6b] hover:bg-[#c19a6b]/10 text-slate-600 hover:text-[#7c5a30] rounded-xl font-mono text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                                    title={language === 'FR' ? "Afficher les Détails" : "Show Details"}
                                  >
                                    <Eye className="w-3.5 h-3.5 text-stone-500" />
                                    <span>{language === 'FR' ? 'Détails' : language === 'RU' ? 'Детали' : 'Details'}</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (sessionRole === 'administrateur') {
                                        setSelectedUserForModal(user);
                                        setModalRole(user.role);
                                      }
                                    }}
                                    disabled={sessionRole !== 'administrateur'}
                                    className={`p-1 px-2.5 border border-slate-200 rounded-xl font-mono text-[10px] font-bold uppercase transition flex items-center gap-1 ${
                                      sessionRole !== 'administrateur' 
                                        ? 'opacity-40 cursor-not-allowed text-stone-400' 
                                        : 'hover:border-[#c19a6b] hover:bg-[#c19a6b]/10 text-slate-600 hover:text-[#7c5a30] cursor-pointer'
                                    }`}
                                    title="Edit User Role"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-[#7c5a30]" />
                                    <span>{language === 'FR' ? 'Rôle' : 'Role'}</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (sessionRole === 'administrateur') {
                                        handleDeleteUser(user.id, user.name);
                                      }
                                    }}
                                    disabled={sessionRole !== 'administrateur'}
                                    className={`p-1 rounded-xl transition ${
                                      sessionRole !== 'administrateur'
                                        ? 'opacity-40 cursor-not-allowed text-stone-400'
                                        : 'text-rose-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                                    }`}
                                    title="Revoke Node Access"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right Panel: Permission Mapping Matrix depending on active sessionRole */}
        <div className="xl:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-3xl bg-white/50 border border-white/70 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[#c19a6b]/5 opacity-20 pointer-events-none" />
            
            <div className="flex items-center gap-3.5 pb-4 border-b border-black/5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-600/30 flex items-center justify-center text-amber-600 shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="font-mono text-left">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{trans.permissionMatrix}</h4>
                <p className="text-[9px] text-[#7c5a30] font-bold uppercase tracking-widest">{trans.matrixHeading}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-sans">
              {trans.matrixDesc}
            </p>

            <div className="bg-slate-900 border-2 border-stone-850 p-4 rounded-2xl text-stone-100 font-mono text-[10px] space-y-1.5 shadow-inner mb-4">
              <p className="text-[#c19a6b] font-bold">// CURRENT COGNITIVE SESSION IDENTITY:</p>
              <p>ACCOUNT_ROLE: <span className="text-amber-500 font-bold uppercase">{sessionRole}</span></p>
              <p>SECTOR_TOKEN: <span className="text-emerald-400">{sessionRole === 'administrateur' ? 'L5_SOVEREIGN_ADMIN_ACTIVE' : sessionRole === 'hotel' ? 'L4_HOTEL_STAFF_NODE' : 'L2_VIP_CLIENT_ACCESS'}</span></p>
            </div>

            <div className="space-y-3 font-sans">
              {areaClearanceMap.map((area, i) => {
                const isUnlocked = 
                  (sessionRole === 'administrateur' && area.admin) ||
                  (sessionRole === 'hotel' && area.hotel) ||
                  (sessionRole === 'client' && area.client);

                return (
                  <div 
                    key={i}
                    className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                      isUnlocked 
                        ? 'bg-emerald-50/40 border-emerald-200/50 text-slate-800 shadow-xs' 
                        : 'bg-stone-50 border-stone-200 text-stone-400 opacity-60'
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-xs leading-none mb-1">{area.sector}</h4>
                      <p className="text-[10px] text-stone-400 leading-none">{area.desc}</p>
                    </div>

                    <div className="shrink-0">
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase text-stone-400 bg-stone-100 px-2 py-0.5 rounded border border-stone-300">
                          <ShieldAlert className="w-3 h-3 text-stone-400" /> Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* ROLE EDIT MODAL COGNITIVE OVERLAY */}
      {selectedUserForModal && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in" id="role-edit-modal">
          <div className="bg-white rounded-3xl border-2 border-[#c19a6b]/80 shadow-2xl w-full max-w-md p-6 relative overflow-hidden animate-scale-up">
            <div className="absolute inset-0 bg-[#c19a6b]/5 opacity-25 pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-4">
              <h4 className="font-serif-luxury font-bold text-base text-slate-800 flex items-center gap-2">
                🛡️ {language === 'FR' ? 'Modifier le Rôle de Sécurité' : language === 'RU' ? 'Изменить роль' : 'Modify Security Role'}
              </h4>
              <button 
                type="button"
                onClick={() => setSelectedUserForModal(null)}
                className="text-slate-400 hover:text-slate-700 font-mono text-xs uppercase p-1 cursor-pointer"
              >
                [X]
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#c19a6b]/20 flex items-center justify-center text-[#7c5a30] font-bold text-sm">
                    {selectedUserForModal.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm leading-none">{selectedUserForModal.name}</h5>
                    <p className="text-xs text-slate-400 font-mono mt-1 leading-none">{selectedUserForModal.email}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1.5 leading-none">
                      Department: <span className="text-[#7c5a30] font-bold">{selectedUserForModal.departmentOrCompany || 'Guest Services'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                  {language === 'FR' ? 'Sélectionner le Nouveau Rôle' : 'Select New Assigned Role'}
                </label>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { id: 'administrateur', title: 'Administrateur 🛡️', desc: 'Sovereign authority with access clearance to Vault & Pricing modules.' },
                    { id: 'client', title: 'Client / VIP 👤', desc: 'Secure customer profiles with access to luxury room services.' },
                    { id: 'hotel', title: 'Hôtel / Staff 🏨', desc: 'General operations clearance for check ins and hospitality metrics.' }
                  ].map(roleOpt => (
                    <button
                      key={roleOpt.id}
                      type="button"
                      onClick={() => setModalRole(roleOpt.id as any)}
                      className={`p-3 rounded-xl text-left border transition-all duration-200 flex flex-col cursor-pointer ${
                        modalRole === roleOpt.id
                          ? 'bg-slate-900 border-slate-950 text-white shadow-md'
                          : 'bg-stone-50/50 border-stone-200 text-slate-755 hover:bg-stone-50 hover:text-slate-900 text-slate-700'
                      }`}
                    >
                      <span className="font-bold text-xs">{roleOpt.title}</span>
                      <span className={`text-[10px] mt-1 leading-snug ${modalRole === roleOpt.id ? 'text-slate-300' : 'text-slate-400'}`}>
                        {roleOpt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-black/5">
              <button
                type="button"
                onClick={() => setSelectedUserForModal(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition uppercase font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModalRole}
                disabled={loading}
                className="py-2.5 px-4 bg-[#c19a6b] hover:bg-slate-900 hover:text-white text-white font-bold rounded-xl text-xs transition uppercase font-mono shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAILS SHEET COGNITIVE OVERLAY */}
      {selectedUserForDetails && (() => {
        const details = getUserDetails(selectedUserForDetails);
        const isFr = language === 'FR';
        const isRu = language === 'RU';

        const creationLabel = isFr ? "Date de création" : isRu ? "Дата создания" : "Created At";
        const lastActiveLabel = isFr ? "Dernière activité" : isRu ? "Последняя активность" : "Last Activity";
        const deptLabel = isFr ? "Division / Département" : isRu ? "Департамент / Отдел" : "Jurisdiction Division";
        const statusLabel = isFr ? "Statut du Nœud" : isRu ? "Статус ноды" : "Node Status";
        const historyLabel = isFr ? "Historique des Actions" : isRu ? "История операций" : "Action Audit Chronicles";
        const closeBtn = isFr ? "Fermer les Détails" : isRu ? "Закрыть детали" : "Close Chronicles";

        return (
          <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in" id="user-details-modal">
            <div className="bg-white rounded-3xl border-2 border-[#c19a6b] shadow-2xl w-full max-w-xl p-6 md:p-7 relative overflow-hidden animate-scale-up text-left">
              <div className="absolute inset-0 bg-[#c19a6b]/5 opacity-25 pointer-events-none" />
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-5">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#c19a6b]/20 text-[#7c5a30] flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-[#c19a6b]/30 shrink-0">
                    {selectedUserForDetails.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="truncate">
                    <h4 className="font-serif-luxury font-bold text-base text-slate-800 leading-snug truncate">
                      {selectedUserForDetails.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono leading-none mt-1 truncate">{selectedUserForDetails.email}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedUserForDetails(null)}
                  className="text-slate-400 hover:text-slate-700 font-mono text-xs uppercase p-1.5 hover:bg-slate-50 rounded-lg transition-all cursor-pointer select-none shrink-0"
                >
                  [X]
                </button>
              </div>

              {/* Content body */}
              <div className="space-y-5">
                {/* Top Info Cards Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3 bg-stone-50 border border-stone-200/60 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#7c5a30] font-bold block flex items-center gap-1 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-[#c19a6b]" />
                      {creationLabel}
                    </span>
                    <p className="text-xs font-bold text-slate-700 font-sans leading-none">{details.creationStr}</p>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200/60 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#7c5a30] font-bold block flex items-center gap-1 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-[#c19a6b]" />
                      {lastActiveLabel}
                    </span>
                    <p className="text-xs font-bold text-slate-700 font-sans leading-none">{details.lastActiveStr}</p>
                  </div>
                </div>

                {/* Department & Status Section */}
                <div className="grid grid-cols-2 gap-3.5 border-t border-black/5 pt-4">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                      {deptLabel}
                    </span>
                    <p className="text-xs font-semibold text-slate-600 font-sans mt-0.5">
                      {selectedUserForDetails.departmentOrCompany || 'Guest Services'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                      {statusLabel}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold mt-1 ${
                      selectedUserForDetails.status === 'Active' 
                        ? 'text-emerald-600' 
                        : selectedUserForDetails.status === 'Suspended' 
                          ? 'text-rose-500 animate-pulse' 
                          : 'text-stone-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedUserForDetails.status === 'Active' ? 'bg-emerald-500' : selectedUserForDetails.status === 'Suspended' ? 'bg-rose-500' : 'bg-stone-400'}`} />
                      {selectedUserForDetails.status === 'Active' ? trans.statusActive : selectedUserForDetails.status === 'Suspended' ? trans.statusSuspended : trans.statusInactive}
                    </span>
                  </div>
                </div>

                {/* Action History Timeline */}
                <div className="space-y-3 pt-3 border-t border-black/5">
                  <h5 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#c19a6b]" />
                    <span>{historyLabel}</span>
                  </h5>

                  <div className="relative border-l border-stone-200 ml-2 pl-4 py-1 space-y-4 max-h-[180px] overflow-y-auto pr-1">
                    {details.history.map((hist, idx) => {
                      let formattedTime = hist.timestamp;
                      try {
                        formattedTime = new Date(hist.timestamp).toLocaleTimeString(language === 'FR' ? 'fr-FR' : language === 'RU' ? 'ru-RU' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) + ' — ' + new Date(hist.timestamp).toLocaleDateString(language === 'FR' ? 'fr-FR' : language === 'RU' ? 'ru-RU' : 'en-US', {
                          month: 'short',
                          day: 'numeric'
                        });
                      } catch {}

                      return (
                        <div key={idx} className="relative group">
                          {/* Ring Bullet */}
                          <div className="absolute -left-[21.5px] top-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#c19a6b] shadow-xs group-hover:bg-[#c19a6b] transition-colors animate-none" />
                          
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2.5">
                              <span className="font-bold text-xs text-slate-700 leading-snug">{hist.label}</span>
                              <span className="text-[8px] font-mono font-bold bg-[#c19a6b]/10 text-[#7c5a30] px-1.5 py-0.5 rounded border border-[#c19a6b]/20 shrink-0">
                                {hist.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-sans leading-relaxed">{hist.details}</p>
                            <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 text-stone-300 animate-none shrink-0" />
                              {formattedTime}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="mt-6 pt-4 border-t border-black/5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedUserForDetails(null)}
                  className="py-2.5 px-5 bg-slate-900 hover:bg-[#c19a6b] hover:text-white text-white font-bold rounded-xl text-xs transition uppercase font-mono shadow-md cursor-pointer flex items-center gap-1.5 select-none"
                >
                  <span>{closeBtn}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
