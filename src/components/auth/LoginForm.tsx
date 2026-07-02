import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Connexion</h2>
      <p className="form-subtitle">
        Pas encore de compte ? <Link to="/register">Créer un hôtel</Link>
      </p>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
          autoComplete="username"
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
          autoComplete="current-password"
        />
      </div>

      {requiresTotp && (
        <div className="form-group">
          <label htmlFor="totp">Code 2FA</label>
          <input
            id="totp"
            type="text"
            value={form.totpCode}
            onChange={e => setForm(f => ({ ...f, totpCode: e.target.value }))}
            required
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="123456"
            autoComplete="one-time-code"
            autoFocus
          />
          <small>Ouvrez votre app d'authentification (Google Authenticator, Authy, etc.)</small>
        </div>
      )}

      {error && <div className="form-error" role="alert">{error}</div>}

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Connexion…' : requiresTotp ? 'Vérifier le code' : 'Se connecter'}
      </button>

      <div className="form-footer">
        <Link to="/forgot-password">Mot de passe oublié ?</Link>
      </div>
    </form>
  );
}
