import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Settings, 
  RefreshCw, 
  Link2, 
  CheckCircle, 
  AlertTriangle, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  LogOut, 
  User, 
  Eye, 
  HelpCircle,
  Save,
  Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  firestoreService,
  registerWithEmail,
  loginWithEmail
} from '../firebase';
import { sheetsService } from '../sheetsService';
import { User as FirebaseUser } from 'firebase/auth';

interface SettingsTabProps {
  language: 'EN' | 'FR' | 'RU';
  addAuditLog: (
    action: string, 
    reason: string, 
    status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT', 
    roleStr?: string
  ) => void;
  vipGuests: any[];
  setVipGuests: React.Dispatch<React.SetStateAction<any[]>>;
  roomOrders: any[];
  auditLogs: any[];
}

const translations = {
  EN: {
    title: "Integration & Synchronization Hub",
    description: "Map your Imperial Hotel data with Google Sheets, and leverage Firestore cloud persistence to preserve system records.",
    authGroup: "Google OAuth Credentials",
    authDesc: "Sign in with your Google account on the Zafir gateway to unlock Drive and Sheets capabilities.",
    notConnected: "Gateway Disconnected",
    connectedAs: "Connected as",
    signInBtn: "Connect Google Account",
    signOutBtn: "Revoke Access Token",
    firebaseGroup: "Firestore Cloud Engine",
    firebaseDesc: "Live persistence state on the tonal-legacy network. Preserves credentials and config.",
    settingsSaved: "Parameters successfully committed to Firestore kernel.",
    saveBtn: "Save Configurations",
    sheetsGroup: "Spreadsheet Target Identification",
    sheetsDesc: "Identify and configure your primary tracking sheet. Save the coordinates to Firebase settings.",
    manuallyEnterId: "Target Spreadsheet ID",
    manuallyEnterIdPlaceholder: "Enter 44-character spreadsheet ID...",
    sheetRangeLabel: "Active Sheet Tab Range",
    autoCreateBtn: "Auto-Provision New Google Sheet",
    verifyConnectionBtn: "Test Sheet Connection",
    syncSection: "Bidirectional Data Sync Console",
    syncDesc: "Trigger dynamic sync routines to load or dump structural data from/to your connected spreadsheet.",
    exportGuests: "Export Guests to Sheet",
    importGuests: "Import Guests from Sheet",
    exportOrders: "Export Room Service to Sheet",
    exportLogs: "Export Audit Logs to Sheet",
    syncSuccess: "Sync operation successful",
    writeSuccess: "Successfully wrote records to sheet",
    sheetLiveUrlLabel: "Active Spreadsheet Link",
    statusUnknown: "Unknown",
    statusVerifying: "Verifying...",
    statusSuccess: "Active & Synced",
    statusFailed: "Connection Failed",
    noSheetTitle: "Please provide a valid spreadsheet ID first.",
    emailAuthTab: "Email Credentials",
    googleAuthTab: "Google Account",
    emailInputLabel: "Secure Email Address (must contain digits)",
    passwordInputLabel: "Access Password",
    displayNameLabel: "Human Display Name",
    registerBtn: "Register Verified Credentials",
    loginBtn: "Authorize & Sign In",
    errorEmailDigits: "The system requires at least one number/digit (0-9) inside the email for registry authorization.",
    successRegister: "Account registration request accepted and synced!",
    successLogin: "Credentials session approved and authorized!",
    noAccountYet: "Don't have credentials? Request Registration",
    alreadyConnectedBtn: "Already have credentials? Back to Sign In"
  },
  FR: {
    title: "Centre d'Intégration et Paramètres Synchronisés",
    description: "Associez les indicateurs de l'Académie Saphir avec Google Sheets, et synchronisez vos données de gestion avec le cloud Firestore.",
    authGroup: "Acréditations Google OAuth // Identification",
    authDesc: "Identifiez-vous sur la passerelle Zafir pour autoriser l'accès en lecture/écriture à vos fichiers Drive et Tableaux.",
    notConnected: "Passerelle Hors Ligne",
    connectedAs: "Authentifié comme",
    signInBtn: "S'identifier avec Google",
    signOutBtn: "Résilier la Clé Administrative",
    firebaseGroup: "Moteur Cloud Firestore",
    firebaseDesc: "Sauvegarde automatique de l'état système sur la base sécurisée du projet tonal-legacy.",
    settingsSaved: "Paramètres d'identification enregistrés dans la base Firestore.",
    saveBtn: "Enregistrer la Configuration",
    sheetsGroup: "Identification de la Feuille Spreadsheet",
    sheetsDesc: "Saisissez les paramètres de votre feuille Google Sheets ou provisionnez-en une automatiquement.",
    manuallyEnterId: "Identifiant du Spreadsheet Cible (ID)",
    manuallyEnterIdPlaceholder: "Saisissez l'ID de 44 caractères du fichier...",
    sheetRangeLabel: "Plage / Onglet Actif",
    autoCreateBtn: "Créer un Nouveau Google Sheet",
    verifyConnectionBtn: "Tester l'Identification du Fichier",
    syncSection: "Console de Synchronisation Bidirectionnelle",
    syncDesc: "Transférez vos listes de clients, commandes et journaux forensiques d'audit vers votre feuille de calcul.",
    exportGuests: "Exporter Clients vers Sheet",
    importGuests: "Importer Clients depuis Sheet",
    exportOrders: "Exporter Commandes Cuisine",
    exportLogs: "Exporter Journal Forensique",
    syncSuccess: "Opération de synchronisation réussie",
    writeSuccess: "Données écrites dans votre feuille active",
    sheetLiveUrlLabel: "Lien Direct Google Sheets",
    statusUnknown: "Non Vérifié",
    statusVerifying: "Vérification de l'ID...",
    statusSuccess: "Fichier Connecté & Actif",
    statusFailed: "Échec de Connexion",
    noSheetTitle: "Veuillez configurer un identifiant de Spreadsheet valide.",
    emailAuthTab: "Identifiants E-mail",
    googleAuthTab: "Compte Google",
    emailInputLabel: "Adresse E-mail Sécurisée (doit contenir des chiffres)",
    passwordInputLabel: "Mot de passe d'accès",
    displayNameLabel: "Nom d'affichage humain",
    registerBtn: "Valider l'Enregistrement",
    loginBtn: "S'identifier & Ouvrir Session",
    errorEmailDigits: "Le système requiert au moins un chiffre (0-9) dans l'e-mail pour l'autorisation et validation de la demande d'abonnement.",
    successRegister: "Demande d'enregistrement approuvée et synchronisée !",
    successLogin: "Session d'accès approuvée et autorisée !",
    noAccountYet: "Pas d'identifiants ? S'enregistrer ici",
    alreadyConnectedBtn: "Déjà enregistré ? Retour à la Connexion"
  },
  RU: {
    title: "Параметры Интеграции Sheets & Firebase",
    description: "Интегрируйте данные отеля с Google Таблицами и используйте базу Firestore для надежного облачного сохранения.",
    authGroup: "Идентификация Google OAuth",
    authDesc: "Авторизуйтесь через Google для предоставления приложению прав работы с Диском и Таблицами.",
    notConnected: "Учетная запись не подключена",
    connectedAs: "Подключен как",
    signInBtn: "Войти через Google",
    signOutBtn: "Отключить сессию",
    firebaseGroup: "Облачный движок Firestore",
    firebaseDesc: "Хранение настроек синхронизации на облачном ядре проекта tonal-legacy.",
    settingsSaved: "Параметры успешно зафиксированы в базе данных Firestore.",
    saveBtn: "Сохранить Настройки",
    sheetsGroup: "Идентификация Google Таблицы",
    sheetsDesc: "Укажите ID вашей таблицы или создайте абсолютно новую таблицу в один клик.",
    manuallyEnterId: "Уникальный ID таблицы Google Sheets",
    manuallyEnterIdPlaceholder: "Введите 44-значный системный ID файла...",
    sheetRangeLabel: "Активный лист / Диапазон",
    autoCreateBtn: "Создать Новую Таблицу в Диске",
    verifyConnectionBtn: "Проверить Подключение к Таблице",
    syncSection: "Панель Двусторонней Синхронизации",
    syncDesc: "Мгновенно импортируйте или экспортируйте списки гостей, заказы и системные отчеты.",
    exportGuests: "Экспорт гостей в Таблицу",
    importGuests: "Импорт гостей из Таблицы",
    exportOrders: "Экспорт заказов еды",
    exportLogs: "Экспорт Лога Аудита",
    syncSuccess: "Синхронизация успешно выполнена",
    writeSuccess: "Записи успешно зафиксированы в таблице",
    sheetLiveUrlLabel: "Полноправная ссылка на файл",
    statusUnknown: "Не проверено",
    statusVerifying: "Проверка подлинности...",
    statusSuccess: "Связь Установлена",
    statusFailed: "Ошибка подключения",
    noSheetTitle: "Сначала укажите действительный ID таблицы.",
    emailAuthTab: "Вход по Email",
    googleAuthTab: "Аккаунт Google",
    emailInputLabel: "Адрес электронной почты (должен содержать цифры)",
    passwordInputLabel: "Пароль доступа",
    displayNameLabel: "Имя (никнейм)",
    registerBtn: "Зарегистрировать профиль",
    loginBtn: "Авторизоваться и войти",
    errorEmailDigits: "Для авторизации в системе Email должен содержать хотя бы одну цифру (0-9).",
    successRegister: "Запрос на регистрацию одобрен и синхронизирован!",
    successLogin: "Сессия успешно подтверждена и авторизована!",
    noAccountYet: "Нет учетных данных? Регистрация здесь",
    alreadyConnectedBtn: "Уже зарегистрированы? Войти в профиль"
  }
};

