"use client";

import { useState, useEffect } from "react";
import { Activity, Wifi, WifiOff } from "lucide-react";

interface NavbarProps {
  symbol: string;
  price: number | null;
  priceChange: number | null;
  onSymbolChange: (s: string) => void;
}

export default function Navbar({ symbol, price, priceChange, onSymbolChange }: NavbarProps) {
  const [input, setInput] = useState(symbol);
  const [time, setTime] = useState(new Date());
  const [marketOpen, setMarketOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      // Rough market hours check (9:30 AM - 4:00 PM ET, Mon-Fri)
      const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const day = et.getDay();
      const hours = et.getHours() + et.getMinutes() / 60;
      setMarketOpen(day >= 1 && day <= 5 && hours >= 9.5 && hours < 16);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onSymbolChange(input.trim().toUpperCase());
  };

  const isPositive = priceChange !== null && priceChange >= 0;
  const changeColor = isPositive ? "text-terminal-green" : "text-terminal-red";
  const changeSign = isPositive ? "+" : "";

  return (
    <nav
      className="sticky top-0 z-50 border-b border-terminal-border"
      style={{ background: "rgba(8, 12, 16, 0.95)", backdropFilter: "blur(12px)" }}
    >
      {/* Top ticker / status bar */}
      <div
        className="flex items-center justify-between px-4 py-1 text-xs border-b border-terminal-border"
        style={{ background: "rgba(13, 17, 23, 0.8)" }}
      >
        <div className="flex items-center gap-4 text-terminal-muted">
          <span className="font-display tracking-widest text-terminal-green">
            ALPACA TERMINAL
          </span>
          <span className="text-terminal-border">|</span>
          <span>PAPER TRADING</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Market status */}
          <div className="flex items-center gap-1.5">
            {marketOpen ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-terminal-green live-dot" />
                <span className="text-terminal-green">MARKET OPEN</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-terminal-red" />
                <span className="text-terminal-red">MARKET CLOSED</span>
              </>
            )}
          </div>
          <span className="text-terminal-border">|</span>
          {/* Clock */}
          <span className="text-terminal-text tabular-nums">
            {time.toLocaleTimeString("en-US", {
              timeZone: "America/New_York",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}{" "}
            ET
          </span>
        </div>
      </div>

      {/* Main nav */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo + current price */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-terminal-green" />
            <span className="font-display text-sm font-bold tracking-wider text-terminal-bright">
              TERMINAL
            </span>
          </div>

          {price !== null && (
            <div className="flex items-center gap-3">
              <span className="text-terminal-muted text-sm">{symbol}</span>
              <span className="text-terminal-bright font-bold text-lg tabular-nums">
                ${price.toFixed(2)}
              </span>
              {priceChange !== null && (
                <span className={`text-sm font-medium tabular-nums ${changeColor}`}>
                  {changeSign}
                  {priceChange.toFixed(2)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-green text-xs font-bold">
              $
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="AAPL"
              maxLength={8}
              className="pl-7 pr-3 py-1.5 text-sm w-28 rounded border bg-terminal-surface border-terminal-border text-terminal-bright placeholder:text-terminal-muted focus:outline-none focus:border-terminal-green focus:shadow-neon-green transition-all uppercase tracking-widest"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-bold tracking-wider rounded border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-terminal-bg transition-all duration-200"
          >
            LOAD
          </button>
        </form>
      </div>
    </nav>
  );
}
