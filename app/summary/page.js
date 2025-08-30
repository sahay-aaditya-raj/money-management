"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Select as UISelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatINR } from "@/lib/format";
import { useExpenses } from "../expenses-provider";

const USERS = ["all", "aaditya", "archana", "rajesh"];
const CATEGORIES = [
  "all",
  "basic",
  "bills",
  "food",
  "fun/entertainment",
  "others",
  "user",
];

function cap(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtDate(d) {
  const dt = new Date(d);
  const m = dt.toLocaleString("en-GB", { month: "short" });
  const day = String(dt.getDate()).padStart(2, "0");
  const year = dt.getFullYear();
  return `${day}-${m}-${year}`;
}

function fmtDateTime(d) {
  const dt = new Date(d);
  // Example: 31 Aug 2025, 14:05
  const date = dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}

export default function SummaryPage() {
  const { items: allItems, deleteExpense } = useExpenses();
  const [filters, setFilters] = useState({
    user: "all",
    category: "all",
    from: "",
    to: "",
    sortBy: "date",
    sortDir: "desc",
    limit: 120,
  });
  const [items, setItems] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [printTime, setPrintTime] = useState(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", String(filters.limit || 500));
    if (filters.user && filters.user !== "all") p.set("user", filters.user);
    if (filters.category && filters.category !== "all")
      p.set("category", filters.category);
    if (filters.from) p.set("from", filters.from);
    if (filters.to) p.set("to", filters.to);
    if (filters.sortBy) p.set("sortBy", filters.sortBy);
    if (filters.sortDir) p.set("sortDir", filters.sortDir);
    return p.toString();
  }, [filters]);

  useEffect(() => {
    // filter locally from cache
    let list = allItems.slice();
    if (filters.user && filters.user !== "all") {
      list = list.filter((x) => x.user === filters.user);
    }
    if (filters.category && filters.category !== "all") {
      list = list.filter((x) => x.category === filters.category);
    }
    if (filters.from) {
      const f = new Date(filters.from);
      list = list.filter((x) => new Date(x.date) >= f);
    }
    if (filters.to) {
      const t = new Date(filters.to);
      // include whole day
      t.setHours(23, 59, 59, 999);
      list = list.filter((x) => new Date(x.date) <= t);
    }
    const dir = filters.sortDir === "asc" ? 1 : -1;
    if (filters.sortBy === "all") {
      list.sort((a, b) =>
        dir * (
          (a.user || "").localeCompare(b.user || "") ||
          (a.category || "").localeCompare(b.category || "") ||
          new Date(a.date) - new Date(b.date)
        ),
      );
    } else if (filters.sortBy === "amount") {
      list.sort((a, b) => dir * (Number(a.amount || 0) - Number(b.amount || 0)));
    } else if (filters.sortBy === "category") {
      list.sort((a, b) => dir * (a.category || "").localeCompare(b.category || ""));
    } else if (filters.sortBy === "user") {
      list.sort((a, b) => dir * (a.user || "").localeCompare(b.user || ""));
    } else {
      // date
      list.sort((a, b) => dir * (new Date(a.date) - new Date(b.date)));
    }
    if (filters.limit && Number.isFinite(filters.limit)) {
      list = list.slice(0, filters.limit);
    }
    setItems(list);
  }, [allItems, query]);

  // Capture the exact timestamp when user initiates print or when print dialog opens
  useEffect(() => {
    const handler = () => setPrintTime(new Date());
    if (typeof window !== "undefined") {
      window.addEventListener("beforeprint", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeprint", handler);
      }
    };
  }, []);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + Number(it.amount || 0), 0),
    [items],
  );

  const onDelete = async (id) => {
    if (!id) return;
    setDeletingId(id);
    try {
      const res = await deleteExpense(id);
      if (!res.ok) throw new Error(res.error || "Failed to delete");
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl p-4 space-y-4 print:p-0">
      <div className="app-screen">
      <div className="card print-hidden">
        <div className="card-header">
          <h1 className="text-lg font-semibold tracking-tight">Summary</h1>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary"
              onClick={() => {
                setPrintTime(new Date());
                window.print();
              }}
            >
              Print / PDF
            </button>
            {filters.limit < 999999 && (
              <button
                className="btn"
                onClick={() => setFilters((f) => ({ ...f, limit: 999999 }))}
                title="Load all data"
              >
                Load all
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs mb-1">User</label>
              <UISelect
                value={filters.user}
                onValueChange={(v) => setFilters((f) => ({ ...f, user: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Users</SelectLabel>
                    {USERS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u === "all" ? "All" : cap(u)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </UISelect>
            </div>
            <div>
              <label className="block text-xs mb-1">Category</label>
              <UISelect
                value={filters.category}
                onValueChange={(v) => setFilters((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c === "fun/entertainment" ? "Entertainment" : c === "all" ? "All" : cap(c)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </UISelect>
            </div>
            <div>
              <label className="block text-xs mb-1">From</label>
              <input
                type="date"
                className="input"
                value={filters.from}
                onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">To</label>
              <input
                type="date"
                className="input"
                value={filters.to}
                onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Sort By</label>
              <UISelect
                value={filters.sortBy}
                onValueChange={(v) => setFilters((f) => ({ ...f, sortBy: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="all">User, Category, Date</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </UISelect>
            </div>
            <div>
              <label className="block text-xs mb-1">Direction</label>
              <UISelect
                value={filters.sortDir}
                onValueChange={(v) => setFilters((f) => ({ ...f, sortDir: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="desc">Desc</SelectItem>
                    <SelectItem value="asc">Asc</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </UISelect>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="text-sm text-gray-600">
            {`${items.length} records${filters.limit && filters.limit < 999999 ? ` (showing up to ${filters.limit})` : ""}`}
          </div>
          <div className="text-sm font-medium">Total: ₹{formatINR(total)}</div>
        </div>
        <div className="card-body">
          <div className="overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50 print:bg-white">
                <tr>
                  <th className="text-left p-2 border-b">S.No</th>
                  <th className="text-left p-2 border-b">Date</th>
                  <th className="text-left p-2 border-b">User</th>
                  <th className="text-left p-2 border-b">Category</th>
                  <th className="text-right p-2 border-b">Amount</th>
                  <th className="text-left p-2 border-b">Note</th>
                  <th className="text-right p-2 border-b print-hidden">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={it._id} className="odd:bg-white even:bg-gray-50 print:bg-white">
                    <td className="p-2 align-top">{idx + 1}</td>
                    <td className="p-2 align-top">{fmtDate(it.date)}</td>
                    <td className="p-2 align-top">{it.user ? cap(it.user) : "-"}</td>
                    <td className="p-2 align-top">{it.category === "fun/entertainment" ? "Entertainment" : cap(it.category)}</td>
                    <td className="p-2 text-right align-top">₹{formatINR(it.amount)}</td>
                    <td className="p-2 align-top text-gray-600">{it.note || ""}</td>
                    <td className="p-2 text-right align-top print-hidden">
                      {it._id && (
                        <button
                          type="button"
                          onClick={() => onDelete(it._id)}
                          className="btn cursor-pointer"
                          disabled={deletingId === it._id}
                          title="Delete"
                        >
                          {deletingId === it._id ? "Deleting..." : "Delete"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td className="p-4 text-center text-gray-500" colSpan={7}>
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>

      {/* Dedicated Print Sheet (A4) */}
      <div className="print-sheet">
        <div className="mb-2">
          <div className="text-lg font-semibold">Summary</div>
          <div className="text-xs">Printed: {fmtDateTime(printTime || Date.now())}</div>
          <div className="text-xs">
            Filters: User {filters.user === "all" ? "All" : cap(filters.user)}, Category {filters.category === "fun/entertainment" ? "Entertainment" : filters.category === "all" ? "All" : cap(filters.category)}, Range {filters.from || filters.to ? `${filters.from ? fmtDate(filters.from) : "—"} to ${filters.to ? fmtDate(filters.to) : "—"}` : "All dates"}
          </div>
          <div className="text-xs">Records: {items.length} • Total: ₹{formatINR(total)}</div>
        </div>
        <table className="w-full text-xs border-collapse" style={{ borderColor: "#000" }}>
          <thead>
            <tr>
              <th className="text-left p-1 border-b" style={{ borderColor: "#000" }}>S.No</th>
              <th className="text-left p-1 border-b" style={{ borderColor: "#000" }}>Date</th>
              <th className="text-left p-1 border-b" style={{ borderColor: "#000" }}>User</th>
              <th className="text-left p-1 border-b" style={{ borderColor: "#000" }}>Category</th>
              <th className="text-right p-1 border-b" style={{ borderColor: "#000" }}>Amount</th>
              <th className="text-left p-1 border-b" style={{ borderColor: "#000" }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it._id || idx}>
                <td className="p-1 align-top" style={{ borderColor: "#000" }}>{idx + 1}</td>
                <td className="p-1 align-top" style={{ borderColor: "#000" }}>{fmtDate(it.date)}</td>
                <td className="p-1 align-top" style={{ borderColor: "#000" }}>{it.user ? cap(it.user) : "-"}</td>
                <td className="p-1 align-top" style={{ borderColor: "#000" }}>{it.category === "fun/entertainment" ? "Entertainment" : cap(it.category)}</td>
                <td className="p-1 text-right align-top" style={{ borderColor: "#000" }}>₹{formatINR(it.amount)}</td>
                <td className="p-1 align-top" style={{ borderColor: "#000" }}>{it.note || ""}</td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td className="p-2 text-center" colSpan={6}>No data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          nav { display: none !important; }
          .app-screen { display: none !important; }
          .card { box-shadow: none !important; border: 0 !important; }
          .card-header { border: 0 !important; padding: 0 0 8px 0 !important; }
          .card-body { padding: 0 !important; }
          .btn, .btn-secondary, .select, .input, .print-hidden { display: none !important; }
          a[href]:after { content: "" !important; }
          body { background: #fff !important; color: #000 !important; }
        }
        .print-sheet { display: none; }
        @media print { .print-sheet { display: block !important; } }
      `}</style>
    </main>
  );
}
