import bcrypt from "bcrypt";
import { HASHED_PASSWORD, HASHED_USERNAMES } from "./data";

// Constant app token used to authorize API requests
export const APP_TOKEN = "Uve9DJ<Yxp&/*IotKIa@|TlP425vg98pi+(>#4]k";

// Use centralized hashes from lib/data.js

export function credentialsValid(username, password) {
  if (!username || !password) return false;
  const userOk = HASHED_USERNAMES.some((hash) =>
    bcrypt.compareSync(String(username), hash),
  );
  const passOk = bcrypt.compareSync(String(password), HASHED_PASSWORD);
  return userOk && passOk;
}

export function extractToken(request) {
  try {
    const header = request.headers.get("authorization") || "";
    const m = header.match(/^Bearer\s+(.+)$/i);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export function isAuthorized(request) {
  const token = extractToken(request);
  return token === APP_TOKEN;
}

export const AUTH_STORAGE_KEY = "auth_token_v1";
