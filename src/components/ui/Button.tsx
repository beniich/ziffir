import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'      // Or Zaphir (action principale)
  | 'secondary'    // Slate (action secondaire)
  | 'ghost'        // Transparent (action tertiaire)
  | 'danger'       // Rouge (action destructrice)
  | 'success'      // Vert (validation)
  | 'cyber'        // Cyan/Magenta (effet futuriste)
  | 'outline';     // Bordure uniquement

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  rounded?: 'default' | 'full' | 'none';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-zaphir-500 to-zaphir-600 hover:from-zaphir-400 hover:to-zaphir-500 text-obsidian-950 shadow-md hover:shadow-glow-gold',
  secondary: 'bg-obsidian-800 hover:bg-obsidian-700 text-slate-200 border border-slate-700 hover:border-slate-600',
  ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-slate-100',
  danger: 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 hover:text-red-200',
  success: 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300',
  cyber: 'bg-gradient-to-r from-cyber-cyan/80 to-cyber-magenta/80 hover:from-cyber-cyan hover:to-cyber-magenta text-obsidian-950 shadow-cyber',
  outline: 'bg-transparent border-2 border-zaphir-500/50 hover:border-zaphir-500 hover:bg-zaphir-500/10 text-zaphir-300',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-base gap-2',
  xl: 'px-7 py-3.5 text-lg gap-2.5',
};

const roundedClasses = {
  default: 'rounded-lg',
  full: 'rounded-full',
  none: 'rounded-none',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = 'default',
      className = '',
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`
          inline-flex items-center justify-center font-medium
          transition-all duration-200 ease-out
          disabled:opacity-40 disabled:cursor-not-allowed
          active:scale-[0.97]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zaphir-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian-950
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${roundedClasses[rounded]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
            <span className="sr-only">Chargement...</span>
            {children && <span className="opacity-70">{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0 inline-flex">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0 inline-flex">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