export const SettingsTab: React.FC<SettingsTabProps> = ({
  language,
  addAuditLog,
  vipGuests,
  setVipGuests,
  roomOrders,
  auditLogs
}) => {
  const trans = translations[language] || translations.EN;

  // Firebase auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [oauthToken, setOauthToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Email and Password Auth States
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Sheets configuration variables (connected to state & stored in Firestore!)
  const [sheetId, setSheetId] = useState('');
  const [sheetName, setSheetName] = useState('VIP Guests');
  const [liveSync, setLiveSync] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Synchronization feedback states
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'verifying' | 'success' | 'failed'>('unknown');
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState<string | null>(null);

  // Load existing parameters from Firestore on mount
  useEffect(() => {
    // 1. Listen for Auth states
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setOauthToken(token);
        setAuthLoading(false);
      },
      () => {
        setCurrentUser(null);
        setOauthToken(null);
        setAuthLoading(false);
      }
    );

    // 2. Load Firestore mapping configs
    const loadConfigAndCheck = async () => {
      try {
        const saved = await firestoreService.getConfig();
        if (saved) {
          setSheetId(saved.sheetId || '');
          setSheetName(saved.sheetName || 'VIP Guests');
          setLiveSync(saved.liveSync ?? true);
        }
      } catch (err) {
        console.warn("Couldn't pull settings config from Cloud store yet: ", err);
      }
    };
    loadConfigAndCheck();

    return () => unsubscribe();
  }, []);

  // Format link
  const spreadsheetUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit` : null;

  // Sign in with Google Popup
  const handleGoogleAuth = async () => {
    try {
      setAuthLoading(true);
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setOauthToken(res.accessToken);
        confetti({ particleCount: 30, colors: ['#c19a6b', '#10b981'] });
        addAuditLog(
          'GOOGLE_OAUTH_LOGIN',
          `Administrator successfully verified and established Google API tokens session: ${res.user.email}`,
          'AUTHORIZED'
        );
      }
    } catch (err: any) {
      console.error(err);
      addAuditLog('GOOGLE_OAUTH_FAILED', `OAuth handshake failure: ${err.message}`, 'RESTRICTED_ATTEMPT');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    
    if (!email || !password) {
      setAuthError("Please fill out all required fields.");
      return;
    }

    // Email containing digits check
    const hasDigits = /\d/.test(email);
    if (!hasDigits) {
      setAuthError(trans.errorEmailDigits || "Email must contain numbers.");
      addAuditLog(
        'EMAIL_AUTH_BLOCKED',
        `Access rejected: Email connection [${email}] lacks mandatory digit compliance credentials.`,
        'RESTRICTED_ATTEMPT'
      );
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        const user = await registerWithEmail(email, password, displayName || email.split('@')[0]);
        setCurrentUser(user);
        setAuthSuccess(trans.successRegister);
        confetti({ particleCount: 45, colors: ['#c19a6b', '#10b981'] });
        addAuditLog(
          'EMAIL_REGISTER_SUCCESS',
          `Successfully registered new administrative credential workspace for: ${user.email}`,
          'AUTHORIZED'
        );
      } else {
        const user = await loginWithEmail(email, password);
        setCurrentUser(user);
        setAuthSuccess(trans.successLogin);
        confetti({ particleCount: 45, colors: ['#c19a6b', '#10b981'] });
        addAuditLog(
          'EMAIL_LOGIN_SUCCESS',
          `Session approved and connected securely for: ${user.email}`,
          'AUTHORIZED'
        );
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "Authentication failed.");
      addAuditLog(
        'EMAIL_AUTH_FAILED',
        `E-mail connection authentication failure for [${email}]: ${err.message}`,
        'RESTRICTED_ATTEMPT'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setOauthToken(null);
      addAuditLog('GOOGLE_OAUTH_LOGOUT', 'Administrator signed out and recycled Google access tokens.', 'AUTHORIZED');
    } catch (err) {
      console.error(err);
    }
  };

  // Keep configs saved globally to Firestore
  const handleSaveParameters = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await firestoreService.saveConfig({ sheetId, sheetName, liveSync });
      confetti({ particleCount: 15, spread: 30 });
      addAuditLog(
        'SYNC_CONFIG_COMMITTED',
        `Committed Google Sheets target ID [${sheetId.slice(0, 8)}...] and tab [${sheetName}] to persistent Firestore kernel.`,
        'AUTHORIZED'
      );
      alert(trans.settingsSaved);
    } catch (err: any) {
      console.error(err);
      alert(`Error saving credentials: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  // Create a brand new Google Spreadsheet dynamically!
  const handleProvisionNewSheet = async () => {
    if (!oauthToken) {
      alert("Please sign in with Google first!");
      return;
    }

    setSyncLoading('provision');
    try {
      const result = await sheetsService.createSpreadsheet(oauthToken, "Zafir Prestige Management Ledger V3");
      setSheetId(result.spreadsheetId);
      setSheetName("VIP Guests");
      setConnectionStatus('success');
      setConnectionMessage("Google Sheet newly provisioned and ready!");
      
      // Save directly to firestore
      await firestoreService.saveConfig({
        sheetId: result.spreadsheetId,
        sheetName: "VIP Guests",
        liveSync
      });

      confetti({ particleCount: 50, spread: 60 });
      addAuditLog(
        'SHEET_AUTO_PROVISIONED',
        `Created target hotel ledger: ${result.spreadsheetId}`,
        'AUTHORIZED'
      );
    } catch (err: any) {
      console.error(err);
      alert(`Provisioning failed: ${err.message}`);
    } finally {
      setSyncLoading(null);
    }
  };

  // Verify spreadsheet availability
  const handleVerifySpreadsheet = async () => {
    if (!sheetId.trim()) {
      alert(trans.noSheetTitle);
      return;
    }
    if (!oauthToken) {
      alert("Please authenticate with Google first.");
      return;
    }

    setConnectionStatus('verifying');
    setConnectionMessage(null);

    try {
      const meta = await sheetsService.getSpreadsheetMetadata(sheetId.trim(), oauthToken);
      setConnectionStatus('success');
      setConnectionMessage(`Successfully verified "${meta.properties.title}" with sheets: ${meta.sheets.map(s => s.properties.title).join(', ')}`);
      
      confetti({ particleCount: 20 });
      addAuditLog(
        'SHEET_VERIFICATION_PASS',
        `Successfully handshake verified spreadsheet ID: ${sheetId}`,
        'AUTHORIZED'
      );
    } catch (err: any) {
      setConnectionStatus('failed');
      setConnectionMessage(err.message);
      addAuditLog(
        'SHEET_VERIFICATION_FAIL',
        `Failed spreadsheet identification verification: ${err.message}`,
        'RESTRICTED_ATTEMPT'
      );
    }
  };

  // --- Sync functions ---

  // Sync Option 1: Export Guests list (VipGuests)
  const handleExportGuests = async () => {
    if (!sheetId || !oauthToken) return;
    const confirmed = window.confirm(
      language === 'FR' 
        ? "Êtes-vous sûr de vouloir remplacer les données des clients sur votre Google Sheet ?" 
        : "Overwrite Google Sheet 'VIP Guests' data rows with the live application data?"
    );
    if (!confirmed) return;

    setSyncLoading('exportGuests');
    try {
      // 1D headers
      const headers = ["ID REF", "Full Name", "Suite Assigned", "Service Level", "Total Spend ($)", "Status", "Check-in Date"];
      // Convert Array of objects to 2D values
      const bodyRows = vipGuests.map(g => [
        g.id,
        g.name,
        g.suite || g.room || '',
        g.serviceLevel || 'VIP',
        g.totalSpend || g.spend || 0,
        g.status || 'Checked-In',
        g.checkInDate || new Date().toISOString().split('T')[0]
      ]);

      const values = [headers, ...bodyRows];

      // Write values to 'VIP Guests' tab (Range 'VIP Guests!A1:G100')
      await sheetsService.writeValues(sheetId, "VIP Guests!A1:G100", values, oauthToken);
      
      confetti({ particleCount: 35 });
      alert(trans.writeSuccess);
      addAuditLog(
        'SHEETS_GUESTS_EXPORTED',
        `Successfully synchronized and exported ${vipGuests.length} guests to sheet tab 'VIP Guests'.`,
        'AUTHORIZED'
      );
    } catch (err: any) {
      console.error(err);
      alert(`Synchronizing failed: ${err.message}`);
    } finally {
      setSyncLoading(null);
    }
  };

  // Sync Option 2: Import Guests
  const handleImportGuests = async () => {
    if (!sheetId || !oauthToken) return;

    setSyncLoading('importGuests');
    try {
      const rows = await sheetsService.readValues(sheetId, "VIP Guests!A2:G100", oauthToken);
      if (!rows || rows.length === 0) {
        alert("No guest rows found in spreadsheet range (VIP Guests!A2:G100). Please export first.");
        return;
      }

      // Convert 2D arrays back into Guest objects
      const imported = rows.map((r, i) => ({
        id: r[0] || `GST-IMP${100 + i}`,
        name: r[1] || 'Unknown Client',
        suite: r[2] || 'Unassigned',
        room: r[2] || 'Unassigned',
        serviceLevel: r[3] || 'VIP',
        totalSpend: Number(r[4] || 0),
        status: r[5] || 'Checked-In',
        checkInDate: r[6] || new Date().toISOString().split('T')[0]
      }));

      setVipGuests(imported);
      confetti({ particleCount: 40, colors: ['#c19a6b'] });
      alert(`${trans.syncSuccess}: Loaded ${imported.length} VIP guest profiles.`);
      addAuditLog(
        'SHEETS_GUESTS_IMPORTED',
        `Successfully loaded ${imported.length} guests records asynchronously from spreadsheet.`,
        'AUTHORIZED'
      );
    } catch (err: any) {
      console.error(err);
      alert(`Import failed: ${err.message}`);
    } finally {
      setSyncLoading(null);
    }
  };

  // Sync Option 3: Export Room Service orders
  const handleExportOrders = async () => {
    if (!sheetId || !oauthToken) return;
    const confirmed = window.confirm("Export and overwrite all gastronomic kitchen orders to sheets tab 'Room Service Orders'?");
    if (!confirmed) return;

    setSyncLoading('exportOrders');
    try {
      const headers = ["Order ID", "Guest Name", "Suite / Room", "Details / Gastronomy", "Current Status"];
      const bodyRows = roomOrders.map(o => [
        o.id,
        o.guest,
        o.room,
        o.details,
        o.status
      ]);

      await sheetsService.writeValues(sheetId, "Room Service Orders!A1:E100", [headers, ...bodyRows], oauthToken);
      
      confetti({ particleCount: 30 });
      alert(trans.writeSuccess);
      addAuditLog(
        'SHEETS_ORDERS_EXPORTED',
        `Successfully uploaded ${roomOrders.length} service gastronomy culinary items to 'Room Service Orders' tab.`,
        'AUTHORIZED'
      );
    } catch (err: any) {
      console.error(err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setSyncLoading(null);
    }
  };

  // Sync Option 4: Export Audit Logs / forensics
  const handleExportLogs = async () => {
    if (!sheetId || !oauthToken) return;
    const confirmed = window.confirm("Export full system digital forensic micro-ledgers to 'Audit Logs' sheet tab?");
    if (!confirmed) return;

    setSyncLoading('exportLogs');
    try {
      const headers = ["Log ID", "UTC Timestamp", "Action Node", "Reason", "Security Status", "Role Access"];
      const bodyRows = auditLogs.map(l => [
        l.id || l.blockHash || '',
        l.timestamp || '',
        l.action || '',
        l.reason || '',
        l.status || '',
        l.role || ''
      ]);

      await sheetsService.writeValues(sheetId, "Audit Logs!A1:F500", [headers, ...bodyRows], oauthToken);
      
      confetti({ particleCount: 35 });
      alert(trans.writeSuccess);
      addAuditLog(
        'SHEETS_FORENSIC_LOGS_EXPORTED',
        `Exported full forensic blockchain stack details to 'Audit Logs' spreadsheet tab successfully.`,
        'AUTHORIZED'
      );
    } catch (err: any) {
      console.error(err);
      alert(`Logs Export failed: ${err.message}`);
    } finally {
      setSyncLoading(null);
    }
  };

  return (
    <div className="space-y-6" id="settings-tab">
      
      {/* Intro Header */}
      <div className="glass-panel p-6 rounded-3xl bg-[#0f0f12]/40 border border-white/10 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-[#c19a6b]/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#c19a6b]/20 border border-[#c19a6b]/30 flex items-center justify-center text-[#c19a6b]">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-2xl font-serif-luxury font-bold text-slate-100">{trans.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{trans.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COMPILER: GOOGLE AUTHORIZATION CREDENTIALS */}
        <div className="space-y-6">
          
          <div className="glass-panel p-6 rounded-3xl bg-[#0e0e11]/50 border border-white/10 shadow-lg relative">
            <h3 className="text-lg font-serif-luxury text-slate-100 font-bold flex items-center gap-2 mb-1.5">
              🔑 {trans.authGroup}
            </h3>
            <p className="text-xs text-slate-400 mb-6">{trans.authDesc}</p>

            {authLoading ? (
              <div className="p-4 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-[#c19a6b] animate-spin" />
              </div>
            ) : currentUser ? (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="user avatar" className="w-full h-full rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-widest">{trans.statusSuccess}</p>
                    <p className="text-sm font-bold text-slate-100">{currentUser.displayName || currentUser.email}</p>
                    <p className="text-[10px] text-slate-400 font-mono tracking-tight">{currentUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-200 text-xs font-mono font-bold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{trans.signOutBtn}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* Tab Switcher */}
                <div className="flex border-b border-white/10 mb-4 p-1 bg-black/30 rounded-xl">
                  <button
                    onClick={() => { setAuthMethod('email'); setAuthError(null); setAuthSuccess(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                      authMethod === 'email'
                        ? 'bg-[#c19a6b]/20 text-[#c19a6b] border border-[#c19a6b]/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>{trans.emailAuthTab}</span>
                  </button>
                  <button
                    onClick={() => { setAuthMethod('google'); setAuthError(null); setAuthSuccess(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                      authMethod === 'google'
                        ? 'bg-[#c19a6b]/20 text-[#c19a6b] border border-[#c19a6b]/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.745-.08-1.32-.176-1.886H12.24z"/>
                    </svg>
                    <span>{trans.googleAuthTab}</span>
                  </button>
                </div>

                {authMethod === 'email' ? (
                  /* EMAIL PASSWORD FLOW */
                  <form onSubmit={handleEmailAuthSubmit} className="space-y-4 bg-stone-900/40 p-5 rounded-2xl border border-white/5">
                    <h4 className="text-xs font-mono font-bold text-[#c19a6b] uppercase tracking-wider mb-2">
                      {authMode === 'login' ? trans.loginBtn : trans.registerBtn}
                    </h4>

                    {authError && (
                      <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-mono flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {authSuccess && (
                      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs font-mono flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{authSuccess}</span>
                      </div>
                    )}

                    {authMode === 'register' && (
                      <div>
                        <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">{trans.displayNameLabel}</label>
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Elena Petrova"
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-150 focus:border-[#c19a6b] outline-none font-mono"
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">{trans.emailInputLabel}</label>
                        <span className="text-[8px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">{language === 'FR' ? 'chiffre requis' : 'digits required'}</span>
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="elena98@sovereign.luxury"
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-150 focus:border-[#c19a6b] outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">{trans.passwordInputLabel}</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-150 focus:border-[#c19a6b] outline-none font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-tr from-[#9c7a4b] to-[#c19a6b] hover:from-[#c19a6b] hover:to-[#ffd19a] text-black text-xs font-mono font-bold transition-all shadow-md transform active:scale-95 cursor-pointer"
                    >
                      <span>{authMode === 'login' ? trans.loginBtn : trans.registerBtn}</span>
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode(authMode === 'login' ? 'register' : 'login');
                          setAuthError(null);
                          setAuthSuccess(null);
                        }}
                        className="text-[10px] text-[#c19a6b] hover:underline font-mono cursor-pointer"
                      >
                        {authMode === 'login' ? trans.noAccountYet : trans.alreadyConnectedBtn}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* GOOGLE SIGN IN */
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-stone-900/40 border border-stone-800 text-center text-slate-400 text-xs py-6 flex flex-col items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500/70" />
                      <span>{trans.notConnected}</span>
                    </div>

                    <button 
                      onClick={handleGoogleAuth} 
                      className="gsi-material-button w-full flex items-center justify-center text-center focus:ring-2 focus:ring-[#c19a6b]/50 cursor-pointer"
                    >
                      <div className="gsi-material-button-state"></div>
                      <div className="gsi-material-button-content-wrapper">
                        <div className="gsi-material-button-icon">
                          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          </svg>
                        </div>
                        <span className="gsi-material-button-contents">{trans.signInBtn}</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FIRESTORE METRIC MODULE */}
          <div className="glass-panel p-6 rounded-3xl bg-[#0e0e11]/50 border border-white/10 shadow-lg relative">
            <h3 className="text-lg font-serif-luxury text-slate-100 font-bold flex items-center gap-2 mb-1.5">
              🔥 {trans.firebaseGroup}
            </h3>
            <p className="text-xs text-slate-400 mb-6">{trans.firebaseDesc}</p>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#c19a6b]/5 p-3 rounded-xl border border-[#c19a6b]/15">
                <span className="text-xs font-mono text-slate-300">Firebase Project ID</span>
                <span className="text-xs font-mono text-[#c19a6b] font-bold">tonal-legacy-v07pf</span>
              </div>
              <div className="flex justify-between items-center bg-[#c19a6b]/5 p-3 rounded-xl border border-[#c19a6b]/15">
                <span className="text-xs font-mono text-slate-300">Firestore Instance</span>
                <span className="text-xs font-mono text-[#c19a6b] font-bold select-all overflow-hidden max-w-[200px] truncate text-right">
                  ai-studio-c03eed34-6b98-437a-b865-3de7e2a9ecd6
                </span>
              </div>
              <div className="flex justify-between items-center bg-[#c19a6b]/5 p-3 rounded-xl border border-[#c19a6b]/15">
                <span className="text-xs font-mono text-slate-300">Automatic Persistence</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-400 font-bold">Live</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COMPILER: SPREADSHEET MAPPING CONFIG */}
        <div className="space-y-6">

          <form onSubmit={handleSaveParameters} className="glass-panel p-6 rounded-3xl bg-[#0e0e11]/50 border border-white/10 shadow-lg space-y-4">
            <h3 className="text-lg font-serif-luxury text-slate-100 font-bold flex items-center gap-2">
              📊 {trans.sheetsGroup}
            </h3>
            <p className="text-xs text-slate-400">{trans.sheetsDesc}</p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  {trans.manuallyEnterId}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sheetId}
                    onChange={(e) => {
                      setSheetId(e.target.value);
                      setConnectionStatus('unknown');
                    }}
                    placeholder={trans.manuallyEnterIdPlaceholder}
                    className="w-full bg-[#15151a] border border-[#c19a6b]/30 focus:border-[#c19a6b] focus:ring-1 focus:ring-[#c19a6b] rounded-xl px-4 py-3 text-slate-200 text-xs font-mono placeholder:text-slate-600 focus:outline-none"
                  />
                  <div className="absolute right-3 top-3">
                    <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  {trans.sheetRangeLabel}
                </label>
                <input
                  type="text"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="e.g. VIP Guests"
                  className="w-full bg-[#15151a] border border-[#c19a6b]/30 focus:border-[#c19a6b] focus:ring-1 focus:ring-[#c19a6b] rounded-xl px-4 py-3 text-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>

              {spreadsheetUrl && (
                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">{trans.sheetLiveUrlLabel}</span>
                  <a 
                    href={spreadsheetUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-amber-500 hover:text-amber-400 font-mono text-[10px] font-bold flex items-center gap-1 hover:underline truncate"
                  >
                    <Link2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Open Connected Google Sheet</span>
                  </a>
                </div>
              )}

              {/* Status block */}
              {connectionStatus !== 'unknown' && (
                <div className={`p-4 rounded-xl border text-xs leading-relaxed font-mono ${
                  connectionStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                  connectionStatus === 'failed' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                  'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}>
                  <p className="font-bold flex items-center gap-1.5 uppercase tracking-wide">
                    {connectionStatus === 'success' && <CheckCircle className="w-4 h-4" />}
                    {connectionStatus === 'failed' && <AlertTriangle className="w-4 h-4" />}
                    {connectionStatus === 'verifying' && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{connectionStatus === 'success' ? trans.statusSuccess : connectionStatus === 'failed' ? trans.statusFailed : trans.statusVerifying}</span>
                  </p>
                  {connectionMessage && <p className="mt-1 text-[10px] opacity-90">{connectionMessage}</p>}
                </div>
              )}

              {/* Control Action row */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleVerifySpreadsheet}
                  disabled={!sheetId || !oauthToken}
                  className="flex-1 px-4 py-3 bg-[#15151a] hover:bg-stone-800 border border-[#c19a6b]/40 hover:border-[#c19a6b] rounded-xl text-slate-300 text-xs font-semibold tracking-wide transition duration-150 inline-flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Eye className="w-4 h-4" />
                  <span>{trans.verifyConnectionBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleProvisionNewSheet}
                  disabled={!oauthToken || syncLoading === 'provision'}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold tracking-wide transition duration-150 inline-flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  {syncLoading === 'provision' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}
                  <span>{trans.autoCreateBtn}</span>
                </button>
              </div>

              {/* Commit changes button */}
              <button
                type="submit"
                disabled={saveLoading}
                className="w-full py-3 bg-[#c19a6b] hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs uppercase tracking-widest transition duration-150 flex items-center justify-center gap-1.5"
              >
                {saveLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{trans.saveBtn}</span>
              </button>
            </div>
          </form>

        </div>

      </div>

      {/* SYNC ACTIONS CONSOLE PANEL */}
      <div className="glass-panel p-6 rounded-3xl bg-[#0f0f12]/40 border border-white/10 shadow-xl relative overflow-hidden">
        <h3 className="text-lg font-serif-luxury text-slate-100 font-bold flex items-center gap-2 mb-1.5">
          📡 {trans.syncSection}
        </h3>
        <p className="text-xs text-slate-400 mb-6">{trans.syncDesc}</p>

        {!oauthToken || !sheetId ? (
          <div className="p-6 bg-slate-950/50 border border-dashed border-white/10 text-center rounded-2xl flex flex-col items-center gap-2 text-slate-400 text-xs">
            <HelpCircle className="w-7 h-7 text-slate-600" />
            <span>Connect your Google account and specify the target sheet ID coordinates to proceed with syncing actions.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            
            {/* Export Guests */}
            <button
              onClick={handleExportGuests}
              disabled={syncLoading !== null}
              className="p-5 bg-stone-900/80 hover:bg-stone-800 border border-white/5 hover:border-[#c19a6b] rounded-2xl flex flex-col items-center text-center justify-center gap-3 transition-all duration-200 group text-slate-100"
            >
              <div className="w-11 h-11 bg-amber-600/10 group-hover:bg-[#c19a6b]/20 rounded-full flex items-center justify-center text-[#c19a6b] border border-amber-600/20">
                {syncLoading === 'exportGuests' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs font-bold font-serif-luxury">{trans.exportGuests}</h4>
                <p className="text-[10px] text-slate-400 mt-1">Upload active VIP clients list to Sheets</p>
              </div>
            </button>

            {/* Import Guests */}
            <button
              onClick={handleImportGuests}
              disabled={syncLoading !== null}
              className="p-5 bg-stone-900/80 hover:bg-stone-800 border border-white/5 hover:border-[#c19a6b] rounded-2xl flex flex-col items-center text-center justify-center gap-3 transition-all duration-200 group text-slate-100"
            >
              <div className="w-11 h-11 bg-emerald-600/10 group-hover:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                {syncLoading === 'importGuests' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ArrowDownLeft className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs font-bold font-serif-luxury">{trans.importGuests}</h4>
                <p className="text-[10px] text-slate-400 mt-1">Fetch sheet data back into live application</p>
              </div>
            </button>

            {/* Export culinary kitchen orders */}
            <button
              onClick={handleExportOrders}
              disabled={syncLoading !== null}
              className="p-5 bg-stone-900/80 hover:bg-stone-800 border border-white/5 hover:border-[#c19a6b] rounded-2xl flex flex-col items-center text-center justify-center gap-3 transition-all duration-200 group text-slate-100"
            >
              <div className="w-11 h-11 bg-amber-600/10 group-hover:bg-[#c19a6b]/20 rounded-full flex items-center justify-center text-[#c19a6b] border border-amber-600/20">
                {syncLoading === 'exportOrders' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs font-bold font-serif-luxury">{trans.exportOrders}</h4>
                <p className="text-[10px] text-slate-400 mt-1">Write Gastronomic Orders tab logs</p>
              </div>
            </button>

            {/* Export full auditing ledger */}
            <button
              onClick={handleExportLogs}
              disabled={syncLoading !== null}
              className="p-5 bg-stone-900/80 hover:bg-stone-800 border border-white/5 hover:border-[#c19a6b] rounded-2xl flex flex-col items-center text-center justify-center gap-3 transition-all duration-200 group text-slate-100"
            >
              <div className="w-11 h-11 bg-amber-600/10 group-hover:bg-[#c19a6b]/20 rounded-full flex items-center justify-center text-[#c19a6b] border border-amber-600/20">
                {syncLoading === 'exportLogs' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs font-bold font-serif-luxury">{trans.exportLogs}</h4>
                <p className="text-[10px] text-slate-400 mt-1">Dump system micro-ledger block transactions</p>
              </div>
            </button>

          </div>
        )}
      </div>

    </div>
  );
};
