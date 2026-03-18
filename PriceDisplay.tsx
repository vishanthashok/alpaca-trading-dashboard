"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Zap, RefreshCw, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import axios from "axios";

interface PriceData {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  timestamp: string;
}

interface PriceDisplayProps {
  symbol: string;
  onPriceUpdate?: (price: number) => void;
  autoRefresh?: boolean;
}

export default function PriceDisplay({
  symbol,
  onPriceUpdate,
  autoRefresh = true,
}: PriceDisplayProps) {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(null);
  const [countdown, setCountdown] = useState(10);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/price?symbol=${symbol}`);
      const newData: PriceData = res.data;
      setData((prev) => {
        if (prev && prev.price !== newData.price) {
          setPriceDirection(newData.price > prev.price ? "up" : "down");
          setTimeout(() => setPriceDirection(null), 600);
        }
        return newData;
      });
      setLastPrice(newData.price);
      onPriceUpdate?.(newData.price);
      setCountdown(10);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || "Price unavailable");
    } finally {
      setLoading(false);
    }
  }, [symbol, onPriceUpdate]);

  useEffect(() => {
    fetchPrice();
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchPrice, 10000);
      countdownRef.current = setInterval(() => {
        setCountdown((c) => (c <= 1 ? 10 : c - 1));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchPrice, autoRefresh]);

  const spread = data ? (data.ask - data.bid).toFixed(3) : null;
  const midpoint = data ? ((data.ask + data.bid) / 2).toFixed(2) : null;

  const directionColor =
    priceDirection === "up"
      ? "text-terminal-green flash-green"
      : priceDirection === "down"
      ? "text-terminal-red flash-red"
      : "text-terminal-bright";

  return (
    <div className="terminal-card bg-terminal-card border border-terminal-border rounded-lg p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-terminal-green" />
          <span className="text-xs text-terminal-muted tracking-widest uppercase">
            Live Quote
          </span>
          {autoRefresh && (
            <span className="text-xs text-terminal-border">
              refresh in {countdown}s
            </span>
          )}
        </div>
        <button
          onClick={fetchPrice}
          disabled={loading}
          className="text-terminal-muted hover:text-terminal-green transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-terminal-green animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-terminal-red text-xs mb-1">⚠ {error}</p>
          <p className="text-terminal-muted text-xs">Market may be closed</p>
        </div>
      ) : data ? (
        <>
          {/* Main price */}
          <div className="flex items-end gap-2 mb-3">
            <div className={`text-3xl font-bold tabular-nums transition-colors ${directionColor}`}>
              ${data.price.toFixed(2)}
            </div>
            {priceDirection === "up" && (
              <ArrowUp className="w-5 h-5 text-terminal-green mb-1 animate-pulse-green" />
            )}
            {priceDirection === "down" && (
              <ArrowDown className="w-5 h-5 text-terminal-red mb-1" />
            )}
          </div>

          {/* Bid/Ask */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-terminal-surface border border-terminal-border/60 rounded p-2">
              <p className="text-xs text-terminal-muted mb-1">BID</p>
              <p className="text-sm font-bold tabular-nums text-terminal-red">
                ${data.bid?.toFixed(2) ?? "—"}
              </p>
              {data.bidSize !== undefined && (
                <p className="text-xs text-terminal-muted tabular-nums">
                  {data.bidSize.toLocaleString()} shares
                </p>
              )}
            </div>
            <div className="bg-terminal-surface border border-terminal-border/60 rounded p-2">
              <p className="text-xs text-terminal-muted mb-1">ASK</p>
              <p className="text-sm font-bold tabular-nums text-terminal-green">
                ${data.ask?.toFixed(2) ?? "—"}
              </p>
              {data.askSize !== undefined && (
                <p className="text-xs text-terminal-muted tabular-nums">
                  {data.askSize.toLocaleString()} shares
                </p>
              )}
            </div>
          </div>

          {/* Spread & midpoint */}
          <div className="flex justify-between text-xs border-t border-terminal-border pt-2">
            <div>
              <span className="text-terminal-muted">SPREAD </span>
              <span className="text-terminal-text tabular-nums">${spread}</span>
            </div>
            <div>
              <span className="text-terminal-muted">MID </span>
              <span className="text-terminal-text tabular-nums">${midpoint}</span>
            </div>
            <div className="text-terminal-border">
              {new Date(data.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
