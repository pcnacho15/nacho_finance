import { NextResponse } from 'next/server';
import { requireRole, handleError } from '@/lib/api-utils';

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd&include_last_updated_at=true';

export async function GET() {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;

  try {
    const upstream = await fetch(COINGECKO_URL, { cache: 'no-store' });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'No se pudo obtener precio', status: upstream.status },
        { status: 502 },
      );
    }
    const data = (await upstream.json()) as {
      tether?: { usd?: number; last_updated_at?: number };
    };
    const price = data.tether?.usd;
    if (typeof price !== 'number') {
      return NextResponse.json({ error: 'Respuesta inválida' }, { status: 502 });
    }
    const fetchedAt = data.tether?.last_updated_at ? data.tether.last_updated_at * 1000 : Date.now();
    return NextResponse.json({ price, fetchedAt });
  } catch (error) {
    return handleError('GET /api/crypto/usdt/price', error);
  }
}
