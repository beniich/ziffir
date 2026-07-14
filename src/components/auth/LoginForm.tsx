import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { PublicLayout } from '../layout/PublicLayout';
import { Mail, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { googleSignIn } from '../../firebase';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '', totpCode: '' });
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(form.email, form.password, form.totpCode || undefined);
      navigate('/portal');
    } catch (e: any) {
      if (e.message === '2FA_REQUIRED') {
        setRequiresTotp(true);
        setError(null);
        setLoading(false);
        return;
      }
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        // Exchange Firebase token with backend session
        const idToken = await result.user.getIdToken();
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
          credentials: 'include',
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data?.error?.message || 'Google authentication failed');
        }
        navigate('/portal');
      }
    } catch (e: any) {
      // Firebase error codes
      if (e.code === 'auth/popup-closed-by-user') {
        setError(null); // User cancelled, not an error
      } else if (e.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google Sign-In. Please add it in Firebase Console → Authentication → Settings → Authorized domains.');
      } else {
        setError(e.message || 'Google Sign-In failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <PublicLayout title="Login to Ziffir" description="Access your luxury hotel management portal.">
      {/* ═══ AMBIENT GLOWS ═══ */}
      <div className="ambient-glow glow-1" style={{ top: '10%', left: '10%' }}></div>
      <div className="ambient-glow glow-3" style={{ bottom: '10%', right: '10%' }}></div>
      
      <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full space-y-8 glass-card p-8 sm:p-10"
        >
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] mb-4">
              <ShieldCheck className="text-blue-400" size={24} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Access Portal</h2>
            <p className="mt-2 text-sm text-slate-400">
              Don't have an account? <Link to="/register" className="text-blue-400 hover:underline">Create a hotel</Link>
            </p>
          </div>

          {/* ═══ GOOGLE SIGN-IN BUTTON ═══ */}
          <button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-700 rounded-lg bg-slate-900/60 hover:bg-slate-800 hover:border-slate-600 text-slate-200 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                Connecting…
              </span>
            ) : (
              <>
                {/* Google Logo SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-transparent text-slate-500">or sign in with email</span>
            </div>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={requiresTotp}
                    autoComplete="username"
                    autoFocus
                    className="block w-full pl-10 bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 sm:text-sm transition-all disabled:opacity-50"
                    placeholder="gm@grandzaphir.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
                  <Link to="/forgot-password" className="text-xs text-blue-400 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    disabled={requiresTotp}
                    autoComplete="current-password"
                    className="block w-full pl-10 bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 sm:text-sm transition-all disabled:opacity-50"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  />
                </div>
              </div>

              {/* TOTP */}
              {requiresTotp && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label htmlFor="totp" className="block text-sm font-medium text-[#D4AF37] mb-1">2FA Security Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#D4AF37]/50">
                      <ShieldCheck size={18} />
                    </div>
                    <input
                      id="totp"
                      type="text"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      autoComplete="one-time-code"
                      autoFocus
                      className="block w-full pl-10 bg-slate-900/80 border border-[#D4AF37]/50 rounded-lg py-3 text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] sm:text-lg text-center tracking-[0.2em] font-mono transition-all shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                      placeholder="123456"
                      value={form.totpCode}
                      onChange={e => setForm(f => ({ ...f, totpCode: e.target.value }))}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400 text-center">
                    Open your authenticator app (Google Authenticator, Authy) to retrieve your code.
                  </p>
                </motion.div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg flex items-start gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white ${
                  requiresTotp 
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#996515] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] focus:ring-[#D4AF37] text-[#060A13]' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] focus:ring-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#060A13] transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-btn overflow-hidden`}
              >
                {loading ? (
                  'Authenticating...'
                ) : (
                  <span className="flex items-center gap-2 relative z-10">
                    {requiresTotp ? 'Verify Code' : 'Log in'} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
