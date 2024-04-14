import express from "express";
import axios from "axios";
import dotenv from "dotenv";

const port = 3000;
const app = express();

dotenv.config();
const API_KEY = process.env.CRYPTO_API_KEY;
const BASE_API_URL = "https://api.coingecko.com/api/v3";
const API_PARAMS =
  "/simple/price?ids=bitcoin&vs_currencies=czk,eur&x_cg_demo_api_key=";

interface BitcoinPriceResponse {
  headers: { date: string };
  bitcoin: {
    czk: number;
    eur: number;
  };
}

app.get("/price", async (req, res) => {
  try {
    const response = await axios.get<BitcoinPriceResponse>(
      BASE_API_URL + API_PARAMS + API_KEY
    );
    const data = response.data.bitcoin;
    const requestTime = response.headers.date;

    res.json({
      currentBitcoinPrice: {
        CZK: { code: "CZK", rate: data.czk },
        EUR: { code: "EUR", rate: data.eur },
      },
      requestedAt: requestTime,
    });
  } catch (error) {
    res.status(500).send("Error fetching");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
