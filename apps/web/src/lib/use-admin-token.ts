"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Reads the administrator session token from the httpOnly cookie
 * via a same-origin API route (Clerk is not used for admin).
 */
export function useAdminToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      if (!res.ok) {
        setToken(null);
        return null;
      }
      const data = (await res.json()) as { token: string | null };
      setToken(data.token);
      return data.token;
    } catch {
      setToken(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getToken = useCallback(async () => {
    if (token) return token;
    return refresh();
  }, [token, refresh]);

  return { token, loading, getToken, refresh };
}
