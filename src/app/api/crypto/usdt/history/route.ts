import { NextResponse } from 'next/server';
import { requireRole, handleError } from '@/lib/api-utils';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/tether/market_chart';
const ALLOWED_DAYS = new Set(['1', '7', '30', '90', '365']);

export async function GET(request: Request) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;

  const { searchParams } = new URL(request.url);
  const requested = searchParams.get('days') ?? '7';
  const days = ALLOWED_DAYS.has(requested) ? requested : '7';

  try {
    const upstream = await fetch(
      `${COINGECKO_URL}?vs_currency=usd&days=${days}`,
      { next: { revalidate: 300 } },
    );
    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'No se pudo obtener histórico', status: upstream.status },
        { status: 502 },
      );
    }
    const data = (await upstream.json()) as { prices?: [number, number][] };
    const points = (data.prices ?? []).map(([t, price]) => ({ t, price }));
    return NextResponse.json({ days, points });
  } catch (error) {
    return handleError('GET /api/crypto/usdt/history', error);
  }
}
