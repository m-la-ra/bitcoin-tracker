export interface BitcoinPrice {
  currency: string;
  rate: number;
  createdAt: string;
}

export interface BitcoinPriceResponse {
  headers: { date: string };
  bitcoin: {
    czk: number;
    eur: number;
  };
}
