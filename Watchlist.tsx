"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Plus, X } from "lucide-react";
import axios from "axios";

const DEFAULT_SYMBOLS = ["AAPL", "TSLA", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "SPY"];

interface WatchItem {
  symbol: string;
  price: number | null;
  change: number | null;
  loading: boolean;
}

interface WatchlistProps {
  onSelectSymbol: (symbol: string) => void;
  activeSymbol: string;
}

export default function Watchlist({ onSelectSymbol, activeSymbol }: WatchlistProps) {
  const [items, setItems] = useState<WatchItem[]>(
    DEFAULT_SYMBOLS.map((s) => ({ symbol: s, price: null, change: null, loading: false }))
  );
  const [newSymbol, setNewSymbol] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const fetchPrice = useCallback(async (symbol: string) => {
    setItems((prev) =>
      prev.map((item) => (item.symbol === symbol ? { ...item, loading: true } : item))
    );
    try {
      const res = await axios.get(`/api/price?symbol=${symbol}`);
      const { price } = res.data;
      // Fake change for display (would need yesterday's close for real change)
      setItems((prev) =>
        prev.map((item) =>
          item.symbol === symbol
            ? { ...item, price, change: null, loading: false }
            : item
        )
      );
    } catch {
      setItems((prev) =>
        prev.map((item) =>
          item.symbol === symbol ? { ...item, loading: false } : item
        )
      );
    }
  }, []);

  useEffect(() => {
    // Stagger fetches to avoid rate limiting
    items.forEach((item, i) => {
      setTimeout(() => fetchPrice(item.symbol), i * 300);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addSymbol = () => {
    const sym = newSymbol.trim().toUpperCase();
    if (!sym || items.find((i) => i.symbol === sym)) return;
    const newItem: WatchItem = { symbol: sym, price: null, change: null, loading: true };
    setItems((prev) => [...prev, newItem]);
    fetchPrice(sym);
    setNewSymbol("");
    setShowAdd(false);
  };

  const removeSymbol = (symbol: string) => {
    setItems((prev) => prev.filter((i) => i.symbol !== symbol));
  };

  return (
    <div className="terminal-card bg-terminal-card border border-terminal-border rounded-lg p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-terminal-muted" />
          <span className="text-xs text-terminal-muted tracking-widest uppercase">Watchlist</span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-terminal-muted hover:text-terminal-green transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showAdd && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && addSymbol()}
            placeholder="TICKER"
            maxLength={8}
            className="flex-1 px-2 py-1.5 text-xs rounded border bg-terminal-surface border-terminal-border text-terminal-bright placeholder:text-terminal-muted focus:outline-none focus:border-terminal-green uppercase tracking-wider"
          />
          <button
            onClick={addSymbol}
            className="px-2 py-1.5 text-xs font-bold border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-terminal-bg rounded transition-all"
          >
            ADD
          </button>
        </div>
      )}

      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.symbol}
            onClick={() => onSelectSymbol(item.symbol)}
            className={`group flex items-center justify-between px-2 py-2 rounded cursor-pointer transition-all duration-200 ${
              item.symbol === activeSymbol
                ? "bg-terminal-green/10 border border-terminal-green/20"
                : "hover:bg-terminal-surface border border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              {item.symbol === activeSymbol && (
                <div className="w-1 h-1 rounded-full bg-terminal-green" />
              )}
              <span
                className={`text-xs font-bold tracking-wider ${
                  item.symbol === activeSymbol ? "text-terminal-green" : "text-terminal-text"
                }`}
              >
                {item.symbol}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {item.loading ? (
                <div className="w-3 h-3 border border-terminal-border border-t-terminal-green rounded-full animate-spin" />
              ) : item.price ? (
                <span className="text-xs tabular-nums text-terminal-bright font-medium">
                  ${item.price.toFixed(2)}
                </span>
              ) : (
                <span className="text-xs text-terminal-border">—</span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSymbol(item.symbol);
                }}
                className="opacity-0 group-hover:opacity-100 text-terminal-muted hover:text-terminal-red transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
