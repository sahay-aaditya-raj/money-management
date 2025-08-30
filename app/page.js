"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatINR } from "@/lib/format";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useExpenses } from "./expenses-provider";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#a4de6c",
];

export default function ReportsPage() {
  // Prime cache: Load all expenses on first visit to '/'
  // Other pages will consume cached data from ExpensesProvider
  // Controls
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [days, setDays] = useState(90); // used for pie
  const [selectedUser, setSelectedUser] = useState("all");
  const [category, setCategory] = useState("all");
  const [isMobile, setIsMobile] = useState(false);
  // Data from provider
  const { items, ensureLoaded, loading: loadingAll, error: loadError } = useExpenses();
  const [yearsAvail, setYearsAvail] = useState([]);
  // Ensure cache is loaded when landing on '/'
  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  // Detect mobile width for responsive chart sizing
  useEffect(() => {
    const update = () =>
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Compute available years locally
  useEffect(() => {
    const filtered = items.filter((it) => {
      if (selectedUser !== "all" && it.user !== selectedUser) return false;
      if (category !== "all" && it.category !== category) return false;
      return true;
    });
    const years = Array.from(new Set(filtered.map((it) => new Date(it.date).getFullYear()))).sort((a, b) => b - a);
    setYearsAvail(years);
    if (years.length && !years.includes(year)) setYear(years[0]);
  }, [items, selectedUser, category, year]);

  // Compute pie breakdown locally for last `days`
  const { pieCategory, pieUser, pieTotal } = useMemo(() => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - Number(days || 0));
    const filtered = items.filter((it) => {
      const d = new Date(it.date);
      if (days && d < from) return false;
      if (selectedUser !== "all" && it.user !== selectedUser) return false;
      if (category !== "all" && it.category !== category) return false;
      return true;
    });
    const byCategory = new Map();
    const byUser = new Map();
    for (const it of filtered) {
      const c = it.category || "unknown";
      byCategory.set(c, (byCategory.get(c) || 0) + Number(it.amount || 0));
      const u = it.user || "unknown";
      byUser.set(u, (byUser.get(u) || 0) + Number(it.amount || 0));
    }
    const pieCategory = Array.from(byCategory.entries()).map(([name, value]) => ({ name, value }));
    const pieUser = Array.from(byUser.entries()).map(([name, value]) => ({ name, value }));
    const pieTotal = pieCategory.reduce((s, x) => s + x.value, 0);
    return { pieCategory, pieUser, pieTotal };
  }, [items, days, selectedUser, category]);

  // Format date as DD-MM-YYYY in IST (kept for reference if needed elsewhere)
  // function formatDateDMY(dateStr) {
  //   if (!dateStr) return "";
  //   const d = new Date(dateStr);
  //   const istOffset = 5.5 * 60; // minutes
  //   const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  //   const ist = new Date(utc + istOffset * 60000);
  //   const dd = String(ist.getDate()).padStart(2, "0");
  //   const mm = String(ist.getMonth() + 1).padStart(2, "0");
  //   const yyyy = ist.getFullYear();
  //   return `${dd}-${mm}-${yyyy}`;
  // }

  // Month names for headings and axes
  const MONTHS_ABBR = useMemo(
    () => [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    [],
  );

  // removed time series day formatter

  // Shorten category labels for charts to avoid clipping
  const CATEGORY_LABELS = useMemo(
    () => ({
      basic: "Basic",
      bills: "Bills",
      food: "Food",
      "fun/entertainment": "Entertainment",
      others: "Others",
    }),
    [],
  );
  const formatCategoryName = useCallback(
    (name) => CATEGORY_LABELS[name] ?? name,
    [CATEGORY_LABELS],
  );

  // Capitalize user names
  const formatUserName = useCallback((name) => {
    if (!name || typeof name !== "string") return "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, []);

  const monthlyBars = useMemo(() => {
    const monthTotals = Array(12).fill(0);
    const filtered = items.filter((it) => {
      const d = new Date(it.date);
      if (d.getFullYear() !== year) return false;
      if (selectedUser !== "all" && it.user !== selectedUser) return false;
      if (category !== "all" && it.category !== category) return false;
      return true;
    });
    for (const it of filtered) {
      const d = new Date(it.date);
      const m = d.getMonth();
      monthTotals[m] += Number(it.amount || 0);
    }
    return monthTotals.map((total, i) => ({
      period: `${year}-${String(i + 1).padStart(2, "0")}`,
      label: MONTHS_ABBR[i],
      total,
    }));
  }, [items, year, selectedUser, category, MONTHS_ABBR]);

  const totals = useMemo(() => {
    const yearTotal = monthlyBars.reduce((s, m) => s + (m.total || 0), 0);
    return { yearTotal, pieTotal };
  }, [monthlyBars, pieTotal]);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-gray-500">
          Charts to visualize your spending.
        </p>
      </header>

  <section className="card card-body grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor="user" className="block text-sm font-medium">
            User
          </label>
          <select
            id="user"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="mt-1 select"
          >
            <option value="all">All Users</option>
            <option value="aaditya">Aaditya</option>
            <option value="archana">Archana</option>
            <option value="rajesh">Rajesh</option>
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 select"
          >
            <option value="all">All</option>
            <option value="basic">Basic</option>
            <option value="bills">Bills</option>
            <option value="food">Food</option>
            <option value="fun/entertainment">Fun/Entertainment</option>
            <option value="others">Others</option>
          </select>
        </div>
        <div>
          <label htmlFor="year" className="block text-sm font-medium">
            Year
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="mt-1 select"
          >
            {(yearsAvail.length ? yearsAvail : [new Date().getFullYear()]).map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ),
            )}
          </select>
        </div>
  <div className="md:col-span-1 md:justify-self-end">
          <button type="button" onClick={() => ensureLoaded(true)} className="btn">
            Refresh
          </button>
        </div>
      </section>

    {loadError && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
      {loadError}
        </div>
      )}

    {loadingAll
        ? <div>Loading…</div>
        : <div className="space-y-8">
            <div className="h-64 w-full card card-body">
              <div className="flex items-center justify-between">
                <h2 className="mb-2 font-medium">
                  Monthly Bars (Year: {year})
                </h2>
                <div className="text-sm text-gray-600">Total: ₹{formatINR(totals.yearTotal)}</div>
              </div>
              {monthlyBars?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyBars}
                    margin={{ top: 12, right: 16, bottom: 28, left: 72 }}
                  >
                    <XAxis dataKey="label" interval={0} tickMargin={8} />
                    <YAxis
                      width={72}
                      tickMargin={8}
                      tickFormatter={(v) => `₹${formatINR(v)}`}
                    />
                    <Tooltip />
                    <Bar dataKey="total" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-gray-500">No data</div>
              )}
            </div>

            {/* Time series removed as requested */}

            <div className="w-full card card-body">
              <div className="flex items-center justify-between">
                <h2 className="mb-2 font-medium">Breakdown (Pie)</h2>
                <div className="text-sm text-gray-600">Total: ₹{formatINR(totals.pieTotal)}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-72 w-full">
                  <h3 className="mb-2 text-sm font-medium">By Category</h3>
                  {pieCategory?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart
                        margin={{ top: 12, right: 16, bottom: 12, left: 16 }}
                      >
                        <Pie
                          data={pieCategory}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={isMobile ? 90 : 110}
                          label={({ name, percent }) =>
                            `${formatCategoryName(name)} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {pieCategory.map((entry, index) => (
                            <Cell
                              key={`cell-cat-${entry.name}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [
                          `₹${formatINR(value)}`,
                          formatCategoryName(name),
                        ]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-sm text-gray-500">No data</div>
                  )}
                </div>
                <div className="h-72 w-full">
                  <h3 className="mb-2 text-sm font-medium">By User</h3>
                  {pieUser?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart
                        margin={{ top: 12, right: 16, bottom: 12, left: 16 }}
                      >
                        <Pie
                          data={pieUser}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={isMobile ? 90 : 110}
                          label={({ name, percent }) =>
                            `${formatUserName(name)} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {pieUser.map((entry, index) => (
                            <Cell
                              key={`cell-user-${entry.name}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [
                          `₹${formatINR(value)}`,
                          formatUserName(name),
                        ]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-sm text-gray-500">No data</div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="daysPie" className="block text-sm font-medium">
                  Days Back (Pie)
                </label>
                <input
                  id="daysPie"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="mt-1 input"
                />
              </div>
            </div>
          </div>}
    </div>
  );
}
