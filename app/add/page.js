"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatINR } from "@/lib/format";

const CATEGORIES = [
  { value: "basic", label: "Basic" },
  { value: "bills", label: "Bills" },
  { value: "fun/entertainment", label: "Fun/Entertainment" },
  { value: "food", label: "Food" },
  { value: "others", label: "Others" },
];

const USERS = [
  { value: "aaditya", label: "Aaditya" },
  { value: "archana", label: "Archana" },
  { value: "rajesh", label: "Rajesh" },
];

export default function AddRecordPage() {
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("basic");
  const [user, setUser] = useState(USERS[0].value);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/expenses?days=60");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load");
      setItems(json.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = useMemo(
    () => items.reduce((sum, it) => sum + (it.amount || 0), 0),
    [items],
  );

  function formatDateShort(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const months = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const mon = months[d.getMonth()];
    const yyyy = d.getFullYear();
    return `${dd}-${mon}-${yyyy}`;
  }

  function formatUserName(name) {
    if (!name || typeof name !== "string") return "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = { amount: Number(amount), category, user, note, date };
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to add");
      setAmount(0);
      setNote("");
      setDate(new Date().toISOString().slice(0, 10));
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id) {
    const prev = items;
    setDeletingId(id);
    setItems((curr) => curr.filter((it) => it._id !== id));
    try {
      const res = await fetch(`/api/expenses?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to delete");
    } catch (e) {
      setItems(prev);
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Add Record</h1>
        <p className="text-sm text-gray-500">Create a new expense entry.</p>
      </header>

      <form onSubmit={onSubmit} className="card">
        <div className="card-body grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div className="md:col-span-1">
            <label htmlFor="amount" className="block text-sm font-medium">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              id="amount"
              className="mt-1 input"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="category" className="block text-sm font-medium">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              id="category"
              className="mt-1 select"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label htmlFor="user" className="block text-sm font-medium">
              User
            </label>
            <select
              value={user}
              onChange={(e) => setUser(e.target.value)}
              id="user"
              className="mt-1 select"
            >
              {USERS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="note" className="block text-sm font-medium">
              Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional description"
              id="note"
              className="mt-1 input"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="date" className="block text-sm font-medium">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              id="date"
              className="mt-1 input"
            />
          </div>
          <div className="md:col-span-1">
            <button disabled={submitting} type="submit" className="w-full btn">
              {submitting ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent Expenses (60 days)</h2>
          <div className="text-sm text-gray-600">Total: ₹{formatINR(total)}</div>
        </div>
        {loading ? (
          <div>Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No expenses yet</div>
        ) : (
          <ul className="divide-y rounded border card">
            {items.map((it, idx) => (
              <li
                key={it._id || `${it.date}-${idx}`}
                className="p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3"
              >
                <div>
                  <div className="font-medium">₹{formatINR(it.amount)}</div>
                  <div className="text-xs text-gray-500">
                    {it.category}
                    {it.user ? ` · ${formatUserName(it.user)}` : ""}
                    {it.note ? ` · ${it.note}` : ""}
                  </div>
                </div>
                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3">
                  <div className="text-xs text-gray-500">
                    {it.date ? formatDateShort(it.date) : ""}
                  </div>
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
