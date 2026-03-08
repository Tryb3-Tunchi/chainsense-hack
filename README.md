# ChainSense Market Sentinel

A Chainlink CRE workflow that monitors BTC and ETH prices, analyzes market risk using OpenAI GPT-4o-mini, and stores verdicts in JSONBin.io.

## Features

- Cron-triggered every 5 minutes
- Fetches live prices from CoinGecko
- AI-powered risk analysis (LOW/MEDIUM/HIGH)
- Stores results in JSONBin for dashboard consumption

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Configure environment variables in `.env` (root directory):
   ```
   OPENAI_API_KEY=your_openai_api_key
   JSONBIN_API_KEY=your_jsonbin_api_key
   JSONBIN_BIN_ID=your_jsonbin_bin_id
   ```

3. Run tests:
   ```bash
   bun test
   ```

4. Simulate the workflow:
   ```bash
   cre workflow simulate . --target=staging-settings
   ```

5. Deploy to production:
   ```bash
   cre workflow deploy . --target=production-settings
   ```
