import type { Manager, Holding, ProcessedData } from '@/types';

export function parseHoldingsData(rawData: any[]): Manager[] {
  return rawData.map((mgr: any) => {
    const holdings: Holding[] = (mgr.top_holdings || []).map((h: any) => {
      const companyText = h.company || '';

      // Extract percentage from company text
      const percentageMatch = companyText.match(/(\d+\.?\d*)%/);
      const percentage = percentageMatch ? parseFloat(percentageMatch[1]) : 0;

      // Extract reported price
      const priceMatch = companyText.match(/\$([\d,]+\.?\d*)/);
      const reportedPrice = priceMatch ? priceMatch[1] : '';

      // Clean company name
      const companyName = companyText
        .replace(/\d+\.?\d*% of portfolio.*/, '')
        .replace(/Reported Price\*: \$[\d,]+\.?\d*/, '')
        .trim();

      return {
        symbol: h.symbol || '',
        company: companyName,
        percentage,
        reportedPrice,
      };
    });

    return {
      id: mgr.manager_id,
      name: mgr.manager_name,
      portfolioValue: mgr.portfolio_value,
      stockCount: parseInt(mgr.stock_count) || 0,
      holdings,
      updatedAt: mgr.updated_at,
    };
  });
}

export function processData(managers: Manager[]): ProcessedData {
  const allHoldings: Map<string, { count: number; percentage: number; managers: string[] }> = new Map();

  managers.forEach((manager) => {
    manager.holdings.forEach((holding) => {
      const existing = allHoldings.get(holding.symbol) || {
        count: 0,
        percentage: 0,
        managers: [],
      };
      existing.count += 1;
      existing.percentage += holding.percentage;
      existing.managers.push(manager.name);
      allHoldings.set(holding.symbol, existing);
    });
  });

  const topHoldings = Array.from(allHoldings.entries())
    .map(([symbol, data]) => ({
      symbol,
      ...data,
      avgPercentage: data.percentage / data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const industryMap = new Map<string, number>();

  topHoldings.forEach((holding) => {
    const industry = getIndustry(holding.symbol);
    industryMap.set(industry, (industryMap.get(industry) || 0) + holding.count);
  });

  const industryDistribution = Array.from(industryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return {
    totalManagers: managers.length,
    totalHoldings: Array.from(allHoldings.values()).reduce((sum, h) => sum + h.count, 0),
    topHoldings,
    industryDistribution,
  };
}

function getIndustry(symbol: string): string {
  const industries: Record<string, string> = {
    AAPL: 'Technology',
    MSFT: 'Technology',
    GOOGL: 'Technology',
    GOOG: 'Technology',
    AMZN: 'Consumer Cyclical',
    TSLA: 'Consumer Cyclical',
    META: 'Technology',
    NVDA: 'Technology',
    BRK_B: 'Financial',
    BRK_A: 'Financial',
    JNJ: 'Healthcare',
    UNH: 'Healthcare',
    V: 'Financial',
    PG: 'Consumer Defensive',
    JPM: 'Financial',
    MA: 'Financial',
    HD: 'Consumer Cyclical',
    BAC: 'Financial',
    XOM: 'Energy',
    PFE: 'Healthcare',
    CSCO: 'Technology',
    ADBE: 'Technology',
    CRM: 'Technology',
    WMT: 'Consumer Defensive',
    MCD: 'Consumer Cyclical',
    NFLX: 'Technology',
    AMD: 'Technology',
    CMCSA: 'Communication',
    NKE: 'Consumer Cyclical',
    DIS: 'Communication',
    INTC: 'Technology',
    VZ: 'Communication',
    KO: 'Consumer Defensive',
    MRK: 'Healthcare',
    PE: 'Energy',
    CVX: 'Energy',
    ABBV: 'Healthcare',
    TMO: 'Healthcare',
    AVGO: 'Technology',
    COST: 'Consumer Defensive',
    C: 'Financial',
    WFC: 'Financial',
    GS: 'Financial',
    MS: 'Financial',
    BLK: 'Financial',
    SCHW: 'Financial',
    LLY: 'Healthcare',
    DHR: 'Healthcare',
    ABT: 'Healthcare',
    UPS: 'Industrials',
    HON: 'Industrials',
    UNP: 'Industrials',
    BA: 'Industrials',
    CAT: 'Industrials',
    GE: 'Industrials',
  };

  return industries[symbol] || 'Other';
}

export function generateMockPerformanceData(symbol: string) {
  const periods = ['5Y', '2Y', '1Y', '6M'];
  const baseReturn = Math.random() * 200 - 50; // -50% to +150%

  return periods.map((period) => ({
    period,
    return: baseReturn * (Math.random() * 0.5 + 0.75),
  }));
}
