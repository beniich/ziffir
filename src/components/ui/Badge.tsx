import { ReactNode } from 'react';

export type BadgeVariant =
  | 'default' | 'success' | 'warning' | 'danger' | 'info'
  | 'gold' | 'cyber' | 'purple' | 'neutral';

interface Props {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  pulse?: boolean;
  dot?: boolean;
  icon?: ReactNode;
  outline?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-slate-700/50 text-slate-300 border-slate-600',
  neutral:  'bg-slate-800 text-slate-400 border-slate-700',
  success:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  warning:  'bg-amber-500/20 text-amber-300 border-amber-500/40',
  danger:   'bg-red-500/20 text-red-300 border-red-500/40',
  info:     'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  gold:     'bg-zaphir-500/20 text-zaphir-300 border-zaphir-500/40',
  cyber:    'bg-gradient-to-r from-cyber-cyan/20 to-cyber-magenta/20 text-cyan-300 border-cyan-500/40',
  purple:   'bg-purple-500/20 text-purple-300 border-purple-500/40',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
  lg: 'px-3 py-1.5 text-base gap-2',
};

export const Badge = ({
  variant = 'default',
  size = 'sm',
  children,
  pulse = false,
  dot = false,
  icon,
  outline = false,
}: Props) => {
  const baseClasses = variantClasses[variant];
  const outlineClasses = outline ? 'bg-transparent' : '';

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium whitespace-nowrap
        ${baseClasses}
        ${outlineClasses}
        ${sizeClasses[size]}
      `}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {dot && !pulse && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </span>
  );
};
