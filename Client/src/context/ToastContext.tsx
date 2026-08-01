import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { id, type, title, message };

    setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const showSuccess = useCallback((message: string, title?: string) => showToast(message, 'success', title || 'Success'), [showToast]);
  const showError = useCallback((message: string, title?: string) => showToast(message, 'error', title || 'Notice'), [showToast]);
  const showInfo = useCallback((message: string, title?: string) => showToast(message, 'info', title || 'Information'), [showToast]);
  const showWarning = useCallback((message: string, title?: string) => showToast(message, 'warning', title || 'Warning'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}

      {/* Toast Notification Container */}
      <div className="fixed top-5 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100';
          let icon = <Info size={18} className="text-blue-500 shrink-0" />;

          if (toast.type === 'success') {
            bgClass = 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100';
            icon = <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />;
          } else if (toast.type === 'error') {
            bgClass = 'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-100';
            icon = <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />;
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-50 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-100';
            icon = <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />;
          } else if (toast.type === 'info') {
            bgClass = 'bg-blue-50 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-100';
            icon = <Info size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`p-3.5 rounded-2xl border shadow-premium pointer-events-auto flex items-start gap-3 transition-all duration-300 transform translate-y-0 animate-fade-in ${bgClass}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h5 className="text-xs font-extrabold tracking-tight mb-0.5">{toast.title}</h5>
                )}
                <p className="text-xs font-medium leading-relaxed opacity-90">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    return {
      showToast: (message: string) => console.log('Toast:', message),
      showSuccess: (message: string) => console.log('Success Toast:', message),
      showError: (message: string) => console.warn('Error Toast:', message),
      showInfo: (message: string) => console.log('Info Toast:', message),
      showWarning: (message: string) => console.warn('Warning Toast:', message),
    };
  }
  return context;
};
