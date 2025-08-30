import mongoose from "mongoose";
import { connectToDatabase } from "../lib/db.js";

const ExpenseSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: ["basic", "bills", "fun/entertainment", "food", "others", "user"],
      required: true,
    },
    user: {
      type: String,
      enum: ["rajesh", "archana", "aaditya"],
      default: null,
    },
    note: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ user: 1 });

const Expense =
  mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

export default Expense;

export async function listExpenses({
  limit,
  days,
  user,
  category,
  from,
  to,
  sortBy = "date",
  sortDir = "desc",
} = {}) {
  await connectToDatabase();
  const match = {};
  if (days) {
    const f = new Date();
    f.setDate(f.getDate() - Number(days));
    match.date = { $gte: f };
  }
  if (from || to) {
    match.date = match.date || {};
    if (from) match.date.$gte = new Date(from);
    if (to) match.date.$lte = new Date(to);
  }
  if (user && user !== "all") match.user = user;
  if (category && category !== "all") match.category = category;

  const allowed = ["date", "amount", "category", "user", "all"];
  const isAll = sortBy === "all";
  const dir = sortDir === "asc" ? 1 : -1;
  let sort;
  if (isAll) {
    sort = { user: dir, category: dir, date: dir };
  } else {
    const field = allowed.includes(sortBy) ? sortBy : "date";
    sort = { [field]: dir };
  }
  let q = Expense.find(match).sort(sort);
  if (Number.isFinite(limit) && limit > 0) q = q.limit(Number(limit));
  const docs = await q.lean();
  return docs.map((d) => ({ ...d, _id: d._id?.toString?.() }));
}

export async function createExpense(input) {
  await connectToDatabase();
  const payload = {
    amount: Number(input.amount),
    category: input.category,
    user: input.user ?? null,
    note: input.note ?? "",
    date: input.date ? new Date(input.date) : new Date(),
  };
  const doc = await Expense.create(payload);
  return { ...payload, _id: doc._id?.toString?.() };
}

export async function summaryTotals() {
  await connectToDatabase();
  const pipeline = [
    {
      $group: {
        _id: { category: "$category", user: "$user" },
        total: { $sum: "$amount" },
      },
    },
  ];
  const grouped = await Expense.aggregate(pipeline);
  const byCategory = {};
  const byUser = {};
  for (const g of grouped) {
    const c = g._id.category;
    const u = g._id.user;
    if (!byCategory[c]) byCategory[c] = 0;
    byCategory[c] += g.total;
    if (c === "user" && u) {
      if (!byUser[u]) byUser[u] = 0;
      byUser[u] += g.total;
    }
  }
  return { byCategory, byUser };
}

// time utility functions not currently used were removed to satisfy linter

export async function timeSeriesSummary({
  period = "month",
  days,
  from,
  to,
  user,
  category,
} = {}) {
  await connectToDatabase();
  const now = to ? new Date(to) : new Date();
  const fromDate = from
    ? new Date(from)
    : (() => {
        if (days) {
          const f = new Date();
          f.setDate(f.getDate() - Number(days));
          return f;
        }
        const f = new Date();
        f.setDate(f.getDate() - 365);
        return f;
      })();
  let groupExpr;
  if (period === "day")
    groupExpr = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
  else if (period === "week")
    groupExpr = { $dateToString: { format: "%G-%V", date: "$date" } };
  else groupExpr = { $dateToString: { format: "%Y-%m", date: "$date" } };

  const series = await Expense.aggregate([
    {
      $match: {
        date: { $gte: fromDate, $lte: now },
        ...(user && user !== "all" ? { user } : {}),
        ...(category && category !== "all" ? { category } : {}),
      },
    },
    { $group: { _id: groupExpr, total: { $sum: "$amount" } } },
    { $sort: { _id: 1 } },
  ]);
  return series.map((s) => ({ period: s._id, total: s.total }));
}

export async function rangeBreakdown({ from, to, days, user, category } = {}) {
  await connectToDatabase();
  const match = {};
  if (from || to || days) {
    match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) match.date.$lte = new Date(to);
    if (!from && !to && days) {
      const f = new Date();
      f.setDate(f.getDate() - Number(days));
      match.date.$gte = f;
      match.date.$lte = new Date();
    }
  } else {
    const f = new Date();
    f.setDate(f.getDate() - 365);
    match.date = { $gte: f, $lte: new Date() };
  }
  if (user && user !== "all") match.user = user;
  if (category && category !== "all") match.category = category;
  const byCategory = await Expense.aggregate([
    { $match: match },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
  ]);
  const byUser = await Expense.aggregate([
    { $match: match },
    { $group: { _id: "$user", total: { $sum: "$amount" } } },
  ]);
  return {
    byCategory: Object.fromEntries(
      byCategory.map((x) => [x._id || "unknown", x.total]),
    ),
    byUser: Object.fromEntries(
      byUser.map((x) => [x._id || "unknown", x.total]),
    ),
  };
}

export async function availableYears({ user, category } = {}) {
  await connectToDatabase();
  const match = {};
  if (user && user !== "all") match.user = user;
  if (category && category !== "all") match.category = category;
  const years = await Expense.aggregate([
    ...(Object.keys(match).length ? [{ $match: match }] : []),
    { $group: { _id: { $year: "$date" } } },
    { $sort: { _id: -1 } },
  ]);
  return years.map((x) => x._id);
}

export async function deleteExpense(id) {
  await connectToDatabase();
  if (!id) return { deleted: false };
  const res = await Expense.deleteOne({ _id: id });
  return { deleted: res.deletedCount > 0 };
}
