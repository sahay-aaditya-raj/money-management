export const AUTH_STORAGE_KEY = "auth_token_v1";
export const EXPENSES_CACHE_KEY = "expenses_cache_v1";

export function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(AUTH_STORAGE_KEY, token);
    else localStorage.removeItem(AUTH_STORAGE_KEY);
    try {
      window.dispatchEvent(new Event("app-auth-changed"));
    } catch {}
  } catch {
    // ignore
  }
}

export async function authFetch(input, init = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(input, { ...init, headers });
  if (res && res.status === 401) {
    // Safety: clear caches on unauthorized so UI can reset gracefully
    clearLocalCaches?.();
  }
  return res;
}

export function clearLocalCaches() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(EXPENSES_CACHE_KEY);
    try {
      window.dispatchEvent(new Event("app-auth-changed"));
    } catch {}
  } catch {
    // ignore
  }
}

export function toast(message) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("app-toast", { detail: String(message || "") }),
    );
  } catch {}
}
