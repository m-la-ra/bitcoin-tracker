## BITCOIN TRACKER ##

# Running locally
1. Install modules with `npm install`

2. Set up `.env` file with `CRYPTO_API_KEY=yourapikey` from `https://www.coingecko.com/en/api` and `AUTH_KEY=yourpassword`

3. Compile and run local server with `npm run build` & `npm start`

4. Test the endpoint at `http://localhost:3000/price`

# Building Docker image

1. In root folder, run `docker build -t <imagename>:<version> . `

2. Run locally with `docker run -p 3000:3000 -d <imagename>`
