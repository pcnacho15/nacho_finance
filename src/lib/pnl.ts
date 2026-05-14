// Average-cost-basis P&L over wallet transactions.
// buy / deposit-with-price -> acquisition; deposit-without-price -> added at
// current avg cost; sell -> realizes P&L; withdrawal -> leaves at avg cost.

export type PnlTxType = 'buy' | 'sell' | 'deposit' | 'withdrawal';

export interface PnlTransaction {
  type: PnlTxType;
  amount: number;
  pricePerUnit: number | null;
  date: string | Date;
}

export interface PnlTimelinePoint {
  date: string;
  realizedPnl: number;
  holdings: number;
  avgCost: number;
}

export interface PnlResult {
  holdings: number;
  avgCost: number;
  totalCost: number;
  realizedPnl: number;
  tradeCount: number;
  buyVolume: number;
  sellVolume: number;
  timeline: PnlTimelinePoint[];
  monthlyPnl: { month: string; realized: number }[];
}

function monthKey(date: string | Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function computePnl(transactions: PnlTransaction[]): PnlResult {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  let holdings = 0;
  let totalCost = 0;
  let realizedPnl = 0;
  let buyVolume = 0;
  let sellVolume = 0;
  let tradeCount = 0;
  const timeline: PnlTimelinePoint[] = [];
  const monthly = new Map<string, number>();

  for (const tx of sorted) {
    const amt = Number(tx.amount) || 0;
    const price = tx.pricePerUnit != null ? Number(tx.pricePerUnit) : null;
    const avgCost = holdings > 0 ? totalCost / holdings : 0;

    if (tx.type === 'buy' || (tx.type === 'deposit' && price != null)) {
      holdings += amt;
      totalCost += amt * (price ?? 0);
      if (tx.type === 'buy') {
        buyVolume += amt;
        tradeCount += 1;
      }
    } else if (tx.type === 'deposit') {
      // No price: increase holdings without moving the average cost.
      holdings += amt;
      totalCost += amt * avgCost;
    } else if (tx.type === 'sell') {
      const costRemoved = amt * avgCost;
      const proceeds = amt * (price ?? avgCost);
      const gain = proceeds - costRemoved;
      realizedPnl += gain;
      holdings = Math.max(0, holdings - amt);
      totalCost = Math.max(0, totalCost - costRemoved);
      sellVolume += amt;
      tradeCount += 1;
      monthly.set(monthKey(tx.date), (monthly.get(monthKey(tx.date)) ?? 0) + gain);
    } else {
      // withdrawal: leaves at avg cost, no realized P&L.
      const costRemoved = amt * avgCost;
      holdings = Math.max(0, holdings - amt);
      totalCost = Math.max(0, totalCost - costRemoved);
    }

    timeline.push({
      date: new Date(tx.date).toISOString(),
      realizedPnl,
      holdings,
      avgCost: holdings > 0 ? totalCost / holdings : 0,
    });
  }

  return {
    holdings,
    avgCost: holdings > 0 ? totalCost / holdings : 0,
    totalCost,
    realizedPnl,
    tradeCount,
    buyVolume,
    sellVolume,
    timeline,
    monthlyPnl: [...monthly.entries()]
      .map(([month, realized]) => ({ month, realized }))
      .sort((a, b) => a.month.localeCompare(b.month)),
  };
}
