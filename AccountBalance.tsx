"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, RefreshCw, Loader2, Wallet, BarChart2 } from "lucide-react";
import axios from "axios";
import { Account } from "./lib/alpaca";

interface AccountBalanceProps {
  refreshTrigger?: number;
}

function StatCard({
  label,
  value,
  subValue,
  color,
}: {
  label: string;
  value: string;
  subValue?: string;
  color?: string;
}) {
  return (
    <div className="bg-terminal-surface border border-terminal-border/60 rounded p-3">
      <p className="text-xs text-terminal-muted tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${color || "text-terminal-bright"}`}>
        {value}
      </p>
      {subValue && <p className="text-xs text-terminal-muted mt-0.5 tabular-nums">{subValue}</p>}
    </div>
  );
}

export default function AccountBalance({ refreshTrigger }: AccountBalanceProps) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/account");
      setAccount(res.data.account);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || "Failed to fetch account");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount, refreshTrigger]);

  const portfolioChange = account
    ? parseFloat(account.equity) - parseFloat(account.last_equity)
    : 0;
  const portfolioChangePct = account
    ? (portfolioChange / parseFloat(account.last_equity)) * 100
    : 0;
  const isPositive = portfolioChange >= 0;

  return (
    <div className="terminal-card bg-terminal-card border border-terminal-border rounded-lg p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-terminal-muted" />
          <span className="text-xs text-terminal-muted tracking-widest uppercase">
            Account Overview
          </span>
          <span className="px-1.5 py-0.5 text-xs bg-terminal-green/10 border border-terminal-green/20 rounded text-terminal-green">
            PAPER
          </span>
        </div>
        <button
          onClick={fetchAccount}
          disabled={loading}
          className="text-terminal-muted hover:text-terminal-green transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && !account ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-terminal-green animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-terminal-red text-xs mb-2">⚠ {error}</p>
          <button
            onClick={fetchAccount}
            className="text-xs border border-terminal-border text-terminal-muted hover:border-terminal-green hover:text-terminal-green px-3 py-1 rounded transition-all"
          >
            RETRY
          </button>
        </div>
      ) : account ? (
        <>
          {/* Portfolio value hero */}
          <div className="mb-4 pb-4 border-b border-terminal-border">
            <p className="text-xs text-terminal-muted tracking-wider mb-1">PORTFOLIO VALUE</p>
            <div className="flex items-end gap-3">
              <p className="text-2xl font-bold tabular-nums text-terminal-bright">
                ${parseFloat(account.portfolio_value).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <div
                className={`flex items-center gap-1 text-xs font-bold pb-0.5 ${
                  isPositive ? "text-terminal-green" : "text-terminal-red"
                }`}
              >
                <span>
                  {isPositive ? "+" : ""}${portfolioChange.toFixed(2)}
                </span>
                <span className="text-terminal-muted">
                  ({isPositive ? "+" : ""}
                  {portfolioChangePct.toFixed(2)}%)
                </span>
              </div>
            </div>
            <p className="text-xs text-terminal-muted mt-1">
              Yesterday: $
              {parseFloat(account.last_equity).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="CASH BALANCE"
              value={`$${parseFloat(account.cash).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}`}
            />
            <StatCard
              label="BUYING POWER"
              value={`$${parseFloat(account.buying_power).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}`}
            />
            <StatCard
              label="LONG MKT VALUE"
              value={`$${parseFloat(account.long_market_value || "0").toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}`}
            />
            <StatCard
              label="DAYTRADES LEFT"
              value={account.daytrade_count !== undefined ? `${3 - account.daytrade_count}/3` : "N/A"}
              subValue="PDT rule"
            />
          </div>

          {/* Account status */}
          <div className="mt-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-terminal-green live-dot" />
            <span className="text-xs text-terminal-muted">
              Account #{account.account_number} · Status:{" "}
              <span className="text-terminal-green">{account.status?.toUpperCase()}</span>
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
