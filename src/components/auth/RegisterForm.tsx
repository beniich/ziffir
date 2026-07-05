import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { PublicLayout } from '../layout/PublicLayout';
import { Hotel, Mail, User, Phone, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
    hotelName: '',
    phone: '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user clicked a pricing plan, pre-fill it or handle logic if needed
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    if (plan) {
      // In a real app, you'd store this in state and send it to the backend
      console.log('Selected Plan:', plan);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await register(form);
      navigate('/portal');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PublicLayout title="Create your Palace Account" description="Start your 14-day free trial on Ziffir">
      {/* ═══ AMBIENT GLOWS ═══ */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>
      
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 glass-card p-8 sm:p-10"
        >
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-[#D4AF37]/20 rounded-full flex items-center justify-center border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)] mb-4">
              <CrownIcon />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Create your Palace</h2>
            <p className="mt-2 text-sm text-slate-400">
              14-day free trial, no credit card required. Already have an account? <Link to="/login" className="text-[#D4AF37] hover:underline">Log in</Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Hotel Name */}
              <div>
                <label htmlFor="hotelName" className="block text-sm font-medium text-slate-300 mb-1">Hotel Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Hotel size={18} />
                  </div>
                  <input
                    id="hotelName"
                    type="text"
                    required
                    minLength={2}
                    className="block w-full pl-10 bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] sm:text-sm transition-all"
                    placeholder="e.g. The Grand Zaphir"
                    value={form.hotelName}
                    onChange={e => setForm(f => ({ ...f, hotelName: e.target.value }))}
                  />
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-1">Your Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User size={18} />
                  </div>
                  <input
                    id="displayName"
                    type="text"
                    required
                    minLength={2}
                    className="block w-full pl-10 bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] sm:text-sm transition-all"
                    placeholder="John Doe"
                    value={form.displayName}
                    onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Professional Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="block w-full pl-10 bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] sm:text-sm transition-all"
                    placeholder="gm@grandzaphir.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">Phone Number <span className="text-slate-500 font-normal">(Optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Phone size={18} />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    className="block w-full pl-10 bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] sm:text-sm transition-all"
                    placeholder="+33 1 23 45 67 89"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Password <span className="text-slate-500 font-normal">(min 12 chars)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={12}
                    className="block w-full pl-10 bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] sm:text-sm transition-all"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  />
                </div>
              </div>
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
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-[#060A13] bg-gradient-to-r from-[#D4AF37] to-[#996515] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] focus:ring-offset-[#060A13] transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-btn overflow-hidden"
              >
                {loading ? (
                  'Creating your palace...'
                ) : (
                  <span className="flex items-center gap-2 relative z-10">
                    Create my account <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 text-center mt-4">
              By registering, you agree to our <Link to="/legal/terms" className="hover:text-slate-300 underline">Terms of Service</Link> and <Link to="/legal/privacy" className="hover:text-slate-300 underline">Privacy Policy</Link>.
            </p>
          </form>
        </motion.div>
      </div>
    </PublicLayout>
  );
}

function CrownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
    </svg>
  );
}
