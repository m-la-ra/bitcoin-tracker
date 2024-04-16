import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import { AverageDailyPrices, BitcoinPrice } from "./types";

interface DatabaseSchema {
  bitcoinPrices: BitcoinPrice[];
  averageDailyPrices: AverageDailyPrices[];
}

const adapter = new FileSync<DatabaseSchema>("db.json");
const db = low(adapter);

db.defaults({ bitcoinPrices: [], averageDailyPrices: [] }).write();

export default db;
