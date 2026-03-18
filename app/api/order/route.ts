import { NextRequest, NextResponse } from "next/server";
import { alpacaClient, OrderSide, OrderType } from "../../../lib/alpaca";

interface OrderBody {
  symbol: string;
  qty: number;
  side: OrderSide;
  type?: OrderType;
  time_in_force?: string;
  limit_price?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderBody = await request.json();
    const { symbol, qty, side, type = "market", time_in_force = "day", limit_price } = body;

    if (!symbol || !qty || !side) {
      return NextResponse.json(
        { error: "symbol, qty, and side are required" },
        { status: 400 }
      );
    }

    if (!["buy", "sell"].includes(side)) {
      return NextResponse.json(
        { error: "side must be 'buy' or 'sell'" },
        { status: 400 }
      );
    }

    if (qty <= 0) {
      return NextResponse.json({ error: "qty must be greater than 0" }, { status: 400 });
    }

    const orderPayload: Record<string, unknown> = {
      symbol: symbol.toUpperCase(),
      qty: qty.toString(),
      side,
      type,
      time_in_force,
    };

    if (type === "limit" && limit_price) {
      orderPayload.limit_price = limit_price.toString();
    }

    const response = await alpacaClient.post("/v2/orders", orderPayload);

    return NextResponse.json({
      success: true,
      order: response.data,
    });
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown; status?: number }; message?: string };
    console.error("Order error:", err?.response?.data || err?.message);
    return NextResponse.json(
      { error: err?.response?.data || "Failed to place order" },
      { status: err?.response?.status || 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await alpacaClient.get("/v2/orders", {
      params: { status: "all", limit: 50, direction: "desc" },
    });
    return NextResponse.json({ orders: response.data });
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown; status?: number }; message?: string };
    return NextResponse.json(
      { error: err?.response?.data || "Failed to fetch orders" },
      { status: err?.response?.status || 500 }
    );
  }
}

