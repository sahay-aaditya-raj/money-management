import { NextResponse } from "next/server";
import { availableYears } from "@/models/expense";
import { isAuthorized } from "@/lib/auth";

export async function GET(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: true, data: [] });
    }
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
