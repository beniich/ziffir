import { useState, ReactNode } from 'react';

type Position = 'top' | 'bottom' | 'left' | 'right';

interface Props {
  content: ReactNode;
  children: ReactNode;
  position?: Position;
  delay?: number;
  disabled?: boolean;
}

const positionClasses: Record<Position, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses: Record<Position, string> = {
  top:    'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-slate-800',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-slate-800',
  left:   'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-slate-800',
  right:  'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-slate-800',
};

export const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 200,
  disabled = false,
}: Props) => {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const show = () => {
    if (disabled) return;
    const id = setTimeout(() => setVisible(true), delay);
    setTimeoutId(id);
  };

  const hide = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setVisible(false);
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && !disabled && (
        <span
          role="tooltip"
          className={`
            absolute z-50 px-2.5 py-1.5 rounded-md
            bg-slate-800 border border-slate-700 text-xs text-slate-200
            whitespace-nowrap shadow-lg pointer-events-none
            animate-fade-in
            ${positionClasses[position]}
          `}
        >
          {content}
          <span
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          />
        </span>
      )}
    </span>
  );
};
