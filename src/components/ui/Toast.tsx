import { create } from 'zustand';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastState {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

// Helper API
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().show({ type: 'success', title, description }),
  error:   (title: string, description?: string) =>
    useToastStore.getState().show({ type: 'error', title, description, duration: 6000 }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().show({ type: 'warning', title, description }),
  info:    (title: string, description?: string) =>
    useToastStore.getState().show({ type: 'info', title, description }),
};

const typeConfig = {
  success: { icon: CheckCircle, color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
  error:   { icon: XCircle,     color: 'text-red-400',     border: 'border-red-500/40',     bg: 'bg-red-500/10'     },
  warning: { icon: AlertCircle, color: 'text-amber-400',   border: 'border-amber-500/40',   bg: 'bg-amber-500/10'   },
  info:    { icon: Info,        color: 'text-cyan-400',    border: 'border-cyan-500/40',    bg: 'bg-cyan-500/10'    },
};

const ToastItem = ({ toast: t }: { toast: Toast }) => {
  const dismiss = useToastStore((s) => s.dismiss);
  const config = typeConfig[t.type];
  const Icon = config.icon;
  const duration = t.duration ?? 4000;

  useEffect(() => {
    if (duration <= 0) return;
    const id = setTimeout(() => dismiss(t.id), duration);
    return () => clearTimeout(id);
  }, [t.id, duration, dismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        glass-strong rounded-xl border ${config.border} ${config.bg}
        p-4 min-w-[320px] max-w-md shadow-2xl
        animate-slide-up
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.color} shrink-0 mt-0.5`} />

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-100 text-sm">{t.title}</h4>
          {t.description && (
            <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
          )}
          {t.action && (
            <button
              onClick={() => { t.action!.onClick(); dismiss(t.id); }}
              className={`mt-2 text-xs font-semibold ${config.color} hover:underline`}
            >
              {t.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => dismiss(t.id)}
          className="shrink-0 p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer = () => {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>,
    document.body
  );
};
