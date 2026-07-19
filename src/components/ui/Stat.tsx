import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Stat — Carte KPI : valeur, label, trend, icône
// Usage :
//   <Stat label="Arrivées aujourd'hui" value={12} trend={{ value: 3, dir: 'up' }} icon={<Plane />} />
// ─────────────────────────────────────────────────────────────────────────────

interface Trend {
  value: number;
  dir: 'up' | 'down' | 'flat';
  label?: string;
}

interface StatProps {
  label: string;
  value: string | number;
  trend?: Trend;
  icon?: ReactNode;
  iconColor?: string;
  variant?: 'default' | 'gold' | 'glass';
  description?: string;
  className?: string;
}

const trendColors = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  flat: 'text-text-muted',
};

const TrendIcon = ({ dir }: { dir: Trend['dir'] }) => {
  if (dir === 'up') return <TrendingUp size={13} />;
  if (dir === 'down') return <TrendingDown size={13} />;
  return <Minus size={13} />;
};

const variantClasses = {
  default: 'bg-surface-elevated border border-border-subtle',
  gold: 'bg-gradient-to-br from-zaphir-500/10 to-obsidian-900/60 border border-zaphir-500/30',
  glass: 'glass-panel',
};

export function Stat({
  label,
  value,
  trend,
  icon,
  iconColor = 'text-zaphir-400',
  variant = 'default',
  description,
  className,
}: StatProps) {
  return (
    <div className={cn('rounded-2xl p-5 flex flex-col gap-3', variantClasses[variant], className)}>
      {/* Top row: icon + trend */}
      <div className="flex items-center justify-between">
        {icon && (
          <span className={cn('p-2 rounded-lg bg-surface text-lg', iconColor)}>
            {icon}
          </span>
        )}
        {trend && (
          <span className={cn('inline-flex items-center gap-1 text-xs font-medium', trendColors[trend.dir])}>
            <TrendIcon dir={trend.dir} />
            {trend.dir !== 'flat' && (trend.dir === 'up' ? '+' : '-')}{Math.abs(trend.value)}
            {trend.label && <span className="text-text-muted font-normal">{trend.label}</span>}
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <div className="text-3xl font-bold text-text-primary tracking-tight">{value}</div>
        <div className="text-sm text-text-secondary mt-1">{label}</div>
        {description && (
          <div className="text-xs text-text-muted mt-0.5">{description}</div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatGroup — Grille de stats
// ─────────────────────────────────────────────────────────────────────────────

export function StatGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6', className)}>
      {children}
    </div>
  );
}
