import { NextResponse } from "next/server";
import { summaryTotals } from "@/models/expense";

export async function GET() {
  try {
    const { byCategory, byUser } = await summaryTotals();
    return NextResponse.json({ ok: true, byCategory, byUser });
  } catch (err) {
    console.error("GET /api/summary error", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
