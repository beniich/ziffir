import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: Option[];
  placeholder?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, hint, options, placeholder, fullWidth = true, leftIcon, className = '', id, required, ...props }, ref) => {
    const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-300 mb-1.5">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {leftIcon}
            </span>
          )}

          <select
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-2.5 pr-10 rounded-lg appearance-none cursor-pointer
              bg-obsidian-800/60 border
              ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-zaphir-500'}
              text-slate-200
              focus:outline-none focus:ring-1 focus:ring-zaphir-500/30
              transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-10' : ''}
              ${className}
            `}
            aria-invalid={!!error}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {error && <p className="mt-1.5 text-xs text-red-400" role="alert">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
