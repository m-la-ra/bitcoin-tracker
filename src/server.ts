import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import db from "./lowdb";
import {
  AverageDailyPrices,
  BitcoinPrice,
  BitcoinPriceResponse,
} from "./types";

const port = 3000;
const app = express();

dotenv.config();
const API_KEY = process.env.CRYPTO_API_KEY;
const BASE_API_URL = "https://api.coingecko.com/api/v3";
const API_PARAMS =
  "/simple/price?ids=bitcoin&vs_currencies=czk,eur&x_cg_demo_api_key=";

// const endpoints = [
//   "https://api.coindesk.com/v1/bpi/currentprice/czk.json",
//   "https://api.coindesk.com/v1/bpi/currentprice/eur.json",
// ];

// Promise.all(endpoints.map((endpoint) => axios.get(endpoint))).then(
//   ([{ data: bpi }, { data: time }]) => {
//     console.log({ bpi, time });
//   }
// );

app.get("/price", async (req, res) => {
  try {
    const response = await axios.get<BitcoinPriceResponse>(
      BASE_API_URL + API_PARAMS + API_KEY
    );

    const data = response.data.bitcoin;
    const requestTime = response.headers.date;
    const currentDateAndTime = new Date().toISOString();

    // Saving current prices to lowdb
    const currentPrices: BitcoinPrice[] = [
      {
        currency: "CZK",
        rate: data.czk,
        date: currentDateAndTime.slice(0, 10),
        time: currentDateAndTime.slice(11, 19),
      },
      {
        currency: "EUR",
        rate: data.eur,
        date: currentDateAndTime.slice(0, 10),
        time: currentDateAndTime.slice(11, 19),
      },
    ];

    currentPrices.forEach((price) => {
      db.get("bitcoinPrices").push(price).write();
    });

    const currentDate = new Date().toISOString().slice(0, 10);

    const calculateAveragePrice = (currency: string, date: string) => {
      return db
        .get("bitcoinPrices")
        .filter({ currency: currency, date: date })
        .map("rate")
        .uniq()
        .mean()
        .value();
    };

    const averageDailyPrices: AverageDailyPrices = {
      averagePriceCZK: calculateAveragePrice("CZK", currentDate),
      averagePriceEUR: calculateAveragePrice("EUR", currentDate),
      date: currentDate,
    };

    const avPriceDb = db.get("averageDailyPrices").value();
    const exists = avPriceDb.some((item) => item.date === currentDate);

    if (exists) {
      console.log("exists");
      db.get("averageDailyPrices")
        .find({ date: currentDate })
        .assign({
          averagePriceCZK: averageDailyPrices.averagePriceCZK,
          averagePriceEUR: averageDailyPrices.averagePriceEUR,
        })
        .write();
    } else {
      console.log("does not exist, writing entry to db");
      db.get("averageDailyPrices").push(averageDailyPrices).write();
    }

    res.json({
      currentBitcoinPrices: {
        CZK: { code: "CZK", rate: data.czk },
        EUR: { code: "EUR", rate: data.eur },
      },
      requestedAt: currentDateAndTime,
      averageDailyPrices: db.get("averageDailyPrices"),
    });
  } catch (error) {
    res.status(500).send("Error fetching");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
