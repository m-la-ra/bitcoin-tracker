export interface BitcoinPrice {
  currency: string;
  rate: number;
  date: string;
  time: string;
}

export interface AverageDailyPrices {
  CZK: number | null;
  EUR: number | null;
  date: string;
}

export interface AverageMonthlyPrices {
  id: string;
  CZK: number | null;
  EUR: number | null;
}

export interface BitcoinPriceResponse {
  headers: { date: string };
  bitcoin: {
    czk: number;
    eur: number;
  };
}
