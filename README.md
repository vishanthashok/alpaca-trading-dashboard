# 📈 Alpaca Trading Terminal

A professional-grade paper trading dashboard built with Next.js 14, Tailwind CSS, and the Alpaca Markets API. Bloomberg Terminal aesthetics meet modern web tech.

![Alpaca Terminal](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss)

## ✨ Features

- **Live Stock Quotes** — Real-time bid/ask prices with auto-refresh every 10 seconds
- **Interactive Charts** — Area charts with 1D / 1W / 1M / 3M timeframes via Recharts
- **Buy & Sell Orders** — Market and limit orders with confirmation modal
- **Portfolio Positions** — Live P&L, market value, unrealized gains/losses
- **Account Overview** — Balance, buying power, equity, daytrade count
- **Trade History** — Filterable order history with status indicators
- **Watchlist** — Quick-access symbol list with live prices
- **Dark Terminal UI** — Bloomberg-inspired monospace design, neon accents
- **Paper Trading** — No real money at risk — uses Alpaca's sandbox

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/alpaca-trading-terminal
cd alpaca-trading-terminal
npm install
```

### 2. Get Alpaca API Keys

1. Sign up at [alpaca.markets](https://app.alpaca.markets)
2. Navigate to **Paper Trading** → **API Keys**
3. Generate a new key pair

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
ALPACA_API_KEY=PKxxxxxxxxxxxxxxx
ALPACA_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ALPACA_BASE_URL=https://paper-api.alpaca.markets
ALPACA_DATA_URL=https://data.alpaca.markets
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
alpaca-trading-terminal/
├── app/
│   ├── api/
│   │   ├── account/route.ts     # GET /api/account
│   │   ├── history/route.ts     # GET /api/history?symbol=&timeframe=
│   │   ├── order/route.ts       # POST/GET /api/order
│   │   ├── positions/route.ts   # GET /api/positions
│   │   ├── price/route.ts       # GET /api/price?symbol=
│   │   └── trades/route.ts      # GET /api/trades
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Main dashboard
├── components/
│   ├── AccountBalance.tsx       # Account summary card
│   ├── Chart.tsx                # Recharts area chart
│   ├── Navbar.tsx               # Top navigation bar
│   ├── OrderForm.tsx            # Buy/sell form + modal
│   ├── Positions.tsx            # Portfolio positions table
│   ├── PriceDisplay.tsx         # Live bid/ask quote
│   ├── TradeHistory.tsx         # Order history table
│   └── Watchlist.tsx            # Symbol watchlist
├── lib/
│   └── alpaca.ts                # Alpaca API client + types
├── .env.local                   # Your API keys (never commit!)
├── tailwind.config.js
└── vercel.json
```

## 🌐 Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
# Follow prompts, add env vars when asked
```

### Option B: Vercel Dashboard

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import Project**
3. Select your repo
4. Add environment variables:
   - `ALPACA_API_KEY`
   - `ALPACA_SECRET_KEY`
   - `ALPACA_BASE_URL` → `https://paper-api.alpaca.markets`
   - `ALPACA_DATA_URL` → `https://data.alpaca.markets`
5. Click **Deploy**

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/price?symbol=AAPL` | Latest trade + bid/ask |
| `GET` | `/api/history?symbol=AAPL&timeframe=1D` | OHLCV bars |
| `GET` | `/api/positions` | All open positions |
| `GET` | `/api/account` | Account balance & info |
| `GET` | `/api/trades` | Closed order history |
| `POST` | `/api/order` | Place buy/sell order |

### POST /api/order Body

```json
{
  "symbol": "AAPL",
  "qty": 10,
  "side": "buy",
  "type": "market",
  "time_in_force": "day"
}
```

## 🎨 Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 14 | Framework + API routes |
| TypeScript | Type safety |
| Tailwind CSS | Utility styling |
| Recharts | Chart rendering |
| Axios | HTTP client |
| date-fns | Date formatting |
| Lucide React | Icons |

## ⚠️ Disclaimer

This is a **paper trading** application for educational purposes only. It uses simulated money with the Alpaca paper trading environment. Nothing in this application constitutes financial advice.

## 📄 License

MIT
