import { Quote, EvaluatedQuote } from '../types';

export const BASE_DATE = new Date('2026-08-27');

function parseDateOnly(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getDaysDiff(d1: Date, d2: Date): number {
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function evaluateQuotes(quotes: Quote[]): EvaluatedQuote[] {
  // 1. Group quotes by PR no for median & lowest price calculation
  const prGroups: { [prNo: string]: Quote[] } = {};
  quotes.forEach((q) => {
    if (!prGroups[q.pr_no]) {
      prGroups[q.pr_no] = [];
    }
    prGroups[q.pr_no].push(q);
  });

  // 2. Group item codes by item names for discrepancy detection
  const itemNamesMap: { [itemCode: string]: Set<string> } = {};
  quotes.forEach((q) => {
    if (!itemNamesMap[q.item_code]) {
      itemNamesMap[q.item_code] = new Set<string>();
    }
    if (q.item_name) {
      itemNamesMap[q.item_code].add(q.item_name.trim());
    }
  });

  const mismatchItemCodes = new Set<string>();
  Object.keys(itemNamesMap).forEach((code) => {
    if (itemNamesMap[code].size >= 2) {
      mismatchItemCodes.add(code);
    }
  });

  // Pre-calculate medians and lowest per PR
  const prStats: {
    [prNo: string]: {
      median: number | null;
      validCount: number;
      lowestPriceId: string | null;
    };
  } = {};

  Object.keys(prGroups).forEach((prNo) => {
    const group = prGroups[prNo];
    const validPrices = group
      .map((q) => q.unit_price)
      .filter((p): p is number => p !== null && !isNaN(p));

    let median: number | null = null;
    if (validPrices.length > 0) {
      const sorted = [...validPrices].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      if (sorted.length % 2 === 0) {
        median = (sorted[mid - 1] + sorted[mid]) / 2;
      } else {
        median = sorted[mid];
      }
    }

    // Lowest price candidate calculation
    // Exclude outliers or nulls? PRD says: Candidate set = price_state ∈ {정상, 비교 불가}.
    // But to find outliers, we first need deviations.
    // Let's compute deviations for all valid prices in group first.
    let lowestId: string | null = null;
    let minPrice = Infinity;

    // First pass to determine price states for group
    const evaluatedGroupTemp = group.map((q) => {
      if (q.unit_price === null) {
        return { q, priceState: '단가 미기재' as const, dev: null };
      }
      if (validPrices.length < 3) {
        return { q, priceState: '비교 불가' as const, dev: 0 };
      }
      if (median === null) {
        return { q, priceState: '비교 불가' as const, dev: 0 };
      }
      const dev = ((q.unit_price - median) / median) * 100;
      const priceState = Math.abs(dev) > 30 ? ('이상치' as const) : ('정상' as const);
      return { q, priceState, dev };
    });

    // Candidates for lowest price: priceState ∈ {정상, 비교 불가}
    const lowestCandidates = evaluatedGroupTemp.filter(
      (item) => item.priceState === '정상' || item.priceState === '비교 불가'
    );

    if (lowestCandidates.length > 0) {
      // Sort by price ascending, then quote_date ascending, then quote_id ascending
      lowestCandidates.sort((a, b) => {
        const pA = a.q.unit_price ?? Infinity;
        const pB = b.q.unit_price ?? Infinity;
        if (pA !== pB) return pA - pB;
        const dateA = new Date(a.q.quote_date).getTime();
        const dateB = new Date(b.q.quote_date).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.q.quote_id.localeCompare(b.q.quote_id);
      });
      lowestId = lowestCandidates[0].q.quote_id;
    } else {
      // Fallback if all are outliers, pick absolute min valid price
      const validGroup = group.filter((q) => q.unit_price !== null);
      if (validGroup.length > 0) {
        validGroup.sort((a, b) => (a.unit_price! - b.unit_price!));
        lowestId = validGroup[0].quote_id;
      }
    }

    prStats[prNo] = {
      median,
      validCount: validPrices.length,
      lowestPriceId: lowestId,
    };
  });

  // 3. Evaluate each quote fully
  return quotes.map((q) => {
    const stats = prStats[q.pr_no] || { median: null, validCount: 0, lowestPriceId: null };
    
    let priceDeviationPct: number | null = null;
    let priceState: EvaluatedQuote['priceState'] = '단가 미기재';

    if (q.unit_price !== null && stats.median !== null) {
      priceDeviationPct = Number((((q.unit_price - stats.median) / stats.median) * 100).toFixed(1));
      if (stats.validCount < 3) {
        priceState = '비교 불가';
      } else if (Math.abs(priceDeviationPct) > 30) {
        priceState = '이상치';
      } else {
        priceState = '정상';
      }
    }

    const isLowestPrice = stats.lowestPriceId === q.quote_id;

    // Delivery calculation
    const promised = parseDateOnly(q.promised_date);
    const required = parseDateOnly(q.required_date);
    
    let dDay: number | null = null;
    let dDayStr = '-';
    let deliveryState: EvaluatedQuote['deliveryState'] = '판정 대상 아님';
    let isOverRequiredDate = false;

    if (q.status === '견적') {
      deliveryState = '판정 대상 아님';
    } else if (!promised) {
      deliveryState = '납기 미기재';
    } else {
      // D = promised_date - BASE_DATE
      // If promised is 2026-08-27 and BASE is 2026-08-27 -> 0
      dDay = getDaysDiff(promised, BASE_DATE);
      if (dDay > 0) {
        dDayStr = `D-${dDay}`;
      } else if (dDay === 0) {
        dDayStr = 'D-DAY';
      } else {
        dDayStr = `D+${Math.abs(dDay)}`;
      }

      // 3-tier rules:
      // D < 0 -> 지연
      // 0 <= D <= 7 -> 임박
      // D > 7 -> 정상
      if (dDay < 0) {
        deliveryState = '지연';
      } else if (dDay <= 7) {
        deliveryState = '임박';
      } else {
        deliveryState = '정상';
      }
    }

    if (promised && required) {
      isOverRequiredDate = promised.getTime() > required.getTime();
    }

    const isNameMismatch = mismatchItemCodes.has(q.item_code);
    const isIssuedNotLowest = q.status === '발주' && !isLowestPrice;

    return {
      ...q,
      dDay,
      dDayStr,
      priceMedian: stats.median,
      priceDeviationPct,
      priceState,
      isLowestPrice,
      deliveryState,
      isOverRequiredDate,
      isNameMismatch,
      isIssuedNotLowest,
    };
  });
}
