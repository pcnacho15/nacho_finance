// Browser-only EVM helpers for sending USDT (ERC20). Non-custodial: built, signed
// and broadcast through the injected MetaMask provider (window.ethereum) via viem.
// Mirrors tron-client.ts. Receiving needs no code — just the address.

import {
  createWalletClient,
  custom,
  defineChain,
  getAddress,
  parseUnits,
  erc20Abi,
} from 'viem';

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_EVM_CHAIN_ID ?? '11155111');
const NETWORK = (process.env.NEXT_PUBLIC_EVM_NETWORK ?? 'sepolia').toLowerCase();
const USDT = process.env.NEXT_PUBLIC_EVM_USDT_CONTRACT ?? '';
const DECIMALS = 6;

interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}

// Access via cast instead of a global augmentation: the tronwallet EVM adapters
// already declare Window.ethereum with different modifiers, which would collide.
function getEth(): Eip1193Provider | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
}

export function getInjectedEth(): Eip1193Provider {
  const eth = getEth();
  if (!eth) throw new Error('MetaMask no está disponible');
  return eth;
}

/** Prompts MetaMask to connect and returns the selected address (lowercased). */
export async function connectEvm(): Promise<string> {
  const eth = getInjectedEth();
  const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[];
  if (!accounts?.length) throw new Error('No se autorizó ninguna cuenta');
  return accounts[0].toLowerCase();
}

/** Currently authorized account without prompting, or null. */
export async function getEvmAccount(): Promise<string | null> {
  const eth = getEth();
  if (!eth) return null;
  const accounts = (await eth.request({ method: 'eth_accounts' })) as string[];
  return accounts?.[0] ? accounts[0].toLowerCase() : null;
}

/**
 * Opens the wallet's account selector so the user can switch accounts, then returns
 * the newly selected address (lowercased). Uses EIP-2255 permissions.
 */
export async function switchEvmAccount(): Promise<string> {
  const eth = getInjectedEth();
  await eth.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
  const accounts = (await eth.request({ method: 'eth_accounts' })) as string[];
  if (!accounts?.length) throw new Error('No se seleccionó ninguna cuenta');
  return accounts[0].toLowerCase();
}

/**
 * Revokes the dApp's account permission (disconnect). Supported by MetaMask; other
 * injected wallets may ignore it (there is no standard programmatic disconnect).
 * Returns true if the wallet honored the revoke.
 */
export async function disconnectEvm(): Promise<boolean> {
  const eth = getEth();
  if (!eth) return false;
  try {
    await eth.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] });
    return true;
  } catch {
    return false;
  }
}

/** Subscribes to account changes; returns an unsubscribe function. */
export function subscribeAccounts(cb: (address: string | null) => void): () => void {
  const eth = getEth();
  if (!eth?.on) return () => undefined;
  const handler = (...args: unknown[]) => {
    const accs = args[0] as string[] | undefined;
    cb(accs?.[0] ? accs[0].toLowerCase() : null);
  };
  eth.on('accountsChanged', handler);
  return () => eth.removeListener?.('accountsChanged', handler);
}

async function assertEvmNetwork(eth: Eip1193Provider): Promise<void> {
  const hexId = (await eth.request({ method: 'eth_chainId' })) as string;
  const current = parseInt(hexId, 16);
  if (current !== CHAIN_ID) {
    throw new Error(
      `MetaMask está en otra red (chainId ${current}). Cambia a ${NETWORK} (chainId ${CHAIN_ID}).`,
    );
  }
}

export function evmExplorerTxUrl(hash: string): string {
  const host =
    NETWORK === 'sepolia'
      ? 'sepolia.etherscan.io'
      : NETWORK === 'goerli'
        ? 'goerli.etherscan.io'
        : 'etherscan.io';
  return `https://${host}/tx/${hash}`;
}

/** Builds, signs (MetaMask prompt) and broadcasts a USDT (ERC20) transfer. */
export async function sendUsdtEvm(to: string, amount: number): Promise<string> {
  if (!USDT) throw new Error('NEXT_PUBLIC_EVM_USDT_CONTRACT no configurado');
  const eth = getInjectedEth();
  await assertEvmNetwork(eth);

  const chain = defineChain({
    id: CHAIN_ID,
    name: NETWORK,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [] } },
  });
  const walletClient = createWalletClient({ chain, transport: custom(eth) });
  const [account] = await walletClient.getAddresses();
  if (!account) throw new Error('No hay cuenta conectada en MetaMask');

  const value = parseUnits(String(amount), DECIMALS);
  const hash = await walletClient.writeContract({
    account,
    address: getAddress(USDT),
    abi: erc20Abi,
    functionName: 'transfer',
    args: [getAddress(to), value],
  });
  return hash;
}
