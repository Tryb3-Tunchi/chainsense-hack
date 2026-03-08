# ChainSense Frontend

A Next.js dashboard for monitoring cryptocurrency markets and AI-powered risk assessments.

## Features

- Real-time crypto prices from CoinGecko
- AI-powered risk analysis for specific coins
- Custom Watchlist and Portfolio tracking
- Responsive design for mobile and desktop

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_JSONBIN_API_KEY=your_key
   NEXT_PUBLIC_JSONBIN_BIN_ID=your_id
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

- `app/`: Next.js App Router pages
- `app/components/`: Reusable UI components
- `app/utils.ts`: Shared utility functions and constants

