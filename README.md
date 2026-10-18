# Crypto Terminal

Installable crypto market terminal. It uses public, keyless data only — no accounts, API keys, or secrets.

**Live site:** https://jggranzotto-wq.github.io/crypto-terminal/

## Data

- Binance public mini tickers and candles (`data-api.binance.vision`)
- Crypto.com grid ranges, shown against the live Binance USDT price (public stand-in for the Crypto.com USD pair; bot P&L is not available without an account)
- Headlines from CoinDesk and Cointelegraph via rss2json

Charts use TradingView Lightweight Charts v4.2.0 (Apache-2.0), vendored under `vendor/` so the app shell works offline.

## Install

Open the live site in Chrome, Edge, or Safari, then use **Install app** or **Add to Home Screen**. The service worker caches the app shell under `/crypto-terminal/`. Price, candle, and news requests are network-first.

## GitHub Pages

The site is the repository root (see `.nojekyll`). `.github/workflows/pages.yml` deploys that root with GitHub Actions.

If Pages is not serving the site yet, enable one of these in the repository settings:

1. **GitHub Actions** — Settings → Pages → Build and deployment → Source: GitHub Actions. The workflow runs on every push to `main`.
2. **Branch** — Source: Deploy from a branch, branch `main`, folder `/` (root).
