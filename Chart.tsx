"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart2, Loader2 } from "lucide-react";
import axios from "axios";

interface BarData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  displayTime: string;
}

interface ChartProps {
  symbol: string;
}

type Timeframe = "1D" | "1W" | "1M" | "3M";

const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: BarData }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const bar = payload[0].payload;
  return (
    <div
      className="border border-terminal-border rounded p-3 text-xs font-mono"
      style={{ background: "rgba(13, 17, 23, 0.95)", backdropFilter: "blur(8px)" }}
    >
      <p className="text-terminal-muted mb-2">
        {new Date(bar.time).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className="text-terminal-muted">O</span>
        <span className="text-terminal-bright tabular-nums">${bar.open.toFixed(2)}</span>
        <span className="text-terminal-muted">H</span>
        <span className="text-terminal-green tabular-nums">${bar.high.toFixed(2)}</span>
        <span className="text-terminal-muted">L</span>
        <span className="text-terminal-red tabular-nums">${bar.low.toFixed(2)}</span>
        <span className="text-terminal-muted">C</span>
        <span className="text-terminal-bright font-bold tabular-nums">${bar.close.toFixed(2)}</span>
        <span className="text-terminal-muted">V</span>
        <span className="text-terminal-text tabular-nums">
          {bar.volume?.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function Chart({ symbol }: ChartProps) {
  const [bars, setBars] = useState<BarData[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/history?symbol=${symbol}&timeframe=${timeframe}`);
      setBars(res.data.bars || []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } | string } } };
      const raw = e?.response?.data?.error;
      const msg =
        typeof raw === "string"
          ? raw
          : typeof raw === "object" && raw && "message" in raw && typeof (raw as any).message === "string"
          ? (raw as any).message
          : "Failed to load chart data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const isPositive =
    bars.length >= 2 ? bars[bars.length - 1].close >= bars[0].open : true;
  const changePercent =
    bars.length >= 2
      ? ((bars[bars.length - 1].close - bars[0].open) / bars[0].open) * 100
      : 0;

  const gradientColor = isPositive ? "#00FF88" : "#FF3B5C";
  const gradientId = isPositive ? "greenGradient" : "redGradient";

  const minPrice = bars.length ? Math.min(...bars.map((b) => b.low)) * 0.999 : 0;
  const maxPrice = bars.length ? Math.max(...bars.map((b) => b.high)) * 1.001 : 0;
  const openPrice = bars.length ? bars[0].open : null;

  const formatXAxis = (tick: string) => {
    const d = new Date(tick);
    if (timeframe === "1D") {
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="terminal-card bg-terminal-card border border-terminal-border rounded-lg p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-4 h-4 text-terminal-muted" />
          <span className="text-xs text-terminal-muted tracking-widest uppercase">Price Chart</span>
          <span className="text-xs font-bold text-terminal-bright">{symbol}</span>
          {!loading && bars.length > 0 && (
            <div
              className={`flex items-center gap-1 text-xs font-bold ${
                isPositive ? "text-terminal-green" : "text-terminal-red"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {isPositive ? "+" : ""}
              {changePercent.toFixed(2)}%
            </div>
          )}
        </div>
        {/* Timeframe buttons */}
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all duration-200 ${
                timeframe === tf.value
                  ? "bg-terminal-green text-terminal-bg"
                  : "text-terminal-muted hover:text-terminal-bright border border-transparent hover:border-terminal-border"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-terminal-green animate-spin" />
              <span className="text-xs text-terminal-muted">LOADING MARKET DATA...</span>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-terminal-red text-xs mb-1">⚠ DATA ERROR</p>
              <p className="text-terminal-muted text-xs">{error}</p>
              <button
                onClick={fetchHistory}
                className="mt-3 px-3 py-1 text-xs border border-terminal-border text-terminal-text hover:border-terminal-green hover:text-terminal-green rounded transition-all"
              >
                RETRY
              </button>
            </div>
          </div>
        ) : bars.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-terminal-muted text-xs">NO DATA AVAILABLE</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={bars} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF88" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00FF88" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF3B5C" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#FF3B5C" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(30, 45, 61, 0.6)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tickFormatter={formatXAxis}
                tick={{ fill: "#4A5568", fontSize: 10, fontFamily: "JetBrains Mono" }}
                axisLine={{ stroke: "#1E2D3D" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tick={{ fill: "#4A5568", fontSize: 10, fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              {openPrice && (
                <ReferenceLine
                  y={openPrice}
                  stroke="rgba(74, 85, 104, 0.5)"
                  strokeDasharray="4 4"
                />
              )}
              <Area
                type="monotone"
                dataKey="close"
                stroke={gradientColor}
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 3,
                  fill: gradientColor,
                  stroke: "none",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats row */}
      {!loading && bars.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-terminal-border">
          {[
            { label: "OPEN", value: `$${bars[0].open.toFixed(2)}` },
            {
              label: "HIGH",
              value: `$${Math.max(...bars.map((b) => b.high)).toFixed(2)}`,
              color: "text-terminal-green",
            },
            {
              label: "LOW",
              value: `$${Math.min(...bars.map((b) => b.low)).toFixed(2)}`,
              color: "text-terminal-red",
            },
            {
              label: "CLOSE",
              value: `$${bars[bars.length - 1].close.toFixed(2)}`,
              color: "text-terminal-bright",
            },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-terminal-muted text-xs mb-0.5">{stat.label}</p>
              <p className={`text-xs font-bold tabular-nums ${stat.color || "text-terminal-text"}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
