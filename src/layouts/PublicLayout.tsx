import { Link, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

export const PublicLayout = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mesh-gradient">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-obsidian-950/60 border-b border-amber-500/10">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zaphir-500 to-zaphir-700 flex items-center justify-center shadow-glow-gold">
              <Shield className="w-5 h-5 text-obsidian-950" />
            </div>
            <span className="text-2xl font-bold bg-gold-gradient bg-clip-text text-transparent">
              ZAPHIR
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm ${location.pathname === '/' ? 'text-zaphir-400' : 'text-slate-300 hover:text-zaphir-300'}`}>
              Accueil
            </Link>
            <Link to="/about" className={`text-sm ${location.pathname === '/about' ? 'text-zaphir-400' : 'text-slate-300 hover:text-zaphir-300'}`}>
              À propos
            </Link>
            <Link to="/security" className={`text-sm ${location.pathname === '/security' ? 'text-zaphir-400' : 'text-slate-300 hover:text-zaphir-300'}`}>
              Sécurité
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button variant="primary">Mon espace</Button>
              </Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost">Connexion</Button></Link>
                <Link to="/register"><Button variant="primary">Inscription</Button></Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="md:hidden border-t border-amber-500/10 px-6 py-4 space-y-3">
            <Link to="/" className="block text-slate-300">Accueil</Link>
            <Link to="/about" className="block text-slate-300">À propos</Link>
            <Link to="/security" className="block text-slate-300">Sécurité</Link>
            <div className="pt-3 border-t border-slate-700 space-y-2">
              {user ? (
                <Link to="/dashboard"><Button variant="primary" fullWidth>Mon espace</Button></Link>
              ) : (
                <>
                  <Link to="/login"><Button variant="ghost" fullWidth>Connexion</Button></Link>
                  <Link to="/register"><Button variant="primary" fullWidth>Inscription</Button></Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-amber-500/10 mt-20 py-8 text-center text-slate-500 text-sm">
        <p>© 2025 Zaphir Command Center — All rights reserved</p>
      </footer>
    </div>
  );
};
