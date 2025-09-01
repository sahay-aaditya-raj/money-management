#!/usr/bin/env node
import bcrypt from "bcrypt";

/**
 * Usage examples:
 *  node scripts/gen-hash.mjs user user1 user2 user3
 *  node scripts/gen-hash.mjs pass 12345678
 *  node scripts/gen-hash.mjs both 12345678 user1 user2 user3
 */

const [, , mode, ...args] = process.argv;
const saltRounds = 10;

async function hash(value) {
  return await bcrypt.hash(value, saltRounds);
}

function print(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

async function main() {
  if (!mode || !["user", "pass", "both"].includes(mode)) {
    console.error(
      "Usage: node scripts/gen-hash.mjs <user|pass|both> <values...>",
    );
    process.exit(1);
  }
  if (mode === "user") {
    const users = args;
    const hashes = [];
    for (const u of users) hashes.push(await hash(String(u)));
    print({ users: hashes });
  } else if (mode === "pass") {
    const pass = args[0] ?? "";
    print({ pass: await hash(String(pass)) });
  } else if (mode === "both") {
    const pass = args[0] ?? "";
    const users = args.slice(1);
    const usersHashes = [];
    for (const u of users) usersHashes.push(await hash(String(u)));
    print({ pass: await hash(String(pass)), users: usersHashes });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
