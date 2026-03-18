import { NextRequest, NextResponse } from "next/server";
import { alpacaDataClient } from "./lib/alpaca";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    // Get latest trade price
    const [tradeRes, quoteRes] = await Promise.all([
      alpacaDataClient.get(`/v2/stocks/${symbol.toUpperCase()}/trades/latest`),
      alpacaDataClient.get(`/v2/stocks/${symbol.toUpperCase()}/quotes/latest`),
    ]);

    const trade = tradeRes.data.trade;
    const quote = quoteRes.data.quote;

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      price: trade.p,
      size: trade.s,
      timestamp: trade.t,
      bid: quote.bp,
      ask: quote.ap,
      bidSize: quote.bs,
      askSize: quote.as,
    });
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown; status?: number }; message?: string };
    console.error("Price fetch error:", err?.response?.data || err?.message);
    return NextResponse.json(
      { error: err?.response?.data || "Failed to fetch price" },
      { status: err?.response?.status || 500 }
    );
  }
}
