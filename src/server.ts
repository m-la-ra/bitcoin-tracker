import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import db from "./lowdb";
import { BitcoinPrice, BitcoinPriceResponse } from "./types";

const port = 3000;
const app = express();

dotenv.config();
const API_KEY = process.env.CRYPTO_API_KEY;
const BASE_API_URL = "https://api.coingecko.com/api/v3";
const API_PARAMS =
  "/simple/price?ids=bitcoin&vs_currencies=czk,eur&x_cg_demo_api_key=";

app.get("/price", async (req, res) => {
  try {
    const response = await axios.get<BitcoinPriceResponse>(
      BASE_API_URL + API_PARAMS + API_KEY
    );
    const data = response.data.bitcoin;
    const requestTime = response.headers.date;

    // Saving current prices to lowdb
    const currentPrices: BitcoinPrice[] = [
      { currency: "CZK", rate: data.czk, createdAt: new Date().toISOString() },
    ];

    currentPrices.forEach((price) => {
      db.get("bitcoinPrices").push(price).write();
    });

    const today = new Date().toISOString().slice(0, 10);
    const dailyAverageCZK = db
      .get("bitcoinPrices")
      .filter({ currency: "CZK", createdAt: today })
      .map("rate")
      .mean()
      .value();

    res.json({
      currentBitcoinPrices: {
        CZK: { code: "CZK", rate: data.czk },
        EUR: { code: "EUR", rate: data.eur },
      },
      requestedAt: requestTime,
      dailyAverageCZK: dailyAverageCZK || 0,
    });
  } catch (error) {
    res.status(500).send("Error fetching");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
