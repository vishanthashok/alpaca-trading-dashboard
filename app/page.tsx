"use client";

import { useState, useCallback } from "react";
import Navbar from "../Navbar";
import Chart from "../Chart";
import OrderForm from "../OrderForm";
import Positions from "../Positions";
import AccountBalance from "../AccountBalance";
import TradeHistory from "../TradeHistory";
import PriceDisplay from "../PriceDisplay";
import Watchlist from "../Watchlist";

export default function Home() {
  const [symbol, setSymbol] = useState("AAPL");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChangePercent, setPriceChangePercent] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePriceUpdate = useCallback(
    (price: number) => {
      setCurrentPrice(price);
    },
    []
  );

  const handleSymbolChange = useCallback((s: string) => {
    setSymbol(s);
    setCurrentPrice(null);
    setPriceChangePercent(null);
  }, []);

  const handleOrderPlaced = useCallback(() => {
    setRefreshTrigger((n) => n + 1);
  }, []);

  return (
    <div className="min-h-screen bg-terminal-bg grid-bg">
      {/* Navbar */}
      <Navbar
        symbol={symbol}
        price={currentPrice}
        priceChange={priceChangePercent}
        onSymbolChange={handleSymbolChange}
      />

      {/* Main Layout */}
      <div className="max-w-screen-2xl mx-auto px-4 py-4">
        {/* Status bar */}
        <div className="flex items-center gap-2 mb-4 text-xs text-terminal-muted font-mono">
          <span className="text-terminal-green">▶</span>
          <span>PAPER TRADING MODE</span>
          <span className="text-terminal-border mx-1">·</span>
          <span className="text-terminal-green font-bold">{symbol}</span>
          <span className="text-terminal-border mx-1">·</span>
          <span>NO REAL MONEY AT RISK</span>
          <span className="text-terminal-border mx-1">·</span>
          <span>POWERED BY ALPACA MARKETS</span>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* LEFT SIDEBAR - Watchlist */}
          <div className="col-span-12 lg:col-span-2">
            <Watchlist onSelectSymbol={handleSymbolChange} activeSymbol={symbol} />
          </div>

          {/* CENTER - Chart + Price + Orders */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            {/* Chart */}
            <Chart symbol={symbol} />

            {/* Positions */}
            <Positions refreshTrigger={refreshTrigger} />

            {/* Trade History */}
            <TradeHistory refreshTrigger={refreshTrigger} />
          </div>

          {/* RIGHT SIDEBAR - Price + Account + Order */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {/* Live Price */}
            <PriceDisplay
              symbol={symbol}
              onPriceUpdate={handlePriceUpdate}
              autoRefresh={true}
            />

            {/* Account Balance */}
            <AccountBalance refreshTrigger={refreshTrigger} />

            {/* Order Form */}
            <OrderForm
              symbol={symbol}
              currentPrice={currentPrice}
              onOrderPlaced={handleOrderPlaced}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t border-terminal-border py-3 px-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between text-xs text-terminal-border">
          <div className="flex items-center gap-3">
            <span className="text-terminal-green font-display">ALPACA TERMINAL</span>
            <span>·</span>
            <span>Paper Trading Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Data: Alpaca Markets</span>
            <span>·</span>
            <span>For educational purposes only</span>
            <span>·</span>
            <span>Not financial advice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

