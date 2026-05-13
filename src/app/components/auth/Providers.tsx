'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthDialogProvider } from './AuthDialogProvider';

export function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthDialogProvider>{children}</AuthDialogProvider>
    </SessionProvider>
  );
}
