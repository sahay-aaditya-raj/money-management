import { NextResponse } from "next/server";
import { APP_TOKEN, credentialsValid } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body || {};
    if (!username || !password)
      return NextResponse.json(
        { ok: false, error: "Username and password are required" },
        { status: 400 },
      );
    const ok = credentialsValid(username, password);
    if (!ok)
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 },
      );
    // On success return a constant token
    return NextResponse.json({ ok: true, token: APP_TOKEN, user: username });
  } catch (err) {
    console.error("POST /api/login error", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
