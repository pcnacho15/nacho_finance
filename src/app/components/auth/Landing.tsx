'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@/components/ui/button';
import { useAuthDialog, type AuthMode } from './AuthDialogProvider';

const isAuthMode = (value: string | null): value is AuthMode =>
  value === 'login' || value === 'register';

export default function Landing() {
  const { open } = useAuthDialog();
  const params = useSearchParams();
  const initial = params.get('auth');

  useEffect(() => {
    if (isAuthMode(initial)) open(initial);
  }, [initial, open]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="size-20 rounded-2xl bg-foreground/5 flex items-center justify-center">
            <Icon icon="game-icons:nachos" className="size-12" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Nacho Finance</h1>
          <p className="text-muted-foreground">
            Toma control de tus ingresos, gastos, deudas y ahorros en un solo lugar.
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <Button size="lg" onClick={() => open('login')}>
            Iniciar sesión
          </Button>
          <Button size="lg" variant="outline" onClick={() => open('register')}>
            Crear cuenta
          </Button>
        </div>
      </div>
    </div>
  );
}
