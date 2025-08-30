"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatINR } from "@/lib/format";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#a4de6c",
];

export default function ReportsPage() {
  // Controls
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1); // 1-12
  const [days, setDays] = useState(90); // used only for pie
  const [selectedUser, setSelectedUser] = useState("all");
  const [category, setCategory] = useState("all");
  const [isMobile, setIsMobile] = useState(false);
  // Data
  const [tsMonth, setTsMonth] = useState([]); // daily series for selected month
  const [tsYear, setTsYear] = useState([]); // monthly series for selected year
  const [breakdown, setBreakdown] = useState({ byCategory: {}, byUser: {} });
  const [yearsAvail, setYearsAvail] = useState([]);
  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Build month range (local time used; server aggregates on UTC date strings)
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

      // Time series for the month (daily)
      const tsMonthQs = new URLSearchParams({ period: "day" });
      tsMonthQs.set("from", monthStart.toISOString());
      tsMonthQs.set("to", monthEnd.toISOString());
      if (selectedUser && selectedUser !== "all")
        tsMonthQs.set("user", selectedUser);
      if (category && category !== "all") tsMonthQs.set("category", category);

      // Monthly bars for the year (monthly)
      const tsYearQs = new URLSearchParams({ period: "month" });
      tsYearQs.set("from", yearStart.toISOString());
      tsYearQs.set("to", yearEnd.toISOString());
      if (selectedUser && selectedUser !== "all")
        tsYearQs.set("user", selectedUser);
      if (category && category !== "all") tsYearQs.set("category", category);

      // Pie breakdown uses Days Back only
      const brQs = new URLSearchParams({});
      if (days) brQs.set("days", String(days));
      if (selectedUser && selectedUser !== "all")
        brQs.set("user", selectedUser);
      if (category && category !== "all") brQs.set("category", category);

      const [tsMonthRes, tsYearRes, brRes] = await Promise.all([
        fetch(`/api/reports/time-series?${tsMonthQs.toString()}`),
        fetch(`/api/reports/time-series?${tsYearQs.toString()}`),
        fetch(`/api/reports/range-breakdown?${brQs.toString()}`),
      ]);
      const tsMonthJson = await tsMonthRes.json();
      const tsYearJson = await tsYearRes.json();
      const brJson = await brRes.json();
      if (!tsMonthJson.ok)
        throw new Error(tsMonthJson.error || "Failed month series");
      if (!tsYearJson.ok)
        throw new Error(tsYearJson.error || "Failed year series");
      if (!brJson.ok) throw new Error(brJson.error || "Failed breakdown");
      setTsMonth(Array.isArray(tsMonthJson.data) ? tsMonthJson.data : []);
      setTsYear(Array.isArray(tsYearJson.data) ? tsYearJson.data : []);
      setBreakdown({
        byCategory: brJson.byCategory || {},
        byUser: brJson.byUser || {},
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [year, month, days, selectedUser, category]);

  useEffect(() => {
    load();
  }, [load]);

  // Detect mobile width for responsive chart sizing
  useEffect(() => {
    const update = () =>
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Load available years when filters change (user/category)
  useEffect(() => {
    const run = async () => {
      const qs = new URLSearchParams({});
      if (selectedUser && selectedUser !== "all") qs.set("user", selectedUser);
      if (category && category !== "all") qs.set("category", category);
      const res = await fetch(`/api/reports/available-years?${qs.toString()}`);
      const json = await res.json();
      if (json.ok) {
        const years = Array.isArray(json.data) ? json.data : [];
        setYearsAvail(years);
        // If current selected year not in list, default to latest
        if (years.length && !years.includes(year)) {
          setYear(years[0]);
        }
      }
    };
    run();
  }, [selectedUser, category, year]);

  const pieCategory = useMemo(() => {
    return Object.entries(breakdown.byCategory || {}).map(([name, value]) => ({
      name,
      value,
    }));
  }, [breakdown]);

  const pieUser = useMemo(() => {
    return Object.entries(breakdown.byUser || {}).map(([name, value]) => ({
      name,
      value,
    }));
  }, [breakdown]);

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

  // Day-of-month for daily time series axis (1..31)
  const formatDay = useCallback((dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const istOffset = 5.5 * 60; // minutes
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const ist = new Date(utc + istOffset * 60000);
    return String(ist.getDate());
  }, []);

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
    const map = new Map(tsYear.map((x) => [x.period, x.total]));
    return Array.from({ length: 12 }, (_, i) => {
      const key = `${year}-${String(i + 1).padStart(2, "0")}`;
      return { period: key, label: MONTHS_ABBR[i], total: map.get(key) || 0 };
    });
  }, [tsYear, year, MONTHS_ABBR]);

  const totals = useMemo(() => {
    const yearTotal = monthlyBars.reduce((s, m) => s + (m.total || 0), 0);
    const monthTotal = tsMonth.reduce((s, d) => s + (d.total || 0), 0);
    const pieTotal = Object.values(breakdown.byCategory || {}).reduce(
      (s, v) => s + (v || 0),
      0,
    );
    return { yearTotal, monthTotal, pieTotal };
  }, [monthlyBars, tsMonth, breakdown]);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-gray-500">
          Charts to visualize your spending.
        </p>
      </header>

      <section className="card card-body grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
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
        <div>
          <label htmlFor="month" className="block text-sm font-medium">
            Month
          </label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="mt-1 select"
          >
            {[
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
            ].map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-5">
          <button type="button" onClick={load} className="btn">
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {loading
        ? <div>Loading…</div>
        : <div className="space-y-8">
            <div className="h-64 w-full card card-body">
              <div className="flex items-center justify-between">
                <h2 className="mb-2 font-medium">
                  Monthly Bars (Year: {year})
                </h2>
                <div className="text-sm text-gray-600">Total: ₹{formatINR(totals.yearTotal)}</div>
              </div>
              {monthlyBars && monthlyBars.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyBars}>
                    <XAxis dataKey="label" />
                    <YAxis tickFormatter={(v) => `₹${formatINR(v)}`} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-gray-500">No data</div>
              )}
            </div>

            <div className="h-64 w-full card card-body">
              <div className="flex items-center justify-between">
                <h2 className="mb-2 font-medium">
                  Time Series (for {MONTHS_ABBR[month - 1]} {year})
                </h2>
                <div className="text-sm text-gray-600">Total: ₹{formatINR(totals.monthTotal)}</div>
              </div>
              {tsMonth && tsMonth.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tsMonth}>
                    <XAxis dataKey="period" tickFormatter={(v) => formatDay(v)} />
                    <YAxis tickFormatter={(v) => `₹${formatINR(v)}`} />
                    <Tooltip formatter={(value) => `₹${formatINR(value)}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-gray-500">No data</div>
              )}
            </div>

            <div className="w-full card card-body">
              <div className="flex items-center justify-between">
                <h2 className="mb-2 font-medium">Breakdown (Pie)</h2>
                <div className="text-sm text-gray-600">Total: ₹{formatINR(totals.pieTotal)}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-72 w-full">
                  <h3 className="mb-2 text-sm font-medium">By Category</h3>
                  {pieCategory && pieCategory.length ? (
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
                  {pieUser && pieUser.length ? (
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
