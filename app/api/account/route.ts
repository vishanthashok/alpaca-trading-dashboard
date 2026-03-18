import { NextResponse } from "next/server";
import { alpacaClient } from "@/lib/alpaca";

export async function GET() {
  try {
    const response = await alpacaClient.get("/v2/account");
    return NextResponse.json({ account: response.data });
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown; status?: number }; message?: string };
    console.error("Account fetch error:", err?.response?.data || err?.message);
    return NextResponse.json(
      { error: err?.response?.data || "Failed to fetch account" },
      { status: err?.response?.status || 500 }
    );
  }
}

