import { Lock, Info, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { isReadOnlyForRole, TabKey } from '../../lib/clearance';

interface Props {
  tab: TabKey;
}

export const ReadOnlyBanner = ({ tab }: Props) => {
  const { user } = useAuthStore();
  if (!user) return null;

  if (!isReadOnlyForRole(tab, user.role as any)) return null;

  return (
    <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Lock className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-amber-300 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Mode Lecture Seule Sécurisé
          </h4>
          <p className="text-sm text-amber-200/80 mt-1">
            Votre rôle{' '}
            <strong className="text-amber-300">{user.role}</strong> ne dispose pas des
            droits d'écriture sur cette section. Les modifications sont{' '}
            <strong>réservées aux administrateurs</strong>.
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-amber-300/70">
            <Info className="w-3 h-3" />
            Testez un rôle supérieur via le sélecteur de profil pour débloquer l'édition.
          </div>
        </div>
      </div>
    </div>
  );
};
