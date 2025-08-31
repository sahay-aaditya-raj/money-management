"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ExpensesContext = createContext(null);

const CACHE_KEY = "expenses_cache_v1";

function parseDate(value) {
  try {
    return new Date(value);
  } catch {
    return new Date();
  }
}

function sortByDateDesc(a, b) {
  const da = parseDate(a.date).getTime();
  const db = parseDate(b.date).getTime();
  if (db !== da) return db - da;
  // tie-breaker: amount desc, then createdAt if present
  if (typeof b.amount === "number" && typeof a.amount === "number") {
    if (b.amount !== a.amount) return b.amount - a.amount;
  }
  return 0;
}

export function ExpensesProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false); // whether we have any data loaded (cache or server)
  const [error, setError] = useState("");
  const loadedFromServerRef = useRef(false);

  // Hydrate from localStorage (no server call)
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" && localStorage.getItem(CACHE_KEY);
      if (raw) {
        const { items: cachedItems } = JSON.parse(raw);
        if (Array.isArray(cachedItems)) {
          setItems(cachedItems);
          setLoaded(true);
        }
      }
    } catch {
      // ignore cache errors
    }
  }, []);

  // Persist to localStorage when items change
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ items }));
      }
    } catch {
      // ignore
    }
  }, [items]);

  const ensureLoaded = useCallback(
    async (force = false) => {
      if (loading) return;
      if (!force && (loadedFromServerRef.current || loaded)) return;
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ sortBy: "date", sortDir: "desc" });
        const res = await fetch(`/api/expenses?${params.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Failed to load expenses");
        const list = Array.isArray(json.items)
          ? json.items.slice().sort(sortByDateDesc)
          : [];
        setItems(list);
        setLoaded(true);
        loadedFromServerRef.current = true;
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    },
    [loading, loaded],
  );

  const addExpense = useCallback(async (payload) => {
    // payload: { amount:number, category, user, note, date }
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || "Failed to add");
    const item = json.item || { ...payload, _id: json.id };
    setItems((prev) => {
      const next = prev ? prev.slice() : [];
      // de-dup by _id if any
      const id = item._id;
      const idx = id ? next.findIndex((x) => x._id === id) : -1;
      if (idx >= 0) next.splice(idx, 1);
      next.push(item);
      next.sort(sortByDateDesc);
      return next;
    });
    setLoaded(true);
    return item;
  }, []);

  const deleteExpense = useCallback(async (id) => {
    if (!id) return { ok: false };
    let backup;
    setItems((prev) => {
      backup = prev;
      return prev.filter((x) => x._id !== id);
    });
    const res = await fetch(`/api/expenses?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!json.ok) {
      // rollback
      setItems(backup || []);
      return { ok: false, error: json.error || "Failed to delete" };
    }
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({
      items,
      loading,
      loaded,
      error,
      ensureLoaded,
      addExpense,
      deleteExpense,
      setItems,
    }),
    [items, loading, loaded, error, ensureLoaded, addExpense, deleteExpense],
  );

  return (
    <ExpensesContext.Provider value={value}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used within ExpensesProvider");
  return ctx;
}
