export interface BitcoinPrice {
  currency: string;
  rate: number;
  date: string;
  time: string;
}

export interface AverageDailyPrices {
  averagePriceCZK: number;
  averagePriceEUR: number;
  date: string;
}

export interface BitcoinPriceResponse {
  headers: { date: string };
  bitcoin: {
    czk: number;
    eur: number;
  };
}
