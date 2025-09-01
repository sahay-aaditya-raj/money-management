"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { clearLocalCaches, getToken } from "@/lib/client-auth";

export default function AuthStatus() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    const refresh = () => setLoggedIn(Boolean(getToken()));
    refresh();
    if (typeof window !== "undefined") {
      window.addEventListener("app-auth-changed", refresh);
      return () => window.removeEventListener("app-auth-changed", refresh);
    }
  }, []);
  if (!loggedIn)
    return (
      <a href="/" className="text-sm text-gray-600 hover:text-black">
        Login
      </a>
    );
  return (
    <form
      action="#"
      onSubmit={(e) => {
        e.preventDefault();
        try {
          if (typeof window !== "undefined") {
            clearLocalCaches();
            window.location.href = "/";
          }
        } catch {}
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        Logout
      </Button>
    </form>
  );
}
