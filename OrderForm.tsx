"use client";

import { useState } from "react";
import { ShoppingCart, TrendingDown, CheckCircle, XCircle, Loader2, X } from "lucide-react";
import axios from "axios";

interface OrderFormProps {
  symbol: string;
  currentPrice: number | null;
  onOrderPlaced?: () => void;
}

type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit";

interface OrderResult {
  success: boolean;
  order?: {
    id: string;
    symbol: string;
    qty: string;
    side: string;
    status: string;
    type: string;
    submitted_at: string;
  };
  error?: string;
}

export default function OrderForm({ symbol, currentPrice, onOrderPlaced }: OrderFormProps) {
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [qty, setQty] = useState<string>("1");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const estimatedTotal =
    currentPrice && qty ? (currentPrice * parseFloat(qty || "0")).toFixed(2) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qty || parseFloat(qty) <= 0) return;
    setShowConfirm(true);
  };

  const executeOrder = async () => {
    setShowConfirm(false);
    setLoading(true);
    setResult(null);
    try {
      const payload: Record<string, unknown> = {
        symbol,
        qty: parseFloat(qty),
        side,
        type: orderType,
      };
      if (orderType === "limit" && limitPrice) {
        payload.limit_price = parseFloat(limitPrice);
      }
      const res = await axios.post("/api/order", payload);
      setResult({ success: true, order: res.data.order });
      onOrderPlaced?.();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } | string } } };
      const errData = e?.response?.data?.error;
      const msg =
        typeof errData === "object" && errData?.message
          ? errData.message
          : typeof errData === "string"
          ? errData
          : "Order failed";
      setResult({ success: false, error: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="terminal-card bg-terminal-card border border-terminal-border rounded-lg p-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-4 h-4 text-terminal-muted" />
          <span className="text-xs text-terminal-muted tracking-widest uppercase">
            Place Order
          </span>
          <span className="text-xs font-bold text-terminal-bright ml-1">{symbol}</span>
        </div>

        {/* Buy/Sell toggle */}
        <div className="flex rounded overflow-hidden border border-terminal-border mb-4">
          <button
            type="button"
            onClick={() => setSide("buy")}
            className={`flex-1 py-2.5 text-xs font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
              side === "buy"
                ? "bg-terminal-green text-terminal-bg"
                : "text-terminal-muted hover:text-terminal-green"
            }`}
          >
            <ShoppingCart className="w-3 h-3" />
            BUY
          </button>
          <button
            type="button"
            onClick={() => setSide("sell")}
            className={`flex-1 py-2.5 text-xs font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
              side === "sell"
                ? "bg-terminal-red text-white"
                : "text-terminal-muted hover:text-terminal-red"
            }`}
          >
            <TrendingDown className="w-3 h-3" />
            SELL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Order type */}
          <div>
            <label className="text-xs text-terminal-muted tracking-wider block mb-1.5">
              ORDER TYPE
            </label>
            <div className="flex gap-2">
              {(["market", "limit"] as OrderType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOrderType(t)}
                  className={`px-3 py-1.5 text-xs font-bold rounded border transition-all duration-200 ${
                    orderType === t
                      ? "border-terminal-green text-terminal-green bg-terminal-green/10"
                      : "border-terminal-border text-terminal-muted hover:border-terminal-text"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs text-terminal-muted tracking-wider block mb-1.5">
              QUANTITY (SHARES)
            </label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              min="0.001"
              step="1"
              placeholder="0"
              required
              className="w-full px-3 py-2 text-sm rounded border bg-terminal-surface border-terminal-border text-terminal-bright placeholder:text-terminal-muted focus:outline-none focus:border-terminal-green transition-all tabular-nums"
            />
          </div>

          {/* Limit price (conditional) */}
          {orderType === "limit" && (
            <div>
              <label className="text-xs text-terminal-muted tracking-wider block mb-1.5">
                LIMIT PRICE
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted text-sm">
                  $
                </span>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  min="0.01"
                  step="0.01"
                  placeholder={currentPrice?.toFixed(2) || "0.00"}
                  required
                  className="w-full pl-7 pr-3 py-2 text-sm rounded border bg-terminal-surface border-terminal-border text-terminal-bright placeholder:text-terminal-muted focus:outline-none focus:border-terminal-green transition-all tabular-nums"
                />
              </div>
            </div>
          )}

          {/* Estimated total */}
          {estimatedTotal && orderType === "market" && (
            <div className="flex justify-between items-center py-2 px-3 rounded bg-terminal-surface border border-terminal-border">
              <span className="text-xs text-terminal-muted">EST. TOTAL</span>
              <span className="text-sm font-bold tabular-nums text-terminal-bright">
                ${estimatedTotal}
              </span>
            </div>
          )}

          {/* Current price display */}
          {currentPrice && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-terminal-muted">MARKET PRICE</span>
              <span className="text-xs tabular-nums text-terminal-text">
                ${currentPrice.toFixed(2)}
              </span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !qty || parseFloat(qty) <= 0}
            className={`w-full py-3 text-xs font-bold tracking-widest rounded transition-all duration-200 flex items-center justify-center gap-2 ${
              side === "buy"
                ? "bg-terminal-green text-terminal-bg hover:bg-terminal-green-dim disabled:opacity-50"
                : "bg-terminal-red text-white hover:bg-terminal-red-dim disabled:opacity-50"
            } disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                EXECUTING...
              </>
            ) : (
              `${side.toUpperCase()} ${qty || "0"} ${symbol}`
            )}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div
            className={`mt-3 p-3 rounded border text-xs animate-slide-in ${
              result.success
                ? "border-terminal-green/30 bg-terminal-green/5 text-terminal-green"
                : "border-terminal-red/30 bg-terminal-red/5 text-terminal-red"
            }`}
          >
            {result.success ? (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold mb-1">ORDER SUBMITTED</p>
                  <p className="text-terminal-text">
                    {result.order?.side?.toUpperCase()} {result.order?.qty} {result.order?.symbol}
                  </p>
                  <p className="text-terminal-muted mt-0.5">
                    Status: {result.order?.status?.toUpperCase()}
                  </p>
                  <p className="text-terminal-muted">
                    ID: {result.order?.id?.slice(0, 8)}...
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold mb-1">ORDER FAILED</p>
                  <p className="text-terminal-red/70">{result.error}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-terminal-bg/80"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative bg-terminal-card border border-terminal-border rounded-lg p-6 w-full max-w-sm animate-slide-in shadow-card">
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-3 right-3 text-terminal-muted hover:text-terminal-bright transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display text-sm font-bold tracking-widest text-terminal-bright mb-4">
              CONFIRM ORDER
            </h3>
            <div className="space-y-2 mb-5">
              {[
                { label: "SYMBOL", value: symbol },
                { label: "ACTION", value: side.toUpperCase(), color: side === "buy" ? "text-terminal-green" : "text-terminal-red" },
                { label: "QUANTITY", value: `${qty} shares` },
                { label: "TYPE", value: orderType.toUpperCase() },
                ...(orderType === "market" && currentPrice
                  ? [{ label: "EST. TOTAL", value: `$${(currentPrice * parseFloat(qty || "0")).toFixed(2)}` }]
                  : orderType === "limit" && limitPrice
                  ? [{ label: "LIMIT PRICE", value: `$${parseFloat(limitPrice).toFixed(2)}` }]
                  : []),
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-terminal-border/50">
                  <span className="text-xs text-terminal-muted">{row.label}</span>
                  <span className={`text-xs font-bold tabular-nums ${row.color || "text-terminal-bright"}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-terminal-muted mb-4">
              ⚠ Paper trading order. No real money at risk.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 text-xs font-bold border border-terminal-border text-terminal-muted hover:border-terminal-bright hover:text-terminal-bright rounded transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={executeOrder}
                className={`flex-1 py-2 text-xs font-bold rounded transition-all ${
                  side === "buy"
                    ? "bg-terminal-green text-terminal-bg hover:bg-terminal-green-dim"
                    : "bg-terminal-red text-white hover:bg-terminal-red-dim"
                }`}
              >
                CONFIRM {side.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
