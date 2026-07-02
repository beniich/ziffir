import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
    hotelName: '',
    phone: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
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
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Créer votre compte</h2>
      <p className="form-subtitle">14 jours d'essai gratuit, aucune carte requise</p>
      
      <div className="form-group">
        <label>Nom complet</label>
        <input
          type="text"
          value={form.displayName}
          onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
          required
          minLength={2}
        />
      </div>
      
      <div className="form-group">
        <label>Nom de votre hôtel</label>
        <input
          type="text"
          value={form.hotelName}
          onChange={e => setForm(f => ({ ...f, hotelName: e.target.value }))}
          required
          minLength={2}
          placeholder="Hôtel Ritz Paris"
        />
      </div>
      
      <div className="form-group">
        <label>Email professionnel</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Téléphone (optionnel)</label>
        <input
          type="tel"
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        />
      </div>
      
      <div className="form-group">
        <label>Mot de passe <span className="hint">(12 caractères minimum)</span></label>
        <input
          type="password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
          minLength={12}
        />
      </div>
      
      {error && <div className="form-error">{error}</div>}
      
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Création…' : 'Créer mon hôtel'}
      </button>
    </form>
  );
}
