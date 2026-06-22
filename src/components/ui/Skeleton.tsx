import { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  shimmer?: boolean;
}

export const Skeleton = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  shimmer = true,
  className = '',
  style,
  ...props
}: Props) => {
  const baseClasses = shimmer
    ? 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer'
    : 'bg-slate-800 animate-pulse';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl',
  };

  const getStyle = () => {
    const s: React.CSSProperties = { ...style };
    if (width) s.width = typeof width === 'number' ? `${width}px` : width;
    if (height) s.height = typeof height === 'number' ? `${height}px` : height;
    if (variant === 'text' && !height) s.height = '1em';
    if (variant === 'circular' && !width) {
      const w = typeof width === 'number' ? width : 40;
      s.width = `${w}px`;
      s.height = s.height || `${w}px`;
    }
    return s;
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} mb-2 last:mb-0`}
            style={{
              ...getStyle(),
              width: i === lines - 1 ? '70%' : (typeof width === 'string' ? width : '100%'),
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={getStyle()}
      aria-hidden="true"
      {...props}
    />
  );
};

// Composants préfabriqués
export const SkeletonCard = () => (
  <div className="p-5 rounded-2xl bg-obsidian-900/60 border border-slate-700/50 space-y-3">
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" lines={3} />
    <div className="flex gap-2 mt-4">
      <Skeleton variant="rounded" width={80} height={32} />
      <Skeleton variant="rounded" width={80} height={32} />
    </div>
  </div>
);

export const SkeletonList = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} variant="rounded" height={60} />
    ))}
  </div>
);
