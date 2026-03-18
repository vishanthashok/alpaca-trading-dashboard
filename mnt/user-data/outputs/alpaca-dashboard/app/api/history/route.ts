import { NextRequest, NextResponse } from "next/server";
import { alpacaDataClient, Bar } from "@/lib/alpaca";
import { format, subDays, subWeeks, subMonths } from "date-fns";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const timeframe = searchParams.get("timeframe") || "1D"; // 1D, 1W, 1M, 3M

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const now = new Date();
  let start: Date;
  let barTimeframe: string;
  let limit: number;

  switch (timeframe) {
    case "1D":
      start = subDays(now, 1);
      barTimeframe = "5Min";
      limit = 78; // ~6.5h market * 12 bars/h
      break;
    case "1W":
      start = subWeeks(now, 1);
      barTimeframe = "1Hour";
      limit = 40;
      break;
    case "1M":
      start = subMonths(now, 1);
      barTimeframe = "1Day";
      limit = 30;
      break;
    case "3M":
      start = subMonths(now, 3);
      barTimeframe = "1Day";
      limit = 90;
      break;
    default:
      start = subDays(now, 1);
      barTimeframe = "5Min";
      limit = 78;
  }

  try {
    const response = await alpacaDataClient.get(`/v2/stocks/${symbol.toUpperCase()}/bars`, {
      params: {
        timeframe: barTimeframe,
        start: format(start, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        end: format(now, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        limit,
        adjustment: "raw",
        feed: "iex",
      },
    });

    const bars: Bar[] = response.data.bars || [];

    const formatted = bars.map((bar) => ({
      time: bar.t,
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
      // For display
      displayTime: new Date(bar.t).toLocaleString(),
    }));

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      timeframe,
      bars: formatted,
    });
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown; status?: number }; message?: string };
    console.error("History fetch error:", err?.response?.data || err?.message);
    return NextResponse.json(
      { error: err?.response?.data || "Failed to fetch history" },
      { status: err?.response?.status || 500 }
    );
  }
}
