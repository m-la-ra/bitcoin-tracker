import db from "./lowdb";
const _ = require("lodash");

export const calculateAveragePrice = (currency: string, date: string) => {
  return db
    .get("bitcoinPrices")
    .filter({ currency: currency, date: date })
    .map("rate")
    .uniq()
    .mean()
    .value();
};

export const calculateMonthlyAveragePrice = (currency: string) => {
  const dailyValues = db.get("averageDailyPrices").value();

  const monthlyValues = _.groupBy(dailyValues, (dailyValue: any) => {
    return dailyValue.date.slice(0, 7);
  });

  const monthlyAverages = _.mapValues(monthlyValues, (dailyValues: any) => {
    const sum = _.sumBy(dailyValues, currency);
    const monthlyAveragePrice = sum / dailyValues.length;
    return {
      monthlyAveragePrice,
    };
  });
  return monthlyAverages;
};
