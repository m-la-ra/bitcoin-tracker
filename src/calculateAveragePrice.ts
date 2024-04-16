import db from "./lowdb";

export const calculateAveragePrice = (currency: string, date: string) => {
  return db
    .get("bitcoinPrices")
    .filter({ currency: currency, date: date })
    .map("rate")
    .uniq()
    .mean()
    .value();
};

export const calculateMonthlyAveragePrice = (
  currency: string,
  month: string
) => {
  return db
    .get("averageDailyPrices")
    .filter({ month: month })
    .map(currency)
    .uniq()
    .mean()
    .value();
};
