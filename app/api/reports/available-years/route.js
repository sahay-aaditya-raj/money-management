import { NextResponse } from "next/server";
import { availableYears } from "@/models/expense";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const user = url.searchParams.get("user");
    const category = url.searchParams.get("category");
    const data = await availableYears({ user, category });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("GET /api/reports/available-years error", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
