import { Loader2 } from 'lucide-react';

type SpinnerVariant = 'spinner' | 'dots' | 'pulse' | 'bars';
type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  label?: string;
  fullScreen?: boolean;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const sizePx: Record<SpinnerSize, number> = {
  sm: 16, md: 24, lg: 32, xl: 48,
};

export const Spinner = ({ variant = 'spinner', size = 'md', label, fullScreen = false }: Props) => {
  const content = (
    <div className="flex flex-col items-center gap-3" role="status" aria-label={label || 'Chargement'}>
      {variant === 'spinner' && (
        <Loader2 className={`${sizeClasses[size]} text-zaphir-400 animate-spin`} />
      )}

      {variant === 'dots' && (
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="rounded-full bg-zaphir-400 animate-pulse"
              style={{
                width: sizePx[size] / 3,
                height: sizePx[size] / 3,
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
      )}

      {variant === 'pulse' && (
        <div className={`${sizeClasses[size]} rounded-full bg-zaphir-400 animate-ping`} />
      )}

      {variant === 'bars' && (
        <div className="flex gap-1 items-end" style={{ height: sizePx[size] }}>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-1 bg-zaphir-400 rounded-full animate-pulse"
              style={{
                height: '100%',
                animationDelay: `${i * 100}ms`,
                animationDuration: '800ms',
              }}
            />
          ))}
        </div>
      )}

      {label && <span className="text-sm text-slate-400">{label}</span>}
      <span className="sr-only">{label || 'Chargement en cours'}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-obsidian-950/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};
