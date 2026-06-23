import { Link } from 'react-router-dom';
import { Lock, ShieldAlert, ArrowLeft, UserCog, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { ROLE_HIERARCHY, ROLE_LABELS, UserRole } from '../../types';
import { TAB_CLEARANCE, TabKey } from '../../lib/clearance';

interface Props {
  tab: TabKey;
}

export const LockScreen = ({ tab }: Props) => {
  const { user } = useAuthStore();
  if (!user) return null;

  const tabConfig = TAB_CLEARANCE[tab];
  const currentRole = user.role as UserRole;
  const allowedRoles = tabConfig.allowedRoles;
  const requiredMinRole = allowedRoles
    .map((r) => ROLE_HIERARCHY[r])
    .sort((a, b) => b - a)[0];

  // Suggestions de rôles plus élevés
  const upgradeSuggestions: UserRole[] = (['HOTEL', 'SUPER_ADMIN'] as UserRole[])
    .filter((r) => ROLE_HIERARCHY[r] > ROLE_HIERARCHY[currentRole]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-mesh-gradient">
      <Card
        variant="glass-strong"
        padding="xl"
        className="max-w-2xl w-full animate-slide-up"
      >
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-amber-500/30 mb-4 animate-pulse-glow">
            <ShieldAlert className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Verrouillage d'Habilitation Réglementaire
          </h1>
          <p className="text-slate-400">
            Clearance insuffisante pour accéder à cette section
          </p>
        </div>

        {/* Détails */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Section demandée</span>
              <Badge variant="gold">
                {tabConfig.icon} {tabConfig.label}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Votre rôle actuel</span>
              <Badge variant={currentRole === 'SUPER_ADMIN' ? 'danger' : currentRole === 'HOTEL' ? 'gold' : 'info'}>
                {ROLE_LABELS[currentRole]} (niveau {ROLE_HIERARCHY[currentRole]})
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-slate-400">Habilitation requise</span>
              <Badge variant="warning">
                Niveau ≥ {requiredMinRole} ({allowedRoles.map((r) => ROLE_LABELS[r]).join(' ou ')})
              </Badge>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
            <p className="text-xs text-slate-400 mb-2">
              <Lock className="w-3 h-3 inline mr-1" />
              Cette restriction est appliquée conformément à la matrice
              <code className="px-1 mx-1 py-0.5 bg-slate-800 rounded text-amber-400">TAB_CLEARANCE</code>
              . Toute tentative de contournement est journalisée dans la chaîne d'audit.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {upgradeSuggestions.length > 0 ? (
            <>
              <div className="flex items-center gap-2 text-sm text-amber-300 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold">Tester un rôle supérieur :</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {upgradeSuggestions.map((role) => (
                  <Button
                    key={role}
                    variant={role === 'SUPER_ADMIN' ? 'danger' : 'primary'}
                    onClick={() => {
                      // Émettre un événement global ou utiliser un store dédié
                      const event = new CustomEvent('simulateRole', { detail: role });
                      window.dispatchEvent(event);
                    }}
                    leftIcon={<UserCog className="w-4 h-4" />}
                  >
                    Simuler {ROLE_LABELS[role]}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
              <p className="text-sm text-amber-300">
                Vous disposez déjà du rôle maximal. Contactez un administrateur
                plateforme si vous pensez que c'est une erreur.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t border-slate-700/50">
            <Link to="/dashboard" className="flex-1">
              <Button variant="ghost" fullWidth leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Retour au tableau de bord
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
