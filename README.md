# ⚡ EdgeFinder

**Prediction Market Arb & +EV Tool** — Find guaranteed arbitrage and positive expected value opportunities across Kalshi, PredictIt, and Polymarket.

## What It Does

- **Arb Scanner**: Detects cross-platform arbitrage between Kalshi and PredictIt (both US-legal). Buy YES on one, NO on the other — lock in guaranteed profit regardless of outcome.
- **+EV Finder**: Uses Polymarket as a sharp price oracle. When Kalshi/PredictIt diverges by ≥3¢, there's a mathematical edge.
- **Paper Trader**: Log practice positions with P&L tracking.
- **Watch List**: Monitor Robinhood Predictions, Gemini, and ForecastEx for manual arb opportunities.

## Tech Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Kalshi API (RSA-PSS auth), Polymarket API, PredictIt API

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in your Kalshi API credentials
npm run dev
```

## Deployment (Vercel)

1. Push to GitHub (done ✅)
2. Go to [vercel.com](https://vercel.com) → New Project → Import `edgefinder`
3. Add environment variables:
   - `KALSHI_API_KEY_ID` — your Kalshi API key ID
   - `KALSHI_PRIVATE_KEY_B64` — base64-encoded RSA private key
   - `ACCESS_CODES` — comma-separated access codes for paywall

## Paywall

The app uses a simple access-code system. Set `ACCESS_CODES=code1,code2,code3` in your Vercel env vars. Sell codes via Gumroad or your preferred platform.

## License

Proprietary. Not open source.
