import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// PageHeader — En-tête de page unifié
// Usage :
//   <PageHeader
//     title="Arrivées VIP"
//     subtitle="Suivi en temps réel"
//     badge={{ label: '12 actives', variant: 'success' }}
//     actions={<Button>Nouvelle arrivée</Button>}
//   />
// ─────────────────────────────────────────────────────────────────────────────

interface PageBadge {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold';
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: PageBadge;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  className?: string;
}

const badgeVariantClasses: Record<NonNullable<PageBadge['variant']>, string> = {
  default: 'bg-slate-700/60 text-slate-300',
  success:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  warning:  'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  danger:   'bg-red-500/15 text-red-400 border border-red-500/30',
  info:     'bg-sky-500/15 text-sky-400 border border-sky-500/30',
  gold:     'bg-zaphir-500/15 text-zaphir-400 border border-zaphir-500/30',
};

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 mb-6', className)}>
      {/* Breadcrumb */}
      {breadcrumb && (
        <div className="text-xs text-text-muted">{breadcrumb}</div>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
              {badge && (
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  badgeVariantClasses[badge.variant ?? 'default']
                )}>
                  {badge.label}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
