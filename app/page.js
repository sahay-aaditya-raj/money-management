"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatINR } from "@/lib/format";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useExpenses } from "./expenses-provider";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

  // Compact number formatter for Y-axis (1K, 2K, etc.)
  const formatCompact = useCallback((n) => {
    if (!Number.isFinite(n)) return "";
    try {
      return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
    } catch (_) {
      // Fallback
      if (Math.abs(n) >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
      if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
      return String(n);
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-gray-500">
          Charts to visualize your spending.
        </p>
      </header>

      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end ">
          <div>
            <Label className="block text-sm font-medium">User</Label>
            <UISelect value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Users</SelectLabel>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="aaditya">Aaditya</SelectItem>
                  <SelectItem value="archana">Archana</SelectItem>
                  <SelectItem value="rajesh">Rajesh</SelectItem>
                </SelectGroup>
              </SelectContent>
            </UISelect>
          </div>
          <div>
            <Label className="block text-sm font-medium">Category</Label>
            <UISelect value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="bills">Bills</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="fun/entertainment">Fun/Entertainment</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectGroup>
              </SelectContent>
            </UISelect>
          </div>
          <div>
            <Label className="block text-sm font-medium">Year</Label>
            <UISelect value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Years</SelectLabel>
                  {(yearsAvail.length ? yearsAvail : [new Date().getFullYear()]).map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </UISelect>
          </div>
          <div className="md:col-span-1 md:justify-self-end">
            <Button type="button" onClick={() => ensureLoaded(true)}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

    {loadError && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
      {loadError}
        </div>
      )}

    {loadingAll
        ? <div>Loading…</div>
        : <div className="space-y-8">
            <Card className="h-70 w-full">
              <CardContent className="h-full pb-6">
              <div className="flex items-center justify-between">
                <h2 className="mb-2 font-medium">
                  Monthly Bars (Year: {year})
                </h2>
                <div className="text-sm text-gray-600">Total: ₹{formatINR(totals.yearTotal)}</div>
              </div>
              {monthlyBars?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  {isMobile ? (
                    <BarChart
                      data={monthlyBars}
                      layout="vertical"
                      margin={{ top: 8, right: 40, bottom: 8, left: 8 }}
                      barCategoryGap={6}
                    >
                      <XAxis
                        type="number"
                        domain={[0, 'dataMax']}
                        allowDecimals={false}
                        tick={{ fontSize: 10 }}
                        tickMargin={4}
                        tickFormatter={(v) => String(formatCompact(v)).toLowerCase()}
                      />
                      <YAxis type="category" dataKey="label" width={28} tickMargin={2} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => `₹${formatINR(v)}`} />
                      <Bar dataKey="total" fill="#82ca9d" barSize={16} />
                    </BarChart>
                  ) : (
                    <BarChart
                      data={monthlyBars}
                      margin={{ top: 12, right: 12, bottom: 28, left: 16 }}
                    >
                      <XAxis dataKey="label" interval={0} tickMargin={8} />
                      <YAxis width={48} tickMargin={8} tickFormatter={(v) => formatCompact(v)} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#82ca9d" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-gray-500">No data</div>
              )}
              </CardContent>
            </Card>

            {/* Time series removed as requested */}

            <Card className="w-full">
              <CardContent>
              <div className="flex items-center justify-between">
                <h2 className="mb-2 font-medium">Breakdown (Pie)</h2>
                <div className="text-sm text-gray-600">Total: ₹{formatINR(totals.pieTotal)}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-72 w-full">
                  <h3 className="mb-2 text-sm font-medium">By Category</h3>
                  {pieCategory?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 12, right: 16, bottom: isMobile ? 0 : 12, left: 16 }}>
                        <Pie
                          data={pieCategory}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={isMobile ? 90 : 110}
                          label={isMobile ? undefined : (({ name, percent }) => `${formatCategoryName(name)} ${(percent * 100).toFixed(0)}%`)}
                        >
                          {pieCategory.map((entry, index) => (
                            <Cell
                              key={`cell-cat-${entry.name}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        {isMobile && (
                          <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value) => formatCategoryName(value)}
                          />
                        )}
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
                      <PieChart margin={{ top: 12, right: 16, bottom: isMobile ? 0 : 12, left: 16 }}>
                        <Pie
                          data={pieUser}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={isMobile ? 90 : 110}
                          label={isMobile ? undefined : (({ name, percent }) => `${formatUserName(name)} ${(percent * 100).toFixed(0)}%`)}
                        >
                          {pieUser.map((entry, index) => (
                            <Cell
                              key={`cell-user-${entry.name}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        {isMobile && (
                          <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value) => formatUserName(value)}
                          />
                        )}
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
              <div className="mt-8">
                <Label htmlFor="daysPie" className="block text-sm font-medium">
                  Days Back (Pie)
                </Label>
                <Input
                  id="daysPie"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="mt-1 max-w-40"
                />
              </div>
              </CardContent>
            </Card>
          </div>}
    </div>
  );
}
