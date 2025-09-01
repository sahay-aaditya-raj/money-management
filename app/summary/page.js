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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { formatINR } from "@/lib/format";
import { useExpenses } from "../expenses-provider";
import {
  USERS_WITH_ALL,
  CATEGORIES_WITH_ALL,
  getCategoryLabel,
  getUserLabel,
} from "@/lib/data";

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
  const date = dt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = dt.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
      list.sort(
        (a, b) =>
          dir *
          ((a.user || "").localeCompare(b.user || "") ||
            (a.category || "").localeCompare(b.category || "") ||
            new Date(a.date) - new Date(b.date)),
      );
    } else if (filters.sortBy === "amount") {
      list.sort(
        (a, b) => dir * (Number(a.amount || 0) - Number(b.amount || 0)),
      );
    } else if (filters.sortBy === "category") {
      list.sort(
        (a, b) => dir * (a.category || "").localeCompare(b.category || ""),
      );
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
        <Card className="print-hidden mb-6">
          <CardHeader className="flex flex-row items-center justify-between gap-2 border-b pb-4">
            <h1 className="text-lg font-semibold tracking-tight">Summary</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPrintTime(new Date());
                  window.print();
                }}
              >
                Print / PDF
              </Button>
              {filters.limit < 999999 && (
                <Button
                  onClick={() => setFilters((f) => ({ ...f, limit: 999999 }))}
                  title="Load all data"
                >
                  Load all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div>
                <Label className="block text-xs mb-1">User</Label>
                <UISelect
                  value={filters.user}
                  onValueChange={(v) => setFilters((f) => ({ ...f, user: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Users</SelectLabel>
                      {USERS_WITH_ALL.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </UISelect>
              </div>
              <div>
                <Label className="block text-xs mb-1">Category</Label>
                <UISelect
                  value={filters.category}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, category: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      {CATEGORIES_WITH_ALL.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </UISelect>
              </div>
              <div>
                <Label className="block text-xs mb-1">From</Label>
                <DatePicker
                  id="from"
                  value={filters.from}
                  onChange={(v) => setFilters((f) => ({ ...f, from: v }))}
                />
              </div>
              <div>
                <Label className="block text-xs mb-1">To</Label>
                <DatePicker
                  id="to"
                  value={filters.to}
                  onChange={(v) => setFilters((f) => ({ ...f, to: v }))}
                />
              </div>
              <div>
                <Label className="block text-xs mb-1">Sort By</Label>
                <UISelect
                  value={filters.sortBy}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, sortBy: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </UISelect>
              </div>
              <div>
                <Label className="block text-xs mb-1">Direction</Label>
                <UISelect
                  value={filters.sortDir}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, sortDir: v }))
                  }
                >
                  <SelectTrigger className="w-full">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between gap-2 border-b pb-4">
            <div className="text-sm text-gray-600">
              {`${items.length} records${filters.limit && filters.limit < 999999 ? ` (showing up to ${filters.limit})` : ""}`}
            </div>
            <div className="text-sm font-medium">
              Total: ₹{formatINR(total)}
            </div>
          </CardHeader>
          <CardContent className="">
            {/* Mobile list */}
            <div className="grid gap-2 sm:hidden">
              {items.map((it, idx) => (
                <div
                  key={it._id || idx}
                  className="rounded-md border p-3 bg-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">₹{formatINR(it.amount)}</div>
                    <div className="text-xs text-gray-500">
                      {fmtDate(it.date)}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {it.category === "fun/entertainment"
                      ? "Entertainment"
                      : cap(it.category)}
                    {it.user ? ` · ${cap(it.user)}` : ""}
                    {it.note ? ` · ${it.note}` : ""}
                  </div>
                  {it._id && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => onDelete(it._id)}
                        className="cursor-pointer"
                        disabled={deletingId === it._id}
                        size="sm"
                      >
                        {deletingId === it._id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {!items.length && (
                <div className="text-center text-gray-500 py-4">No data</div>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader className="bg-gray-50 print:bg-white">
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right print-hidden">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it, idx) => (
                    <TableRow key={it._id} className="print:bg-white">
                      <TableCell className="align-top">{idx + 1}</TableCell>
                      <TableCell className="align-top">
                        {fmtDate(it.date)}
                      </TableCell>
                      <TableCell className="align-top">
                        {it.user ? cap(it.user) : "-"}
                      </TableCell>
                      <TableCell className="align-top">
                        {it.category === "fun/entertainment"
                          ? "Entertainment"
                          : cap(it.category)}
                      </TableCell>
                      <TableCell className="text-right align-top">
                        ₹{formatINR(it.amount)}
                      </TableCell>
                      <TableCell className="align-top text-gray-600">
                        {it.note || ""}
                      </TableCell>
                      <TableCell className="text-right align-top print-hidden">
                        {it._id && (
                          <Button
                            type="button"
                            onClick={() => onDelete(it._id)}
                            className="cursor-pointer"
                            disabled={deletingId === it._id}
                            title="Delete"
                          >
                            {deletingId === it._id ? "Deleting..." : "Delete"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!items.length && (
                    <TableRow>
                      <TableCell
                        className="p-4 text-center text-gray-500"
                        colSpan={7}
                      >
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dedicated Print Sheet (A4) */}
      <div className="print-sheet">
        <div className="mb-2">
          <div className="text-lg font-semibold">Summary</div>
          <div className="text-xs">
            Printed: {fmtDateTime(printTime || Date.now())}
          </div>
          <div className="text-xs">
            Filters: User {filters.user === "all" ? "All" : cap(filters.user)},
            Category{" "}
            {filters.category === "fun/entertainment"
              ? "Entertainment"
              : filters.category === "all"
                ? "All"
                : cap(filters.category)}
            , Range{" "}
            {filters.from || filters.to
              ? `${filters.from ? fmtDate(filters.from) : "—"} to ${filters.to ? fmtDate(filters.to) : "—"}`
              : "All dates"}
          </div>
          <div className="text-xs">
            Records: {items.length} • Total: ₹{formatINR(total)}
          </div>
        </div>
        <table
          className="w-full text-xs border-collapse"
          style={{ borderColor: "#000" }}
        >
          <thead>
            <tr>
              <th
                className="text-left p-1 border-b"
                style={{ borderColor: "#000" }}
              >
                S.No
              </th>
              <th
                className="text-left p-1 border-b"
                style={{ borderColor: "#000" }}
              >
                Date
              </th>
              <th
                className="text-left p-1 border-b"
                style={{ borderColor: "#000" }}
              >
                User
              </th>
              <th
                className="text-left p-1 border-b"
                style={{ borderColor: "#000" }}
              >
                Category
              </th>
              <th
                className="text-right p-1 border-b"
                style={{ borderColor: "#000" }}
              >
                Amount
              </th>
              <th
                className="text-left p-1 border-b"
                style={{ borderColor: "#000" }}
              >
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it._id || idx}>
                <td className="p-1 align-top" style={{ borderColor: "#000" }}>
                  {idx + 1}
                </td>
                <td className="p-1 align-top" style={{ borderColor: "#000" }}>
                  {fmtDate(it.date)}
                </td>
                <td className="p-1 align-top" style={{ borderColor: "#000" }}>
                  {it.user ? cap(it.user) : "-"}
                </td>
                <td className="p-1 align-top" style={{ borderColor: "#000" }}>
                  {it.category === "fun/entertainment"
                    ? "Entertainment"
                    : cap(it.category)}
                </td>
                <td
                  className="p-1 text-right align-top"
                  style={{ borderColor: "#000" }}
                >
                  ₹{formatINR(it.amount)}
                </td>
                <td className="p-1 align-top" style={{ borderColor: "#000" }}>
                  {it.note || ""}
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td className="p-2 text-center" colSpan={6}>
                  No data
                </td>
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
