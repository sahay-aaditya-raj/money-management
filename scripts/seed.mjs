import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { connectToDatabase } from "../lib/db.js";
import Expense from "../models/expense.js";

// Load env from .env.local if present
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const USERS = ["aaditya", "archana", "rajesh"];
const CATEGORIES = ["basic", "bills", "food", "fun/entertainment", "others"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function amountFor(category) {
  switch (category) {
    case "bills":
      return randInt(500, 5000);
    case "basic":
      return randInt(100, 1500);
    case "food":
      return randInt(100, 1200);
    case "fun/entertainment":
      return randInt(100, 2000);
    default:
      return randInt(50, 1500);
  }
}

function noteFor(category) {
  const map = {
    bills: ["Electricity", "Internet", "Water", "Mobile", "Rent"],
    basic: ["Groceries", "Transport", "Toiletries", "Medicine"],
    food: ["Lunch", "Dinner", "Snacks", "Cafe"],
    "fun/entertainment": ["Movie", "Subscription", "Outing", "Games"],
    others: ["Misc", "Gift", "Repair", "Stationery"],
  };
  return pick(map[category] || [category]);
}

async function main() {
  await connectToDatabase();

  const daysBack = 90; // ~3 months
  const docs = [];
  const now = new Date();

  for (let d = 0; d < daysBack; d++) {
    const date = new Date(now);
    date.setDate(now.getDate() - d);
    for (const user of USERS) {
      // 0-3 expenses per day per user
      const count = randInt(0, 3);
      for (let i = 0; i < count; i++) {
        const category = pick(CATEGORIES);
        const amount = amountFor(category);
        const note = noteFor(category);
        // randomize time during the day
        const dt = new Date(date);
        dt.setHours(randInt(8, 22), randInt(0, 59), randInt(0, 59), 0);
        docs.push({ user, category, amount, note, date: dt });
      }
    }
  }

  if (docs.length === 0) {
    console.log("No docs to insert");
    return;
  }

  const res = await Expense.insertMany(docs);
  console.log(`Inserted ${res.length} expenses across ~${daysBack} days.`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
