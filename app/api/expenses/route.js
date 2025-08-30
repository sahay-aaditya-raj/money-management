import { NextResponse } from "next/server";
import { createExpense, deleteExpense, listExpenses } from "@/models/expense";

// GET /api/expenses -> list expenses
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const limit = Number(searchParams.get("limit") ?? 100);
    const days = searchParams.get("days");
    const user = searchParams.get("user") || undefined;
    const category = searchParams.get("category") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const sortBy = searchParams.get("sortBy") || undefined;
    const sortDir = searchParams.get("sortDir") || undefined;
    const items = await listExpenses({
      limit,
      days,
      user,
      category,
      from,
      to,
      sortBy,
      sortDir,
    });
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("GET /api/expenses error", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}

// POST /api/expenses -> create expense
export async function POST(request) {
  try {
    const body = await request.json();
    const item = await createExpense(body);
    return NextResponse.json({ ok: true, id: item._id, item });
  } catch (err) {
    console.error("POST /api/expenses error", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}

// DELETE /api/expenses?id=<id>
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const { deleted } = await deleteExpense(id);
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/expenses error", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
