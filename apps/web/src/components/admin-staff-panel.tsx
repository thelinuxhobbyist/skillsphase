"use client";

import { useAdminToken } from "@/lib/use-admin-token";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ADMIN_PERMISSIONS,
  type AdminPermission,
} from "@horizon/shared";
import {
  ApiRequestError,
  adminUserAction,
  createAdminStaff,
  resetAdminStaffPassword,
  updateAdminStaffMember,
  type AdminUser,
} from "@/lib/api";

function staffLabel(user: AdminUser) {
  if (user.isRootAdmin || user.adminRole === "root") return "Root Admin";
  if (user.adminRole === "editor") return "Editor";
  if (user.adminRole === "moderator") return "Moderator";
  return "Admin";
}

function formatLogin(value: string | null) {
  if (!value) return "Never";
  try {
    return new Date(value).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

export function AdminStaffPanel({
  staff,
  currentUserId,
  canManage,
}: {
  staff: AdminUser[];
  currentUserId: string;
  canManage: boolean;
}) {
  const { getToken } = useAdminToken();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [adminRole, setAdminRole] = useState<"admin" | "editor" | "moderator">(
    "admin",
  );
  const [isRootAdmin, setIsRootAdmin] = useState(false);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);

  async function withToken<T>(fn: (token: string) => Promise<T>) {
    const token = await getToken();
    if (!token) throw new Error("Missing session token");
    return fn(token);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPendingId("create");
    try {
      await withToken((token) =>
        createAdminStaff(token, {
          email,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          adminRole: isRootAdmin ? undefined : adminRole,
          isRootAdmin,
          permissions: permissions.length ? permissions : null,
        }),
      );
      setShowCreate(false);
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setIsRootAdmin(false);
      setPermissions([]);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Failed to create administrator.",
      );
    } finally {
      setPendingId(null);
    }
  }

  async function runAction(
    userId: string,
    action: "suspend" | "reactivate" | "delete",
  ) {
    if (
      action === "delete" &&
      !window.confirm("Delete this administrator and revoke their Clerk access?")
    ) {
      return;
    }
    setPendingId(userId);
    setError(null);
    try {
      await withToken((token) => adminUserAction(token, userId, action));
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

  async function changeRole(userId: string, nextRole: string) {
    setPendingId(userId);
    setError(null);
    try {
      await withToken((token) =>
        updateAdminStaffMember(token, userId, {
          adminRole: nextRole,
          isRootAdmin: nextRole === "root",
        }),
      );
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Role update failed.",
      );
      setPendingId(null);
    }
  }

  async function resetPassword(userId: string) {
    const next = window.prompt("Enter a new temporary password (min 8 characters):");
    if (!next) return;
    setPendingId(userId);
    setError(null);
    try {
      await withToken((token) => resetAdminStaffPassword(token, userId, next));
      window.alert("Password updated.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Password reset failed.",
      );
    } finally {
      setPendingId(null);
    }
  }

  async function changeEmail(userId: string, current: string) {
    const next = window.prompt("New email address:", current);
    if (!next || next === current) return;
    setPendingId(userId);
    setError(null);
    try {
      await withToken((token) =>
        updateAdminStaffMember(token, userId, { email: next }),
      );
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Email update failed.",
      );
      setPendingId(null);
    }
  }

  function togglePermission(p: AdminPermission) {
    setPermissions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {canManage ? (
        <div>
          <button
            type="button"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "Cancel" : "Create administrator"}
          </button>
          {showCreate ? (
            <form
              onSubmit={(e) => void onCreate(e)}
              className="mt-4 space-y-3 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  Email
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
                  />
                </label>
                <label className="text-sm">
                  Temporary password
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
                  />
                </label>
                <label className="text-sm">
                  First name
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
                  />
                </label>
                <label className="text-sm">
                  Last name
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isRootAdmin}
                  onChange={(e) => setIsRootAdmin(e.target.checked)}
                />
                Root Administrator
              </label>
              {!isRootAdmin ? (
                <label className="block text-sm">
                  Role
                  <select
                    value={adminRole}
                    onChange={(e) =>
                      setAdminRole(
                        e.target.value as "admin" | "editor" | "moderator",
                      )
                    }
                    className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </label>
              ) : null}
              <fieldset className="space-y-1">
                <legend className="text-sm font-semibold">
                  Permission overrides (optional)
                </legend>
                <div className="flex flex-wrap gap-3">
                  {ADMIN_PERMISSIONS.map((p) => (
                    <label key={p} className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={permissions.includes(p)}
                        onChange={() => togglePermission(p)}
                      />
                      {p.replaceAll("_", " ")}
                    </label>
                  ))}
                </div>
              </fieldset>
              <button
                type="submit"
                disabled={pendingId === "create"}
                className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Create account
              </button>
            </form>
          ) : null}
        </div>
      ) : null}

      {staff.length === 0 ? (
        <p className="text-[color:var(--foreground)]/70">No administrators found.</p>
      ) : (
        <div className="space-y-3">
          {staff.map((user) => {
            const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
            const isSelf = user.id === currentUserId;
            return (
              <article
                key={user.id}
                className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-brand">
                      {name || user.email}
                      {isSelf ? " (you)" : ""}
                    </h2>
                    <p className="text-sm text-[color:var(--foreground)]/70">
                      {user.email} · {staffLabel(user)}
                      {user.suspendedAt ? " · suspended" : ""}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--foreground)]/60">
                      Last admin login: {formatLogin(user.lastAdminLoginAt)}
                    </p>
                  </div>
                  {canManage && !isSelf ? (
                    <div className="flex flex-wrap gap-2">
                      <select
                        defaultValue={
                          user.isRootAdmin ? "root" : (user.adminRole ?? "admin")
                        }
                        disabled={pendingId === user.id}
                        className="rounded-md border border-[color:var(--line)] bg-white px-2 py-1.5 text-sm"
                        onChange={(e) => void changeRole(user.id, e.target.value)}
                      >
                        <option value="root">Root Admin</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="moderator">Moderator</option>
                      </select>
                      <button
                        type="button"
                        disabled={pendingId === user.id}
                        className="rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-brand disabled:opacity-60"
                        onClick={() => void changeEmail(user.id, user.email)}
                      >
                        Email
                      </button>
                      <button
                        type="button"
                        disabled={pendingId === user.id}
                        className="rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-brand disabled:opacity-60"
                        onClick={() => void resetPassword(user.id)}
                      >
                        Reset password
                      </button>
                      {user.suspendedAt ? (
                        <button
                          type="button"
                          disabled={pendingId === user.id}
                          className="rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-brand disabled:opacity-60"
                          onClick={() => void runAction(user.id, "reactivate")}
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={pendingId === user.id}
                          className="rounded-md border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-brand disabled:opacity-60"
                          onClick={() => void runAction(user.id, "suspend")}
                        >
                          Suspend
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={pendingId === user.id}
                        className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-800 disabled:opacity-60"
                        onClick={() => void runAction(user.id, "delete")}
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
