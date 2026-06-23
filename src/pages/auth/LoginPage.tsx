import { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Shield, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { toast } from '../../components/ui/Toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      toast.success('Bienvenue !', 'Connexion réussie');
      navigate(from, { replace: true });
    }
  };

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      toast.success('Bienvenue !', 'Connexion Google réussie');
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-gradient p-4">
      <Card variant="glass-strong" padding="lg" className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-zaphir-500 to-zaphir-700 mb-4 shadow-glow-gold animate-pulse-glow">
            <Shield className="w-8 h-8 text-obsidian-950" />
          </div>
          <h1 className="text-4xl font-bold bg-gold-gradient bg-clip-text text-transparent">ZAPHIR</h1>
          <p className="text-slate-400 text-sm mt-2">Command Center Access</p>
        </div>

        {/* Erreur globale */}
        {error && (
          <div role="alert" className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        {/* ── Connexion Google ── */}
        <Button
          type="button"
          variant="secondary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          onClick={handleGoogleLogin}
          className="mb-4 flex items-center gap-3 justify-center border border-slate-600 hover:border-slate-400"
        >
          {/* SVG Google officiel */}
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.7-3.4-11.3-8l-6.6 5.1C9.8 39.8 16.4 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.5-2.4 4.7-4.5 6.3l6.2 5.2C40.4 36.2 44 30.5 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continuer avec Google
        </Button>

        {/* Séparateur */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-900 px-3 text-slate-500">ou connectez-vous avec votre email</span>
          </div>
        </div>

        {/* ── Formulaire email/password ── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="user@zaphir.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) clearError(); }}
            leftIcon={<Mail className="w-4 h-4" />}
            required
            autoComplete="email"
            autoFocus
          />

          <Input
            type="password"
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (error) clearError(); }}
            leftIcon={<Lock className="w-4 h-4" />}
            showPasswordToggle
            required
            autoComplete="current-password"
            hint="Min. 8 caractères, 1 majuscule, 1 chiffre"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={!email || !password}
          >
            Se connecter
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-zaphir-400 hover:text-zaphir-300 font-medium transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}


