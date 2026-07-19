import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Section — Conteneur de section avec espacement et séparateurs standardisés
// Usage :
//   <Section title="Statistiques" description="Données temps réel">
//     <StatCard />
//   </Section>
// ─────────────────────────────────────────────────────────────────────────────

interface SectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Ajouter un séparateur en dessous du header */
  divided?: boolean;
  /** Variante de fond */
  variant?: 'default' | 'glass' | 'elevated';
}

const variantClasses = {
  default: '',
  glass: 'glass-panel p-5',
  elevated: 'bg-surface-elevated border border-border-subtle rounded-2xl p-5',
};

export function Section({
  title,
  description,
  actions,
  children,
  className,
  divided = false,
  variant = 'default',
}: SectionProps) {
  const hasHeader = title || description || actions;

  return (
    <section className={cn('mb-6', variantClasses[variant], className)}>
      {hasHeader && (
        <div className={cn(
          'flex items-start justify-between gap-4 mb-4',
          divided && 'pb-4 border-b border-border-subtle'
        )}>
          <div>
            {title && (
              <h2 className="text-base font-semibold text-text-primary">{title}</h2>
            )}
            {description && (
              <p className="text-xs text-text-muted mt-0.5">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Grid helpers — Grilles standardisées
// ─────────────────────────────────────────────────────────────────────────────

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

const colsClasses: Record<NonNullable<GridProps['cols']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export function Grid({ children, cols = 3, className }: GridProps) {
  return (
    <div className={cn('grid gap-4', colsClasses[cols], className)}>
      {children}
    </div>
  );
}
