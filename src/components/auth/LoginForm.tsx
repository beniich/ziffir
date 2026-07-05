import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { PublicLayout } from '../layout/PublicLayout';
import { Mail, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', totpCode: '' });
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
                    Open your authenticator app (Google, Authy) to retrieve your code.
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
