"use client";

import { useEffect, useState } from "react";

export default function GlobalToast() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e) => {
      const m = (e?.detail ?? "").toString();
      setMsg(m);
      if (m) setTimeout(() => setMsg(""), 3000);
    };
    window.addEventListener("app-toast", handler);
    return () => window.removeEventListener("app-toast", handler);
  }, []);
  if (!msg) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded bg-black text-white px-3 py-2 text-sm shadow">
      {msg}
    </div>
  );
}
