'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { Icon } from '@iconify/react/dist/iconify.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReceiveUsdtDialogProps {
  open: boolean;
  address: string;
  network?: string | null;
  onClose: () => void;
}

const ReceiveUsdtDialog: React.FC<ReceiveUsdtDialogProps> = ({
  open,
  address,
  network,
  onClose,
}) => {
  const net = network || 'TRC20';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success('Dirección copiada');
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recibir USDT</DialogTitle>
          <DialogDescription>
            Comparte esta dirección para recibir USDT. Envía solo USDT {net} a esta dirección.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="rounded-lg bg-white p-3">
            <QRCodeSVG value={address} size={180} />
          </div>
          <code className="text-xs font-mono break-all text-center px-2">{address}</code>
          <Button variant="outline" onClick={copy} className="w-full">
            <Icon icon="solar:copy-bold" className="size-4 mr-1" />
            Copiar dirección
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveUsdtDialog;
