export interface Holding {
  symbol: string;
  company: string;
  percentage: number;
  reportedPrice: string;
}

export interface Manager {
  id: string;
  name: string;
  portfolioValue: string;
  stockCount: number;
  holdings: Holding[];
  updatedAt: string;
}

export interface ProcessedData {
  totalManagers: number;
  totalHoldings: number;
  topHoldings: Array<{
    symbol: string;
    count: number;
    percentage: number;
    managers: string[];
    avgPercentage: number;
  }>;
  industryDistribution: Array<{
    name: string;
    value: number;
  }>;
}

export interface PerformanceData {
  period: string;
  return: number;
}

export interface User {
  id: string;
  email: string;
  preferences: {
    favoriteManagers: string[];
    alertThreshold: number;
    watchlist: string[];
  };
}
