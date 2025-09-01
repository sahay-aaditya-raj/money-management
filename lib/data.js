/**
 * Centralized data configuration for the Money Software application
 *
 * This file contains all the static data used throughout the application,
 * including categories and users. Modify this file to customize the
 * available options in your application.
 */

// ============================================================================
// EXPENSE CATEGORIES
// ============================================================================

/**
 * Available expense categories
 * Each category has a value (used in database) and a label (displayed in UI)
 *
 * To add a new category:
 * 1. Add it to this array with a unique value and descriptive label
 * 2. Update the database schema in models/expense.js if needed
 * 3. Restart your application
 */
export const CATEGORIES = [
  { value: "basic", label: "Basic" },
  { value: "bills", label: "Bills" },
  { value: "fun/entertainment", label: "Fun/Entertainment" },
  { value: "food", label: "Food" },
  { value: "others", label: "Others" },
];

/**
 * Categories for display in dropdowns (includes "all" option for filtering)
 */
export const CATEGORIES_WITH_ALL = [
  { value: "all", label: "All Categories" },
  ...CATEGORIES,
];

/**
 * Category values only (for database schema and validation)
 */
export const CATEGORY_VALUES = CATEGORIES.map((cat) => cat.value);

// ============================================================================
// USERS
// ============================================================================

/**
 * Available users in the system
 * Each user has a value (used in database) and a label (displayed in UI)
 *
 * To add a new user:
 * 1. Add them to this array with a unique value and display name
 * 2. Update the database schema in models/expense.js if needed
 * 3. Restart your application
 */
export const USERS = [
  { value: "user1", label: "User 1" },
  { value: "user2", label: "User 2" },
  { value: "user3", label: "User 3" },
];

/**
 * Users for display in dropdowns (includes "all" option for filtering)
 */
export const USERS_WITH_ALL = [{ value: "all", label: "All Users" }, ...USERS];

/**
 * User values only (for database schema and validation)
 */
export const USER_VALUES = USERS.map((user) => user.value);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get category label by value
 * @param {string} value - Category value
 * @returns {string} Category label or the value if not found
 */
export function getCategoryLabel(value) {
  const category = CATEGORIES.find((cat) => cat.value === value);
  return category ? category.label : value;
}

/**
 * Get user label by value
 * @param {string} value - User value
 * @returns {string} User label or the value if not found
 */
export function getUserLabel(value) {
  const user = USERS.find((u) => u.value === value);
  return user ? user.label : value;
}

/**
 * Check if a category value is valid
 * @param {string} value - Category value to check
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidCategory(value) {
  return CATEGORY_VALUES.includes(value);
}

/**
 * Check if a user value is valid
 * @param {string} value - User value to check
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidUser(value) {
  return USER_VALUES.includes(value);
}

// ============================================================================
// AUTH (HASHED CREDENTIALS)
// Centralized bcrypt hashes for allowed usernames and the shared password.
// Update these with the generator script in scripts/gen-hash.mjs when needed.
// ============================================================================

// users: ["user1", "user2", "user3"]
export const HASHED_USERNAMES = [
  "$2b$10$EWQ2aRKRodvmxkXr.l64cOTT5AnffFnbujphCItS8jUF009sUcd.O",
  "$2b$10$b.IlDYYbQUaIZLYWatTonuOv1DLDSdHeUF4ydtWrfigDP5fahs2Fu",
  "$2b$10$uWc3axIMFUjVE76NHqT1/.8Ov/3aBFzcvIPFyPpx8/D.N/wy/yTBu",
];
// password: "12345678"
export const HASHED_PASSWORD =
  "$2b$10$lagflZdptZf03xbJQb4STuLgoDDFOFPGi46DQQFir7GsDUuLbqK86";
