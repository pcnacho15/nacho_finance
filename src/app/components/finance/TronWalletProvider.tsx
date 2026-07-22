'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletModalProvider } from '@tronweb3/tronwallet-adapter-react-ui';
import { TronLinkAdapter, WalletConnectAdapter } from '@tronweb3/tronwallet-adapters';
import '@tronweb3/tronwallet-adapter-react-ui/style.css';

// Maps our lowercase env network to the TRON WalletConnect ChainNetwork name.
const WC_NETWORK =
  { nile: 'Nile', shasta: 'Shasta', mainnet: 'Mainnet' }[
    (process.env.NEXT_PUBLIC_TRON_NETWORK ?? 'nile').toLowerCase()
  ] ?? 'Nile';

// Mounts the TRON wallet context. Adapters are created after mount so their
// constructors (which touch window) never run during SSR. The provider still
// renders on the server with an empty adapter list, so children can safely call
// useWallet() from the first render. WalletConnect is added only when a Reown
// (WalletConnect Cloud) projectId is configured — enables mobile wallets like
// TronLink Mobile / Trust Wallet via QR.
export default function TronWalletProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const adapters = useMemo(() => {
    if (!mounted) return [];
    const list: Array<TronLinkAdapter | WalletConnectAdapter> = [new TronLinkAdapter()];
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    if (projectId) {
      list.push(
        new WalletConnectAdapter({
          network: WC_NETWORK,
          options: {
            projectId,
            metadata: {
              name: 'Nacho Finance',
              description: 'Gestión de finanzas y USDT en la red TRON',
              url: typeof window !== 'undefined' ? window.location.origin : '',
              icons: [
                typeof window !== 'undefined' ? `${window.location.origin}/favicon.svg` : '',
              ],
            },
          },
        }),
      );
    }
    return list;
  }, [mounted]);

  return (
    <WalletProvider
      adapters={adapters}
      autoConnect={mounted}
      onError={(e) => console.error('[tron-wallet]', e)}
    >
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  );
}
