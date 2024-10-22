# Blockchain Price Tracker

A **Blockchain Price Tracker** built with **Nest.js** that automatically tracks the price of **Ethereum** and **Polygon**, triggers alerts based on price changes, and exposes APIs for price history, alerts, and ETH to BTC swap rates.

## Features

1. **Price Fetching**: Automatically saves Ethereum and Polygon prices every 5 minutes.
2. **Email Alerts**: Sends an email if the price of a chain increases by more than **3%** in an hour.
3. **Price History API**: Retrieves hourly prices for the past 24 hours.
4. **Set Alerts**: Set price alerts for specific chains and email notifications.
5. **Swap Rate API**: Provides the swap rate from Ethereum to Bitcoin with a 0.03% fee.

## Installation

### **Clone the repo**:
   ```bash
   git clone https://github.com/sheezanazeer98/chain-price-tracker.git
```

## Create a .env file based on example.env.

## Run Locally:

```bash
npm install
npm run start:dev
```

## Run with Docker:

```bash
docker-compose up --build
```

## API Documentation
Visit the Swagger UI at `http://localhost:3000/api` to explore the available endpoints.

## About

- Developer - [Sheeza Nazeer](https://www.linkedin.com/in/sheeza-nazeer-blockchain-engineer/)
- Website - [https://sheezanazeer.com](https://sheezanazeer.com)



