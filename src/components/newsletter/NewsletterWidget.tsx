import { useState } from 'react';
import { motion } from 'framer-motion';

interface NewsletterWidgetProps {
  source?: string; // 'blog', 'changelog', 'homepage', etc.
  variant?: 'inline' | 'card' | 'modal';
  title?: string;
  description?: string;
  className?: string;
}

type FormState = 'idle' | 'submitting' | 'success' | 'error' | 'confirm';

export function NewsletterWidget({
  source = 'unknown',
  variant = 'card',
  title = '📧 Notre newsletter',
  description = 'Recevez nos derniers articles, études de cas, et nouveautés produit directement dans votre boîte mail.',
  className = '',
}: NewsletterWidgetProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [interests, setInterests] = useState<string[]>(['product']);
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setState('submitting');
    
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          interests,
          source,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || 'Erreur');
      }
      
      setState('confirm');
    } catch (e: any) {
      setError(e.message);
      setState('error');
    }
  };
  
  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };
  
  if (state === 'success' || state === 'confirm') {
    return (
      <motion.div 
        className={`text-center p-8 bg-slate-800/30 rounded-2xl border border-[#D4AF37]/30 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-white mb-2">{state === 'success' ? 'Vous êtes inscrit !' : 'Confirmez votre inscription'}</h3>
        <p className="text-slate-400 mb-6">
          {state === 'success' 
            ? 'Vous recevrez bientôt nos prochaines newsletters.' 
            : `Un email de confirmation vient d'être envoyé à ${email}. Cliquez sur le lien pour valider votre inscription (vérifiez vos spams).`}
        </p>
        {state === 'confirm' && (
          <button type="button" 
            onClick={() => setState('idle')}
            className="text-sm text-[#D4AF37] hover:underline"
          >
            ← Essayer une autre adresse
          </button>
        )}
      </motion.div>
    );
  }
  
  return (
    <div className={`w-full ${className}`}>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Prénom (optionnel)"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition"
            autoComplete="given-name"
          />
          <input
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="flex-[2] px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition"
            autoComplete="email"
          />
        </div>
        
        <fieldset className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/20">
          <legend className="text-sm text-slate-400 px-2 font-medium mb-3">Centres d'intérêt :</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'product', label: '🚀 Nouveautés produit' },
              { key: 'ia', label: '🤖 IA & hôtellerie' },
              { key: 'case-studies', label: '📊 Études de cas' },
              { key: 'events', label: '🎤 Événements' },
            ].map(interest => (
              <label key={interest.key} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-slate-600 bg-slate-800 group-hover:border-[#D4AF37] transition-colors">
                  <input
                    type="checkbox"
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                    checked={interests.includes(interest.key)}
                    onChange={() => toggleInterest(interest.key)}
                  />
                  {interests.includes(interest.key) && (
                    <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{interest.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        
        {error && (
          <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm" role="alert">
            ❌ {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={state === 'submitting' || !email}
          className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#c19a6b] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
        >
          {state === 'submitting' ? 'Inscription en cours…' : 'S\'abonner gratuitement'}
        </button>
        
        <p className="text-xs text-center text-slate-500 mt-4">
          🔒 Vos données sont sécurisées. Vous pouvez vous désabonner à tout moment.
          Voir notre <a href="/legal/privacy" className="underline hover:text-slate-300">politique de confidentialité</a>.
        </p>
      </form>
    </div>
  );
}
