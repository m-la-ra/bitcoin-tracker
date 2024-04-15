import lowdb from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import { BitcoinPrice } from "./types";

interface DatabaseSchema {
  bitcoinPrices: BitcoinPrice[];
}

const adapter = new FileSync<DatabaseSchema>("db.json");
const db = lowdb(adapter);

db.defaults({ bitcoinPrices: [] }).write();

export default db;
