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
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const from = (location.state as any)?.from?.pathname || '/arrivals';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      toast.success('Bienvenue !', 'Connexion réussie');
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-gradient p-4">
      <Card
        variant="glass-strong"
        padding="lg"
        className="w-full max-w-md animate-slide-up"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-zaphir-500 to-zaphir-700 mb-4 shadow-glow-gold animate-pulse-glow">
            <Shield className="w-8 h-8 text-obsidian-950" />
          </div>
          <h1 className="text-4xl font-bold bg-gold-gradient bg-clip-text text-transparent">
            ZAPHIR
          </h1>
          <p className="text-slate-400 text-sm mt-2">Command Center Access</p>
        </div>

        {/* Erreur */}
        {error && (
          <div
            role="alert"
            className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="user@zaphir.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) clearError();
            }}
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
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) clearError();
            }}
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
            <Link
              to="/register"
              className="text-zaphir-400 hover:text-zaphir-300 font-medium transition-colors"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
