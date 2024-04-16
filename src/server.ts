import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import db from "./lowdb";
import {
  calculateAveragePrice,
  calculateMonthlyAveragePrice,
} from "./calculateAveragePrice";
import {
  AverageDailyPrices,
  AverageMonthlyPrices,
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

app.get("/price", async (req, res) => {
  try {
    const response = await axios.get<BitcoinPriceResponse>(
      BASE_API_URL + API_PARAMS + API_KEY
    );

    const data = response.data.bitcoin;
    const currentDateAndTime = new Date().toISOString();
    const currentMonth = currentDateAndTime.slice(0, 7);
    const currentDate = currentDateAndTime.slice(0, 10);
    const currentTime = currentDateAndTime.slice(11, 19);

    const currentPrices: BitcoinPrice[] = [
      {
        currency: "CZK",
        rate: data.czk,
        date: currentDate,
        time: currentTime,
      },
      {
        currency: "EUR",
        rate: data.eur,
        date: currentDate,
        time: currentTime,
      },
    ];

    const averageDailyPrices: AverageDailyPrices = {
      averageDailyPriceCZK: calculateAveragePrice("CZK", currentDate),
      averageDailyPriceEUR: calculateAveragePrice("EUR", currentDate),
      date: currentDate,
      month: currentMonth,
    };

    const averageMonthlyPrices: AverageMonthlyPrices = {
      averageMonthlyPriceCZK: calculateMonthlyAveragePrice(
        "averageDailyPriceCZK",
        currentMonth
      ),
      averageMonthlyPriceEUR: calculateMonthlyAveragePrice(
        "averageDailyPriceEUR",
        currentMonth
      ),
      month: currentMonth,
    };

    // Saving current prices to lowdb
    currentPrices.forEach((price) => {
      db.get("bitcoinPrices").push(price).write();
    });

    // Check if today's date exists in DB and then write new entry or update existing entry
    const averagePriceDbValues = db.get("averageDailyPrices").value();
    const dateEntryExists = averagePriceDbValues.some(
      (item) => item.date === currentDate
    );

    if (!dateEntryExists) {
      console.log("does not exist, writing entry to db");
      db.get("averageDailyPrices").push(averageDailyPrices).write();
    } else {
      console.log("exists");
      db.get("averageDailyPrices")
        .find({ date: currentDate })
        .assign({
          averageDailyPriceCZK: averageDailyPrices.averageDailyPriceCZK,
          averageDailyPriceEUR: averageDailyPrices.averageDailyPriceEUR,
        })
        .write();
    }

    // Check if this month exists in DB and then write new entry or update existing entry
    const averageMonthlyDbValues = db.get("averageMonthlyPrices").value();
    const monthlyEntryExists = averageMonthlyDbValues.some(
      (item) => item.month === currentMonth
    );

    if (dateEntryExists && !monthlyEntryExists) {
      console.log("monthly entry does not exist, writing entry to db");
      db.get("averageMonthlyPrices").push(averageMonthlyPrices).write();
    } else {
      console.log("monthly entry exists");
      db.get("averageMonthlyPrices")
        .find({ month: currentMonth })
        .assign({
          averageMonthlyPriceCZK: averageMonthlyPrices.averageMonthlyPriceCZK,
          averageMonthlyPriceEUR: averageMonthlyPrices.averageMonthlyPriceEUR,
        })
        .write();
    }

    res.json({
      currentBitcoinPrices: {
        CZK: { code: "CZK", rate: data.czk },
        EUR: { code: "EUR", rate: data.eur },
      },
      requestedAt: currentDateAndTime,
      averageDailyPrices: dateEntryExists
        ? db.get("averageDailyPrices")
        : "Awaiting price calculation",
      averageMonthlyPrices: monthlyEntryExists
        ? db.get("averageMonthlyPrices")
        : "Awaiting price calculation",
    });
  } catch (error) {
    res.status(500).send("Error fetching");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
