import { NextResponse } from "next/server";
import { timeSeriesSummary } from "@/models/expense";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get("period") || "month"; // day|week|month
    const days = url.searchParams.get("days");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const user = url.searchParams.get("user");
    const category = url.searchParams.get("category");
    const data = await timeSeriesSummary({
      period,
      days,
      from,
      to,
      user,
      category,
    });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("GET /api/reports/time-series error", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
