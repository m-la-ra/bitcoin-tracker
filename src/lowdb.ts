import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import {
  AverageDailyPrices,
  AverageMonthlyPrices,
  BitcoinPrice,
} from "./types";

interface DatabaseSchema {
  bitcoinPrices: BitcoinPrice[];
  averageDailyPrices: AverageDailyPrices[];
  averageMonthlyPrices: AverageMonthlyPrices[];
}

const adapter = new FileSync<DatabaseSchema>("db.json");
const db = low(adapter);

db.defaults({
  bitcoinPrices: [],
  averageDailyPrices: [],
  averageMonthlyPrices: [],
}).write();

export default db;
