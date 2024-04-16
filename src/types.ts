export interface BitcoinPrice {
  currency: string;
  rate: number;
  date: string;
  time: string;
}

export interface AverageDailyPrices {
  averageDailyPriceCZK: number | null;
  averageDailyPriceEUR: number | null;
  month: string;
  date: string;
}

export interface AverageMonthlyPrices {
  averageMonthlyPriceCZK: number | null;
  averageMonthlyPriceEUR: number | null;
  month: string;
}

export interface BitcoinPriceResponse {
  headers: { date: string };
  bitcoin: {
    czk: number;
    eur: number;
  };
}
