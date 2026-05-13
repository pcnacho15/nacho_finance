'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { AuthDialog } from './AuthDialog';

export type AuthMode = 'login' | 'register';

interface AuthDialogContextValue {
  open: (mode?: AuthMode) => void;
  close: () => void;
  isOpen: boolean;
  mode: AuthMode;
}

const AuthDialogContext = createContext<AuthDialogContextValue | undefined>(undefined);

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');

  const open = useCallback((nextMode: AuthMode = 'login') => {
    setMode(nextMode);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <AuthDialogContext.Provider value={{ open, close, isOpen, mode }}>
      {children}
      <AuthDialog open={isOpen} mode={mode} onOpenChange={setIsOpen} onModeChange={setMode} />
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog(): AuthDialogContextValue {
  const ctx = useContext(AuthDialogContext);
  if (!ctx) throw new Error('useAuthDialog debe usarse dentro de AuthDialogProvider');
  return ctx;
}
