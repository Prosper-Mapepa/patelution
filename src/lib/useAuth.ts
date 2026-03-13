"use client";

import { useCallback, useEffect, useState } from "react";

const TOKEN_KEY = "patelution_token";
const USER_ID_KEY = "patelution_user_id";

/** Re-check auth when pathname (or other deps) change so nav updates after login redirect. */
export function useAuth(refreshWhen?: string) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const token = window.localStorage.getItem(TOKEN_KEY);
    setIsSignedIn(!!token);
  }, [mounted, refreshWhen]);

  const signOut = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_ID_KEY);
    setIsSignedIn(false);
    window.location.href = "/";
  }, []);

  return { isSignedIn: mounted && isSignedIn, signOut, ready: mounted };
}
