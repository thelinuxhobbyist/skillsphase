"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ApiRequestError,
  adminChangePassword,
  adminUpdateProfile,
  getAdminMe,
  type HorizonUser,
} from "@/lib/api";
import { useAdminToken } from "@/lib/use-admin-token";

export function AdminAccountPanel() {
  const router = useRouter();
  const { getToken } = useAdminToken();
  const [user, setUser] = useState<HorizonUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    void (async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const me = await getAdminMe(token);
        setUser(me);
        setEmail(me.email);
        setFirstName(me.firstName ?? "");
        setLastName(me.lastName ?? "");
      } catch {
        setError("Unable to load account.");
      }
    })();
  }, [getToken]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      const updated = await adminUpdateProfile(token, {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
      });
      setUser(updated);
      setMessage("Profile updated.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Update failed.",
      );
    } finally {
      setPending(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      await adminChangePassword(token, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password changed.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Password change failed.",
      );
    } finally {
      setPending(false);
    }
  }

  if (!user) {
    return <p className="text-[color:var(--foreground)]/70">Loading…</p>;
  }

  return (
    <div className="space-y-10">
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-green-800" role="status">
          {message}
        </p>
      ) : null}

      <form onSubmit={(e) => void saveProfile(e)} className="space-y-3">
        <h2 className="font-display text-2xl text-primary">
          Profile
        </h2>
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            First name
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Last name
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Save profile
        </button>
      </form>

      <form onSubmit={(e) => void savePassword(e)} className="space-y-3">
        <h2 className="font-display text-2xl text-primary">
          Change password
        </h2>
        <label className="block text-sm">
          Current password
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          New password
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-[color:var(--line)] bg-white px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Update password
        </button>
      </form>
    </div>
  );
}
