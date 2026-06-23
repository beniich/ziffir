import { HTMLAttributes, forwardRef, ReactNode } from 'react';

export type CardVariant = 'default' | 'glass' | 'glass-strong' | 'elevated' | 'cyber' | 'gold';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  glow?: boolean;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  default:       'bg-obsidian-900/60 border border-slate-700/50',
  glass:         'glass-panel',
  'glass-strong':'glass-panel',
  elevated:      'bg-gradient-to-br from-obsidian-800/80 to-obsidian-900/60 border border-slate-700/50 shadow-xl',
  cyber:         'bg-obsidian-900 border border-cyber-cyan/30 shadow-cyber',
  gold:          'bg-gradient-to-br from-zaphir-500/10 to-obsidian-900/60 border border-zaphir-500/30 shadow-glow-gold',
};

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
  xl: 'p-9',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      glow = false,
      hoverable = false,
      interactive = false,
      padding = 'md',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-2xl
          ${variantClasses[variant]}
          ${paddingClasses[padding]}
          ${glow ? 'shadow-glow-gold' : ''}
          ${hoverable || interactive ? 'transition-all duration-300 hover:-translate-y-0.5' : ''}
          ${hoverable ? 'hover:border-zaphir-500/50 hover:shadow-glow-gold cursor-pointer' : ''}
          ${interactive ? 'cursor-pointer active:scale-[0.99]' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ════════════════════════════════════════════════════════════
// Sous-composants
// ════════════════════════════════════════════════════════════

export const CardHeader = ({
  children,
  className = '',
  divided = false,
}: {
  children: ReactNode;
  className?: string;
  divided?: boolean;
}) => (
  <div className={`mb-4 ${divided ? 'pb-4 border-b border-slate-700/50' : ''} ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({
  children,
  className = '',
  as: Tag = 'h3',
}: {
  children: ReactNode;
  className?: string;
  as?: 'h2' | 'h3' | 'h4';
}) => (
  <Tag className={`text-lg font-bold text-slate-100 ${className}`}>{children}</Tag>
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => <p className={`text-sm text-slate-400 mt-1 ${className}`}>{children}</p>;

export const CardFooter = ({
  children,
  className = '',
  divided = true,
}: {
  children: ReactNode;
  className?: string;
  divided?: boolean;
}) => (
  <div className={`mt-4 ${divided ? 'pt-4 border-t border-slate-700/50' : ''} ${className}`}>
    {children}
  </div>
);
