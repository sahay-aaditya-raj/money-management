"use client";
import { useEffect, useMemo, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("system"); // 'light' | 'dark' | 'system'
  const [prefersDark, setPrefersDark] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("theme");
    if (saved) setTheme(saved);
    const mql = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setPrefersDark(!!e.matches);
    setPrefersDark(!!mql?.matches);
    mql?.addEventListener?.("change", onChange);
    return () => mql?.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const effective = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
    if (effective === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    if (typeof window !== "undefined") localStorage.setItem("theme", theme);
  }, [theme, prefersDark]);

  const effectiveTheme = useMemo(
    () => (theme === "system" ? (prefersDark ? "dark" : "light") : theme),
    [theme, prefersDark],
  );

  return (
    <div className="no-print">
      <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-black/40 backdrop-blur p-1">
        <button
          type="button"
          aria-label="Light"
          className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${effectiveTheme === "light" ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          onClick={() => setTheme("light")}
          title="Light"
        >
          {/* Sun icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1Zm0 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm6.5-3.5a1 1 0 0 1 1-1H21a1 1 0 1 1 0 2h-1.5a1 1 0 0 1-1-1ZM3 11.5a1 1 0 1 0 0 2h1.5a1 1 0 1 0 0-2H3Zm1.964-6.536a1 1 0 0 1 1.414 0L7.44 5.026a1 1 0 1 1-1.414 1.414L4.964 6.378a1 1 0 0 1 0-1.414Zm11.132 0a1 1 0 0 1 1.414 1.414l-1.061 1.06a1 1 0 0 1-1.414-1.414l1.06-1.06Zm0 14.648a1 1 0 0 1-1.414 0l-1.06-1.06a1 1 0 0 1 1.414-1.415l1.06 1.061a1 1 0 0 1 0 1.414ZM7.44 17.56a1 1 0 1 1-1.414 1.414l-1.06-1.06a1 1 0 1 1 1.414-1.414l1.06 1.06Z"/>
          </svg>
        </button>
        <button
          type="button"
          aria-label="Dark"
          className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${effectiveTheme === "dark" ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          onClick={() => setTheme("dark")}
          title="Dark"
        >
          {/* Moon icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z"/>
          </svg>
        </button>
        <button
          type="button"
          aria-label="System"
          className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${theme === "system" ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          onClick={() => setTheme("system")}
          title="System"
        >
          {/* Auto icon (A) */}
          <span className="text-[11px] font-semibold">A</span>
        </button>
      </div>
    </div>
  );
}
