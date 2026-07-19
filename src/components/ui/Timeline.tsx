import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, Clock, AlertCircle, XCircle, Dot } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Timeline — Historique d'événements
// Usage :
//   <Timeline items={history} />
// ─────────────────────────────────────────────────────────────────────────────

export type TimelineVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  variant?: TimelineVariant;
  icon?: ReactNode;
  actor?: string;
  meta?: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  compact?: boolean;
}

const defaultIcons: Record<TimelineVariant, ReactNode> = {
  success: <CheckCircle2 size={14} />,
  warning: <AlertCircle size={14} />,
  danger:  <XCircle size={14} />,
  info:    <Clock size={14} />,
  neutral: <Dot size={14} />,
};

const variantDotClasses: Record<TimelineVariant, string> = {
  success: 'bg-emerald-500 text-emerald-900',
  warning: 'bg-amber-500 text-amber-900',
  danger:  'bg-red-500 text-red-900',
  info:    'bg-sky-500 text-sky-900',
  neutral: 'bg-slate-600 text-slate-200',
};

export function Timeline({ items, className, compact = false }: TimelineProps) {
  if (!items.length) {
    return (
      <div className="py-8 text-center text-text-muted text-sm">
        Aucun événement enregistré
      </div>
    );
  }

  return (
    <ol className={cn('relative', className)}>
      {items.map((item, idx) => {
        const variant = item.variant ?? 'neutral';
        const isLast = idx === items.length - 1;

        return (
          <li key={item.id} className={cn('flex gap-3', !isLast && 'pb-5')}>
            {/* Dot + connector line */}
            <div className="relative flex flex-col items-center">
              <span className={cn(
                'z-10 flex items-center justify-center rounded-full shrink-0',
                compact ? 'w-5 h-5' : 'w-7 h-7',
                variantDotClasses[variant]
              )}>
                {item.icon ?? defaultIcons[variant]}
              </span>
              {!isLast && (
                <span className="w-px flex-1 bg-border-subtle mt-1" />
              )}
            </div>

            {/* Content */}
            <div className={cn('flex-1 min-w-0', !isLast && 'pb-1')}>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <p className={cn('font-medium text-text-primary', compact ? 'text-xs' : 'text-sm')}>
                  {item.title}
                </p>
                {item.timestamp && (
                  <time className="text-xs text-text-muted shrink-0 mt-0.5">{item.timestamp}</time>
                )}
              </div>

              {item.description && (
                <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>
              )}

              {(item.actor || item.meta) && (
                <div className="flex items-center gap-3 mt-1">
                  {item.actor && (
                    <span className="text-xs text-text-muted">
                      par <span className="text-text-accent">{item.actor}</span>
                    </span>
                  )}
                  {item.meta && <span className="text-xs">{item.meta}</span>}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
