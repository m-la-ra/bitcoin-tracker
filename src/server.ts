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

const fetch = async () => {
  try {
    const response = await axios.get<BitcoinPriceResponse>(
      BASE_API_URL + API_PARAMS + API_KEY,
      { headers: { "Content-Type": "application/json" } }
    );

    const data = response.data.bitcoin;
    const currentDateAndTime = new Date().toISOString();
    const currentMonth = currentDateAndTime.slice(0, 7);
    const currentDay = currentDateAndTime.slice(8, 10);
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
      CZK: calculateAveragePrice("CZK", currentDate),
      EUR: calculateAveragePrice("EUR", currentDate),
      day: currentDay,
      month: currentMonth,
    };
    const averageMonthlyPrices: AverageMonthlyPrices = {
      CZK: calculateMonthlyAveragePrice("CZK"),
      EUR: calculateMonthlyAveragePrice("EUR"),
      id: "monthlyPrices",
    };

    // Saving current prices to lowdb
    currentPrices.forEach((price) => {
      db.get("bitcoinPrices").push(price).write();
    });

    const averageDailyPriceData = db.get("averageDailyPrices").value();
    const averageMonthlyPriceData = db.get("averageMonthlyPrices").value();

    // Check if today's date exists in DB and then write new entry or update existing entry
    const dateEntryExists = averageDailyPriceData.some(
      (item) => item.day === currentDay
    );

    if (!dateEntryExists) {
      db.get("averageDailyPrices").push(averageDailyPrices).write();
    } else {
      db.get("averageDailyPrices")
        .find({ day: currentDay })
        .assign({
          CZK: averageDailyPrices.CZK,
          EUR: averageDailyPrices.EUR,
        })
        .write();
    }

    // Check if this month exists in DB and then write new entry or update existing entry
    const monthlyEntryExists = averageMonthlyPriceData.some((item) => item.id);

    if (monthlyEntryExists) {
      db.get("averageMonthlyPrices")
        .find({ id: "monthlyPrices" })
        .assign({
          CZK: averageMonthlyPrices.CZK,
          EUR: averageMonthlyPrices.EUR,
        })
        .write();
    } else {
      db.get("averageMonthlyPrices").push(averageMonthlyPrices).write();
    }

    return {
      currentBitcoinPrices: {
        CZK: { code: "CZK", rate: data.czk },
        EUR: { code: "EUR", rate: data.eur },
      },
      requestedAt: currentDateAndTime,
      averageDailyPrice: averageDailyPriceData,
      averageMonthlyPrice: averageMonthlyPriceData,
    };
  } catch (error) {
    console.error("Error fetching:", error);
    throw error;
  }
};

app.get("/price", async (req, res) => {
  try {
    const responseData = await fetch();
    res.json(responseData);
  } catch (error) {
    res.status(500).send("Error fetching data");
  }
});

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await fetch();
  setInterval(async () => {
    try {
      await fetch();
    } catch (error) {
      console.error("Error fetching:", error);
    }
  }, 120000);
});
