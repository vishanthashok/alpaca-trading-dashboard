"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, RefreshCw, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import { Order } from "./lib/alpaca";

interface TradeHistoryProps {
  refreshTrigger?: number;
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "filled") {
    return (
      <span className="flex items-center gap-1 text-terminal-green">
        <CheckCircle className="w-3 h-3" />
        FILLED
      </span>
    );
  }
  if (s === "canceled" || s === "cancelled" || s === "rejected" || s === "expired") {
    return (
      <span className="flex items-center gap-1 text-terminal-red">
        <XCircle className="w-3 h-3" />
        {s.toUpperCase()}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-terminal-amber">
      <AlertCircle className="w-3 h-3" />
      {s?.toUpperCase()}
    </span>
  );
}

export default function TradeHistory({ refreshTrigger }: TradeHistoryProps) {
  const [trades, setTrades] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/trades");
      setTrades(res.data.trades || []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || "Failed to fetch trade history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades, refreshTrigger]);

  const filtered =
    filter === "all" ? trades : trades.filter((t) => t.side === filter);

  return (
    <div className="terminal-card bg-terminal-card border border-terminal-border rounded-lg p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-terminal-muted" />
          <span className="text-xs text-terminal-muted tracking-widest uppercase">
            Trade History
          </span>
          {trades.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-terminal-surface border border-terminal-border rounded text-terminal-text">
              {filtered.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="flex gap-1">
            {(["all", "buy", "sell"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 text-xs rounded transition-all ${
                  filter === f
                    ? f === "buy"
                      ? "bg-terminal-green/20 text-terminal-green border border-terminal-green/30"
                      : f === "sell"
                      ? "bg-terminal-red/20 text-terminal-red border border-terminal-red/30"
                      : "bg-terminal-surface text-terminal-bright border border-terminal-border"
                    : "text-terminal-muted hover:text-terminal-text border border-transparent"
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={fetchTrades}
            disabled={loading}
            className="text-terminal-muted hover:text-terminal-green transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 text-terminal-green animate-spin" />
            <span className="text-xs text-terminal-muted">LOADING HISTORY...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-terminal-red text-xs mb-2">⚠ {error}</p>
          <button
            onClick={fetchTrades}
            className="text-xs border border-terminal-border text-terminal-muted hover:border-terminal-green hover:text-terminal-green px-3 py-1 rounded transition-all"
          >
            RETRY
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Clock className="w-8 h-8 text-terminal-border mb-3" />
          <p className="text-terminal-muted text-xs">NO TRADE HISTORY</p>
          <p className="text-terminal-border text-xs mt-1">Your executed orders will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-terminal-card">
              <tr className="border-b border-terminal-border">
                {["TIME", "SYMBOL", "SIDE", "QTY", "AVG PRICE", "TYPE", "STATUS"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-terminal-muted font-normal pb-2 pr-3 tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((trade) => (
                <tr
                  key={trade.id}
                  className="border-b border-terminal-border/50 hover:bg-terminal-surface/50 transition-colors"
                >
                  <td className="py-2 pr-3 text-terminal-muted whitespace-nowrap tabular-nums">
                    {new Date(trade.submitted_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    <span className="text-terminal-border">
                      {new Date(trade.submitted_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <span className="font-bold text-terminal-bright tracking-wider">
                      {trade.symbol}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={`font-bold ${
                        trade.side === "buy" ? "text-terminal-green" : "text-terminal-red"
                      }`}
                    >
                      {trade.side?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 pr-3 tabular-nums text-terminal-text">
                    {parseFloat(trade.qty || "0").toLocaleString()}
                    {trade.filled_qty && trade.filled_qty !== trade.qty && (
                      <span className="text-terminal-muted ml-1">
                        ({parseFloat(trade.filled_qty).toLocaleString()} filled)
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-3 tabular-nums text-terminal-text">
                    {trade.filled_avg_price
                      ? `$${parseFloat(trade.filled_avg_price).toFixed(2)}`
                      : trade.limit_price
                      ? `$${parseFloat(trade.limit_price).toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="py-2 pr-3 text-terminal-muted">
                    {trade.type?.toUpperCase()}
                  </td>
                  <td className="py-2 font-bold">
                    <StatusBadge status={trade.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
