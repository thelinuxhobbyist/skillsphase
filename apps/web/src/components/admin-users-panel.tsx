"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ApiRequestError,
  adminUserAction,
  type AdminUser,
} from "@/lib/api";

export function AdminUsersPanel({ users }: { users: AdminUser[] }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function run(userId: string, action: "suspend" | "reactivate" | "delete") {
    if (
      action === "delete" &&
      !window.confirm("Soft-delete this user and revoke their Clerk session?")
    ) {
      return;
    }
    setPendingId(userId);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing session token");
      await adminUserAction(token, userId, action);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Action failed.",
      );
      setPendingId(null);
    }
  }

  if (users.length === 0) {
    return <p className="text-[color:var(--foreground)]/70">No users found.</p>;
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {users.map((user) => {
        const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
        return (
          <article
            key={user.id}
            className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-brand">
                  {name || user.email}
                </h2>
                <p className="text-sm text-[color:var(--foreground)]/70">
                  {user.email} · {user.role.replace("_", " ")}
                  {user.suspendedAt ? " · suspended" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.suspendedAt ? (
                  <button
                    type="button"
                    disabled={pendingId === user.id}
                    className="rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-brand disabled:opacity-60"
                    onClick={() => void run(user.id, "reactivate")}
                  >
                    Reactivate
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pendingId === user.id}
                    className="rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-brand disabled:opacity-60"
                    onClick={() => void run(user.id, "suspend")}
                  >
                    Suspend
                  </button>
                )}
                <button
                  type="button"
                  disabled={pendingId === user.id}
                  className="rounded-md bg-red-800 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                  onClick={() => void run(user.id, "delete")}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
