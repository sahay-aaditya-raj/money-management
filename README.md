# Money Software – Customize data.js and Auth Setup

This guide explains how to customize the app’s static data in `lib/data.js` (categories, users) and how to manage authentication hashes and tokens. It also includes tips for keeping secrets in environment variables for safety.

## What lives in `lib/data.js`

`lib/data.js` centralizes static configuration used by the app:
- CATEGORIES: list of expense categories (value + label)
- USERS: list of allowed users (value + label)
- CATEGORY_VALUES / USER_VALUES: derived lists used for validation
- HASHED_USERNAMES: bcrypt hashes of allowed usernames
- HASHED_PASSWORD: bcrypt hash of the shared password

The API login validates credentials with bcrypt compares, and the app uses a constant server-side token to authorize requests.

Notes about bcrypt:
- Each hash generation produces a different string (it’s salted). That’s normal.
- Login doesn’t require the strings to match; it uses `bcrypt.compare` to verify your input against the stored hashes.

## Customize categories

Edit `lib/data.js` and update the `CATEGORIES` array:
- value: the key stored in DB
- label: the display name in the UI

Adding a new category is enough in `CATEGORIES`; `CATEGORY_VALUES` is derived automatically.

Example:
```js
export const CATEGORIES = [
  { value: "basic", label: "Basic" },
  { value: "bills", label: "Bills" },
  { value: "food", label: "Food" },
  { value: "fun/entertainment", label: "Fun/Entertainment" },
  { value: "others", label: "Others" },
  // Add your own
  { value: "travel", label: "Travel" },
];
```

After editing, restart the dev server if it’s running.

## Customize users

Edit the display list in `USERS` for UI and filtering, and update the allowed login usernames via `HASHED_USERNAMES` (bcrypt hashes).

- Change display names in `USERS` for the UI.
- To permit new usernames for login, generate their bcrypt hashes and add them to `HASHED_USERNAMES`.

Example UI list change:
```js
export const USERS = [
  { value: "user1", label: "User 1" },
  { value: "user2", label: "User 2" },
  { value: "user3", label: "User 3" },
  // Add your own
  { value: "alex", label: "Alex" },
];
```

The login check does NOT read the `USERS` array; it checks `HASHED_USERNAMES`. Be sure to add the hash for any user you want to be able to login.

## Generate bcrypt hashes (usernames and password)

This repo includes a small generator script to produce bcrypt hashes.

Available npm scripts:
- Generate a username hash
  ```powershell
  npm run hash:user -- <username>
  ```
- Generate a password hash
  ```powershell
  npm run hash:pass -- <password>
  ```
- Generate both at once
  ```powershell
  npm run hash:both -- <username> <password>
  ```

Where it comes from: `scripts/gen-hash.mjs`. The output prints JSON with one or more hashes. Copy the string(s) into `lib/data.js`:

- Add the username hash to `HASHED_USERNAMES` (array of strings)
- Replace `HASHED_PASSWORD` with the new password hash (string)

Example snippet in `lib/data.js`:
```js
export const HASHED_USERNAMES = [
  // existing hashes...
  "$2b$10$...yourNewUsernameHash..."
];

export const HASHED_PASSWORD = "$2b$10$...yourNewPasswordHash...";
```

Remember: bcrypt hashes are unique every time you generate them. That’s expected and still valid for login.

## Where the token lives (server-side)

The app uses a constant token to authorize API requests. It’s defined on the server in `lib/auth.js`:
- `APP_TOKEN`: compared against the `Authorization: Bearer <token>` header
- The login endpoint returns this token after successful credential validation, and the client stores it in `localStorage`.

For better security, consider moving `APP_TOKEN` (and even the hashes) to environment variables (see below).

## Security tip: use environment variables for secrets

For production, avoid hardcoding secrets in the repo. Put them in a `.env` file that you do NOT commit.

Recommended variables:
- `APP_TOKEN` – the constant token used by the server to authorize requests
- `HASHED_PASSWORD` – bcrypt hash of your chosen password
- `HASHED_USERNAMES_JSON` – a JSON array string of bcrypt hashes for allowed usernames

Example `.env.local` (not committed):
```bash
APP_TOKEN=replace-with-a-strong-random-token
HASHED_PASSWORD=$2b$10$replace-with-your-password-hash
HASHED_USERNAMES_JSON=["$2b$10$hashForUser1","$2b$10$hashForUser2"]
```

Implementation approach:
- In server files (`lib/auth.js` and `lib/data.js`), read from `process.env` first, and fall back to the hardcoded defaults.
- Keep tokens server-only. Do NOT prefix secret env vars with `NEXT_PUBLIC_`.

Example pattern to read env (conceptual):
```js
// lib/data.js
export const HASHED_USERNAMES = (() => {
  try {
    if (process.env.HASHED_USERNAMES_JSON) {
      return JSON.parse(process.env.HASHED_USERNAMES_JSON);
    }
  } catch {}
  return [/* fallback hardcoded hashes */];
})();

export const HASHED_PASSWORD = process.env.HASHED_PASSWORD || "<fallback>";

// lib/auth.js
export const APP_TOKEN = process.env.APP_TOKEN || "<fallback>";
```

If you want, we can wire this up for you—just ask and we’ll switch the code to read from env with safe fallbacks.

## Quick checklist when changing auth data

- Add or update user display entries in `USERS` (UI only)
- Generate bcrypt hash(es) for any login usernames to allow
- Paste new username hash(es) into `HASHED_USERNAMES`
- Generate a bcrypt hash for the chosen password and update `HASHED_PASSWORD`
- Optionally move `APP_TOKEN`, `HASHED_PASSWORD`, and `HASHED_USERNAMES_JSON` to `.env.local`
- Restart the server and test login

## Troubleshooting

- “My newly added user can’t login”
  - Ensure you generated a bcrypt hash for the username and added it to `HASHED_USERNAMES`.
  - Remember: `USERS` controls UI display; `HASHED_USERNAMES` controls login.
- “My hash doesn’t match what I saw before”
  - That’s normal—bcrypt hashes are unique due to salting. Use it anyway; `compare` will succeed.
- “Still unauthorized after login”
  - Make sure the client is storing the token, and API requests send `Authorization: Bearer <token>`.
  - If you rotated `APP_TOKEN` server-side, you must login again to pick up the new token.
