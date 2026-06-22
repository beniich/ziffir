import { forwardRef, TextareaHTMLAttributes } from 'react';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, hint, fullWidth = true, showCount = false, className = '', id, maxLength, value, ...props }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const currentLength = String(value || '').length;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-300 mb-1.5">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          maxLength={maxLength}
          value={value}
          className={`
            w-full px-4 py-2.5 rounded-lg resize-y min-h-[80px]
            bg-obsidian-800/60 border
            ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-zaphir-500'}
            text-slate-200 placeholder:text-slate-500
            focus:outline-none focus:ring-1 focus:ring-zaphir-500/30
            transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed
            ${className}
          `}
          aria-invalid={!!error}
          {...props}
        />

        <div className="flex justify-between mt-1.5">
          {error ? (
            <p className="text-xs text-red-400" role="alert">{error}</p>
          ) : hint ? (
            <p className="text-xs text-slate-500">{hint}</p>
          ) : <span />}
          {showCount && maxLength && (
            <p className="text-xs text-slate-500">
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
