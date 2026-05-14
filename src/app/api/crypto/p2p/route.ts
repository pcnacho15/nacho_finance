import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/api-utils';
import { fetchP2POffers, type P2PSide } from '@/lib/binance-p2p';

export async function GET(request: Request) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;

  const { searchParams } = new URL(request.url);
  const side: P2PSide = searchParams.get('side') === 'sell' ? 'sell' : 'buy';
  const payType = searchParams.get('payType') || undefined;
  const amountRaw = searchParams.get('amount');
  const amount = amountRaw ? Number(amountRaw) : undefined;

  try {
    const offers = await fetchP2POffers({
      side,
      payType,
      amount: amount && Number.isFinite(amount) && amount > 0 ? amount : undefined,
    });
    return NextResponse.json({ side, offers });
  } catch (error) {
    console.error('[GET /api/crypto/p2p]', error);
    return NextResponse.json(
      { side, offers: [], error: 'No se pudieron obtener las ofertas P2P en este momento.' },
      { status: 502 },
    );
  }
}
