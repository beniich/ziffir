import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthStore, UserRole } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { toast } from '../../components/ui/Toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'operator' as UserRole,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Les mots de passe ne correspondent pas');
      return;
    }

    const success = await register({
      email: formData.email,
      username: formData.username,
      password: formData.password,
      role: formData.role,
    });

    if (success) {
      toast.success('Compte créé !', 'Bienvenue sur Zaphir');
      navigate('/arrivals');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-gradient p-4">
      <Card variant="glass-strong" padding="lg" className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-cyber-cyan to-cyber-magenta mb-3 shadow-cyber">
            <Shield className="w-7 h-7 text-obsidian-950" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">Créer un compte</h1>
          <p className="text-slate-400 text-sm mt-1">Rejoignez le Command Center</p>
        </div>

        {(error || validationError) && (
          <div role="alert" className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="text-sm text-red-400">{validationError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="user@zaphir.com"
            value={formData.email}
            onChange={(e) => { setFormData({ ...formData, email: e.target.value }); clearError(); }}
            leftIcon={<Mail className="w-4 h-4" />}
            required
            autoComplete="email"
          />

          <Input
            label="Nom d'utilisateur"
            placeholder="johndoe"
            value={formData.username}
            onChange={(e) => { setFormData({ ...formData, username: e.target.value }); clearError(); }}
            leftIcon={<User className="w-4 h-4" />}
            hint="3-30 caractères, alphanumériques et underscore"
            required
            autoComplete="username"
          />

          <Input
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => { setFormData({ ...formData, password: e.target.value }); clearError(); }}
            leftIcon={<Lock className="w-4 h-4" />}
            showPasswordToggle
            required
            autoComplete="new-password"
            hint="Min. 8 caractères, 1 majuscule, 1 chiffre"
          />

          {/* Indicateur de force */}
          {formData.password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i <= passwordStrength.score
                        ? passwordStrength.color
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500">{passwordStrength.label}</p>
            </div>
          )}

          <Input
            label="Confirmer le mot de passe"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            showPasswordToggle
            required
            autoComplete="new-password"
          />

          <Select
            label="Rôle"
            options={[
              { value: 'operator', label: 'Operator (lecture seule)' },
              { value: 'manager', label: 'Manager (gestion)' },
              { value: 'admin', label: 'Admin (contrôle total)' },
            ]}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            hint="Le rôle détermine vos permissions"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={!formData.email || !formData.username || !formData.password}
          >
            Créer mon compte
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-zaphir-400 hover:text-zaphir-300 font-medium transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

// Helper
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) && password.length >= 12) score++;

  const levels = [
    { label: 'Trop faible', color: 'bg-red-500' },
    { label: 'Faible', color: 'bg-orange-500' },
    { label: 'Correct', color: 'bg-yellow-500' },
    { label: 'Bon', color: 'bg-emerald-500' },
    { label: 'Excellent', color: 'bg-emerald-400' },
  ];

  return { score, ...levels[score] };
}
