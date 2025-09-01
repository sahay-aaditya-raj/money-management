import { NextResponse } from "next/server";
import { summaryTotals } from "@/models/expense";
import { isAuthorized } from "@/lib/auth";

export async function GET(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: true, byCategory: {}, byUser: {} });
    }
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
