"use client";

import { useState, useEffect, useCallback } from "react";
import { Briefcase, TrendingUp, TrendingDown, RefreshCw, Loader2 } from "lucide-react";
import axios from "axios";
import { Position } from "./lib/alpaca";

interface PositionsProps {
  refreshTrigger?: number;
}

export default function Positions({ refreshTrigger }: PositionsProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/positions");
      setPositions(res.data.positions || []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } | string } } };
      const raw = e?.response?.data?.error;
      const msg =
        typeof raw === "string"
          ? raw
          : typeof raw === "object" && raw && "message" in raw && typeof (raw as any).message === "string"
          ? (raw as any).message
          : "Failed to fetch positions";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions, refreshTrigger]);

  const totalPnl = positions.reduce(
    (sum, p) => sum + parseFloat(p.unrealized_pl || "0"),
    0
  );
  const totalValue = positions.reduce(
    (sum, p) => sum + parseFloat(p.market_value || "0"),
    0
  );

  return (
    <div className="terminal-card bg-terminal-card border border-terminal-border rounded-lg p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-terminal-muted" />
          <span className="text-xs text-terminal-muted tracking-widest uppercase">Positions</span>
          {positions.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-terminal-surface border border-terminal-border rounded text-terminal-text">
              {positions.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {positions.length > 0 && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-terminal-muted">
                MKT VALUE:{" "}
                <span className="text-terminal-bright tabular-nums font-bold">
                  ${totalValue.toFixed(2)}
                </span>
              </span>
              <span
                className={`font-bold tabular-nums ${
                  totalPnl >= 0 ? "text-terminal-green" : "text-terminal-red"
                }`}
              >
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
              </span>
            </div>
          )}
          <button
            onClick={fetchPositions}
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
            <span className="text-xs text-terminal-muted">FETCHING POSITIONS...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-terminal-red text-xs mb-2">⚠ {error}</p>
          <button
            onClick={fetchPositions}
            className="text-xs border border-terminal-border text-terminal-muted hover:border-terminal-green hover:text-terminal-green px-3 py-1 rounded transition-all"
          >
            RETRY
          </button>
        </div>
      ) : positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Briefcase className="w-8 h-8 text-terminal-border mb-3" />
          <p className="text-terminal-muted text-xs">NO OPEN POSITIONS</p>
          <p className="text-terminal-border text-xs mt-1">Place a buy order to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-terminal-border">
                {["SYMBOL", "QTY", "AVG PRICE", "CURR PRICE", "MKT VALUE", "P&L", "P&L %"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-terminal-muted font-normal pb-2 pr-3 tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => {
                const pnl = parseFloat(pos.unrealized_pl);
                const pnlPct = parseFloat(pos.unrealized_plpc) * 100;
                const isProfit = pnl >= 0;
                const pnlColor = isProfit ? "text-terminal-green" : "text-terminal-red";

                return (
                  <tr
                    key={pos.symbol}
                    className="border-b border-terminal-border/50 hover:bg-terminal-surface/50 transition-colors"
                  >
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-terminal-bright tracking-wider">
                          {pos.symbol}
                        </span>
                        <span
                          className={`text-xs px-1 rounded ${
                            pos.side === "long"
                              ? "bg-terminal-green/10 text-terminal-green"
                              : "bg-terminal-red/10 text-terminal-red"
                          }`}
                        >
                          {pos.side?.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-terminal-text">
                      {parseFloat(pos.qty).toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-terminal-text">
                      ${parseFloat(pos.avg_entry_price).toFixed(2)}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-terminal-bright font-medium">
                      ${parseFloat(pos.current_price).toFixed(2)}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-terminal-text">
                      ${parseFloat(pos.market_value).toFixed(2)}
                    </td>
                    <td className={`py-2.5 pr-3 tabular-nums font-bold ${pnlColor}`}>
                      <div className="flex items-center gap-1">
                        {isProfit ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {isProfit ? "+" : ""}${pnl.toFixed(2)}
                      </div>
                    </td>
                    <td className={`py-2.5 tabular-nums font-bold ${pnlColor}`}>
                      {isProfit ? "+" : ""}
                      {pnlPct.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
