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

    // Saving current prices to lowdb
    const currentPrices: BitcoinPrice[] = [
      {
        currency: "CZK",
        rate: data.czk,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      {
        currency: "EUR",
        rate: data.eur,
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ];

    currentPrices.forEach((price) => {
      db.get("bitcoinPrices").push(price).write();
    });

    const currentDate = new Date().toISOString().slice(0, 10);
    const currentMonth = currentDate.slice(0, 7);
    console.log(currentMonth);
    console.log(currentDate);

    const calculateAveragePrice = (currency: string, createdAt: string) => {
      return db
        .get("bitcoinPrices")
        .filter({ currency: currency, createdAt: createdAt })
        .map("rate")
        .uniq()
        .mean()
        .value();
    };

    const dailyAverageCZK = calculateAveragePrice("CZK", currentDate);
    const dailyAverageEUR = calculateAveragePrice("EUR", currentDate);
    // const dailyAverageCZK = db
    //   .get("bitcoinPrices")
    //   .filter({ currency: "CZK", createdAt: currentDate })
    //   .map("rate")
    //   .uniq()
    //   .mean()
    //   .value();

    console.log(dailyAverageCZK);

    // const dailyAverageEUR = db
    //   .get("bitcoinPrices")
    //   .filter({ currency: "EUR", createdAt: currentDate })
    //   .map("rate")
    //   .uniq()
    //   .mean()
    //   .value();

    console.log(dailyAverageEUR);

    // const MonthlyAverageCZK = db
    //   .get("bitcoinPrices")
    //   .filter({ currency: "CZK", createdAt: currentMonth })
    //   .map("rate")
    //   .uniq()
    //   .mean()
    //   .value();

    // console.log(MonthlyAverageCZK);

    // const MonthlyAverageEUR = db
    //   .get("bitcoinPrices")
    //   .filter({ currency: "EUR", createdAt: currentMonth })
    //   .map("rate")
    //   .uniq()
    //   .mean()
    //   .value();

    // console.log(MonthlyAverageEUR);

    res.json({
      currentBitcoinPrices: {
        CZK: { code: "CZK", rate: data.czk },
        EUR: { code: "EUR", rate: data.eur },
      },
      requestedAt: requestTime,
      dailyAverageCZK: dailyAverageCZK.toFixed(2),
      dailyAverageEUR: dailyAverageEUR.toFixed(2),
    });
  } catch (error) {
    res.status(500).send("Error fetching");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
