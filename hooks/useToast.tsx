'use client';

import * as React from 'react';
import type { ToastProps } from '@/components/ui/toast';

interface ToastEntry extends ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastState {
  toasts: ToastEntry[];
}

type ToastAction =
  | { type: 'ADD'; toast: ToastEntry }
  | { type: 'REMOVE'; id: string };

const MAX_TOASTS = 5;

function reducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD':
      return {
        toasts: [action.toast, ...state.toasts].slice(0, MAX_TOASTS),
      };
    case 'REMOVE':
      return {
        toasts: state.toasts.filter((t) => t.id !== action.id),
      };
    default:
      return state;
  }
}

const ToastContext = React.createContext<{
  toast: (opts: Omit<ToastEntry, 'id'>) => void;
  toasts: ToastEntry[];
} | null>(null);

let idCounter = 0;

export function ToastContextProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] });

  const toast = React.useCallback((opts: Omit<ToastEntry, 'id'>) => {
    const id = String(++idCounter);
    dispatch({ type: 'ADD', toast: { ...opts, id } });
    setTimeout(() => {
      dispatch({ type: 'REMOVE', id });
    }, opts.duration ?? 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toasts: state.toasts }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastContextProvider');
  return ctx;
}
