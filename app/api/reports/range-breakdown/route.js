import { NextResponse } from "next/server";
import { rangeBreakdown } from "@/models/expense";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const user = url.searchParams.get("user");
    const category = url.searchParams.get("category");
    const days = url.searchParams.get("days");
    const data = await rangeBreakdown({ from, to, days, user, category });
    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    console.error("GET /api/reports/range-breakdown error", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
