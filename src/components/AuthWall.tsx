import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { Lock, UserCircle2, KeyRound, ChevronLeft, ShieldCheck, Mail, LogIn, ArrowRight, UserPlus, RefreshCw, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';
import { loginWithEmail, registerWithEmail, googleSignIn } from '../firebase';

interface AuthWallProps {
  onAuthSuccess: (user: FirebaseUser | { email: string; displayName: string; uid: string; getToken: () => Promise<string> }) => void;
  onBackToWebsite: () => void;
  themeMode: 'dark' | 'light';
  language: 'EN' | 'FR' | 'RU';
}

const LOCALIZATION = {
  EN: {
    back: "Back to Public Showcase",
    title: "Sovereign Authentication",
    subtitle: "Identify yourself to access the elite Zaphir ecosystem.",
    loginTab: "Sign In",
    registerTab: "Create Profile",
    email: "Email Address",
    emailPlaceholder: "admin.zaphir@empire.local",
    password: "Cryptographic Key (Password)",
    passwordPlaceholder: "••••••••",
    name: "Full Name",
    namePlaceholder: "Elena Petrova",
    signInBtn: "Authorize & Sign In",
    registerBtn: "Register Verified Credentials",
    processing: "Establishing Secure Handshake...",
    googleBtn: "Authenticate via Google Workspace",
    bypassBtn: "Bypass Dev Local (Bypass Firebase)",
    bypassDesc: "Simulate a successful login for local development",
    securityNote: "PCI-DSS Cryptographically Encrypted Connection. Zero-Knowledge token storage.",
    errorEmailDigits: "The system requires at least one number/digit (0-9) inside the email for registry authorization.",
  },
  FR: {
    back: "Retour au Site Public",
    title: "Authentification Souveraine",
    subtitle: "Identifiez-vous pour accéder à l'écosystème élite Zaphir.",
    loginTab: "Connexion",
    registerTab: "Créer un Profil",
    email: "Adresse E-mail",
    emailPlaceholder: "admin.zaphir@empire.local",
    password: "Clé Cryptographique (Mot de passe)",
    passwordPlaceholder: "••••••••",
    name: "Nom Complet",
    namePlaceholder: "Elena Petrova",
    signInBtn: "S'identifier & Ouvrir Session",
    registerBtn: "Valider l'Enregistrement",
    processing: "Établissement du Handshake Sécurisé...",
    googleBtn: "S'authentifier via Google Workspace",
    bypassBtn: "Bypass Dev Local (Ignorer Firebase)",
    bypassDesc: "Simuler une connexion réussie pour le développement local",
    securityNote: "Connexion Chiffrée Cryptographiquement PCI-DSS. Stockage à divulgation nulle de connaissance.",
    errorEmailDigits: "Le système requiert au moins un chiffre (0-9) dans l'e-mail pour l'autorisation.",
  },
  RU: {
    back: "Назад на главный сайт",
    title: "Суверенная Авторизация",
    subtitle: "Идентифицируйте себя для доступа к элитной экосистеме Zaphir.",
    loginTab: "Вход",
    registerTab: "Регистрация",
    email: "Электронная почта",
    emailPlaceholder: "admin.zaphir@empire.local",
    password: "Криптографический ключ (Пароль)",
    passwordPlaceholder: "••••••••",
    name: "Полное имя",
    namePlaceholder: "Elena Petrova",
    signInBtn: "Авторизоваться",
    registerBtn: "Зарегистрировать профиль",
    processing: "Установка защищенного соединения...",
    googleBtn: "Авторизация через Google Workspace",
    bypassBtn: "Bypass Dev Local (Пропустить Firebase)",
    bypassDesc: "Симуляция успешного входа для локальной разработки",
    securityNote: "Шифрованное соединение стандарта PCI-DSS. Токены с нулевым разглашением.",
    errorEmailDigits: "Система требует хотя бы одну цифру (0-9) в email.",
  }
};

export const AuthWall: React.FC<AuthWallProps> = ({
  onAuthSuccess,
  onBackToWebsite,
  themeMode,
  language
}) => {
  const t = LOCALIZATION[language] || LOCALIZATION.EN;
  const isDark = themeMode === 'dark';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerSuccess = (user: any) => {
    confetti({
      particleCount: 100,
      spread: 70,
      colors: ['#c19a6b', '#d4af37', '#7c5a30', '#ffffff', '#e2e8f0']
    });
    onAuthSuccess(user);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    // Rule: Need at least one digit in the email (from old logic)
    if (!/\d/.test(email)) {
      setError(t.errorEmailDigits);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const user = await registerWithEmail(email, password, name);
        triggerSuccess(user);
      } else {
        const user = await loginWithEmail(email, password);
        triggerSuccess(user);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        triggerSuccess(res.user);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Auth failed');
    }
  };

  const handleDevBypass = () => {
    // Generate a simulated user
    const mockUser = {
      uid: 'dev-bypass-999',
      email: email || 'admin.zaphir1@empire.local',
      displayName: name || 'Dev Sovereign Operator',
      getToken: async () => 'sandbox-token-proprietor'
    };
    triggerSuccess(mockUser);
  };

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center z-10 transition-colors duration-300 relative ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-stone-100 text-slate-900'
    }`}>
      {/* Decorative background grid pattern */}
      <div className={`absolute inset-0 bg-[radial-gradient(#c19a6b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none ${isDark ? 'opacity-5' : 'opacity-[0.03]'}`} />

      <div className="w-full max-w-md space-y-8 relative z-10">
        
        {/* Top bar with back option */}
        <div className="flex justify-start items-center pb-2 border-b border-stone-800/10 dark:border-slate-800/30">
          <button
            onClick={onBackToWebsite}
            className={`flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> {t.back}
          </button>
        </div>

        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#c19a6b]/10 border-2 border-[#c19a6b] flex items-center justify-center text-[#c19a6b] mx-auto animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-serif font-light tracking-tight text-slate-900 dark:text-white">
            {t.title}
          </h2>
          <p className="text-xs font-sans text-stone-500 dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>

        {/* Authentication Form Card */}
        <div className={`rounded-3xl border shadow-2xl overflow-hidden font-sans transition-all duration-300 backdrop-blur-xl ${
          isDark ? 'bg-slate-900/80 border-slate-800/60 shadow-[0_0_40px_rgba(0,0,0,0.4)]' : 'bg-white/90 border-stone-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)]'
        }`}>
          {/* Tabs */}
          <div className="flex border-b border-stone-200 dark:border-slate-800">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-4 text-xs font-mono uppercase font-bold tracking-widest transition-colors ${
                mode === 'login' 
                  ? 'border-b-2 border-[#c19a6b] text-[#c19a6b]' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {t.loginTab}
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-4 text-xs font-mono uppercase font-bold tracking-widest transition-colors ${
                mode === 'register' 
                  ? 'border-b-2 border-[#c19a6b] text-[#c19a6b]' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {t.registerTab}
            </button>
          </div>

          <div className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className={`font-mono text-[9px] uppercase font-bold tracking-widest flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-[#7c5a30]'}`}>
                    <UserCircle2 className="w-3 h-3" /> {t.name}
                  </label>
                  <input
                    type="text"
                    placeholder={t.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    className={`w-full p-3 rounded-xl border font-mono text-xs focus:outline-none focus:border-[#c19a6b] transition-colors ${
                      isDark 
                        ? 'border-slate-800/60 bg-slate-950/50 text-slate-100 placeholder-slate-600 focus:bg-slate-900/80' 
                        : 'border-stone-200 bg-stone-50/50 text-slate-900 placeholder-slate-400 focus:bg-white'
                    }`}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className={`font-mono text-[9px] uppercase font-bold tracking-widest flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-[#7c5a30]'}`}>
                  <Mail className="w-3 h-3" /> {t.email}
                </label>
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className={`w-full p-3 rounded-xl border font-mono text-xs focus:outline-none focus:border-[#c19a6b] transition-colors ${
                    isDark 
                      ? 'border-slate-800/60 bg-slate-950/50 text-slate-100 placeholder-slate-600 focus:bg-slate-900/80' 
                      : 'border-stone-200 bg-stone-50/50 text-slate-900 placeholder-slate-400 focus:bg-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`font-mono text-[9px] uppercase font-bold tracking-widest flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-[#7c5a30]'}`}>
                  <KeyRound className="w-3 h-3" /> {t.password}
                </label>
                <input
                  type="password"
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className={`w-full p-3 rounded-xl border font-mono text-xs focus:outline-none focus:border-[#c19a6b] transition-colors ${
                    isDark 
                      ? 'border-slate-800/60 bg-slate-950/50 text-slate-100 placeholder-slate-600 focus:bg-slate-900/80' 
                      : 'border-stone-200 bg-stone-50/50 text-slate-900 placeholder-slate-400 focus:bg-white'
                  }`}
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-mono leading-relaxed">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 bg-[#c19a6b] hover:bg-[#a67d4e] text-slate-950 font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t.processing}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {mode === 'login' ? t.signInBtn : t.registerBtn}
                  </>
                )}
              </button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-stone-200 dark:border-slate-800"></div>
              <span className={`flex-shrink-0 mx-4 text-[9px] font-mono uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                OR
              </span>
              <div className="flex-grow border-t border-stone-200 dark:border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl border transition-colors font-mono text-[10px] uppercase font-bold tracking-wide cursor-pointer ${
                isDark 
                  ? 'border-slate-800/60 hover:bg-slate-800/80 text-slate-300' 
                  : 'border-stone-200 hover:bg-stone-50 text-stone-700'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
              </svg>
              {t.googleBtn}
            </button>

            {/* Dev Bypass Button */}
            <div className={`mt-6 pt-4 border-t text-center ${isDark ? 'border-slate-800' : 'border-stone-100'}`}>
              <p className={`text-[10px] font-sans mb-3 leading-normal ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                {t.bypassDesc}
              </p>
              <button
                type="button"
                onClick={handleDevBypass}
                className="w-full py-2.5 bg-[#c19a6b]/10 hover:bg-[#c19a6b]/20 text-[#c19a6b] hover:text-[#a67d4e] font-mono font-bold text-[10px] uppercase rounded-xl transition-all border border-[#c19a6b]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5" />
                {t.bypassBtn}
              </button>
            </div>
            
          </div>
          
          {/* PCI Compliant footer */}
          <div className={`p-4 border-t flex flex-col items-center gap-1.5 text-center ${isDark ? 'bg-slate-950/40 border-slate-800/60' : 'bg-stone-50/50 border-stone-200'}`}>
             <span className="flex items-center justify-center gap-1 text-[#c19a6b] font-mono text-[9px] font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" /> PCI-DSS VERIFIED
             </span>
             <p className={`text-[9px] font-sans ${isDark ? 'text-slate-500' : 'text-stone-500'}`}>
                {t.securityNote}
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};
