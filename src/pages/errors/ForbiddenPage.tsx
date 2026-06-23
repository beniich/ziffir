import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function ForbiddenPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-mesh-gradient p-8">
      <div className="max-w-md text-center glass-strong rounded-2xl p-10 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
          <ShieldOff className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-5xl font-bold text-red-400 mb-2">403</h1>
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Accès Interdit</h2>
        <p className="text-slate-400 mb-8">
          Vous n'avez pas les droits nécessaires pour accéder à cette section.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button variant="ghost">Accueil</Button>
          </Link>
          <Link to="/login">
            <Button variant="primary">Se connecter</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
