import { ReactNode } from 'react';

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'compact';
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  variant = 'default',
}: Props) => {
  if (variant === 'compact') {
    return (
      <div className="text-center py-6 px-4">
        {icon && <div className="text-3xl mb-2 opacity-50">{icon}</div>}
        <p className="text-sm font-medium text-slate-300">{title}</p>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-4 w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center text-3xl text-slate-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
