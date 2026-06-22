import { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  hideCloseButton?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
  full: 'max-w-[95vw] h-[95vh]',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  closeOnEsc = true,
  hideCloseButton = false,
}: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Gestion clavier (Escape + Focus trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose();
      }

      // Focus trap simple
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    // Focus initial sur le premier élément focusable
    const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea'
    );
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnEsc]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={closeOnOverlay ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizeClasses[size]} glass-strong rounded-2xl shadow-2xl
          animate-slide-up ${size === 'full' ? 'flex flex-col' : ''}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description || !hideCloseButton) && (
          <header className="flex items-start justify-between gap-4 p-6 border-b border-slate-700/50">
            <div className="flex-1 min-w-0">
              {title && <h2 id="modal-title" className="text-xl font-bold text-slate-100">{title}</h2>}
              {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
            </div>
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </header>
        )}

        <div className={`p-6 ${size === 'full' ? 'flex-1 overflow-auto' : ''}`}>
          {children}
        </div>

        {footer && (
          <footer className="p-4 border-t border-slate-700/50 flex justify-end gap-2">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
};
