import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
  showPasswordToggle?: boolean;
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

export const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = true,
      inputSize = 'md',
      showPasswordToggle = false,
      className = '',
      id,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const actualType = isPassword && showPassword ? 'text' : type;
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-300 mb-1.5">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none inline-flex">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            className={`
              w-full rounded-lg
              bg-obsidian-800/60 border
              ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-zaphir-500'}
              text-slate-200 placeholder:text-slate-500
              focus:outline-none focus:ring-1 focus:ring-zaphir-500/30
              transition-all duration-150
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || (isPassword && showPasswordToggle) ? 'pr-10' : ''}
              disabled:opacity-40 disabled:cursor-not-allowed
              ${sizeClasses[inputSize]}
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {(rightIcon || (isPassword && showPasswordToggle)) && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex">
              {isPassword && showPasswordToggle ? (
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              ) : (
                <span className="text-slate-500 pointer-events-none">{rightIcon}</span>
              )}
            </span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-slate-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
