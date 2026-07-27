"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ApiRequestError,
  deleteMyAccount,
  exportMyData,
} from "@/lib/api";
import { isClerkConfigured } from "@/lib/clerk-config";

export function AccountSettingsPanel(props: {
  role: "job_seeker" | "employer";
}) {
  if (!isClerkConfigured()) {
    return (
      <div className="p-6 text-center text-[color:var(--foreground)]/70">
        Clerk authentication is not configured.
      </div>
    );
  }
  return <ConfiguredAccountSettingsPanel {...props} />;
}

function ConfiguredAccountSettingsPanel({
  role,
}: {
  role: "job_seeker" | "employer";
}) {
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"export" | "delete" | null>(null);

  return (
    <div className="space-y-8">
      <section className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
        <h2 className="font-semibold text-primary">Password & security</h2>
        <p className="mt-2 text-sm text-[color:var(--foreground)]/75">
          Password reset and email verification are managed by Clerk via your
          account menu.
        </p>
      </section>

      <section className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
        <h2 className="font-semibold text-primary">Export your data</h2>
        <p className="mt-2 text-sm text-[color:var(--foreground)]/75">
          Download a JSON copy of your SkillsPhase account
          {role === "job_seeker"
            ? ", Skill Profile, and portfolio"
            : " and company registration"}
          .
        </p>
        <button
          type="button"
          disabled={pending !== null}
          className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={() => {
            void (async () => {
              setPending("export");
              setError(null);
              setMessage(null);
              try {
                const token = await getToken();
                if (!token) throw new Error("Missing session token");
                const data = await exportMyData(token);
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = `skillsphase-export-${new Date().toISOString().slice(0, 10)}.json`;
                anchor.click();
                URL.revokeObjectURL(url);
                setMessage("Export downloaded.");
              } catch (err) {
                setError(
                  err instanceof ApiRequestError || err instanceof Error
                    ? err.message
                    : "Export failed.",
                );
              } finally {
                setPending(null);
              }
            })();
          }}
        >
          Download export
        </button>
      </section>

      <section className="rounded-md border border-red-200 bg-red-50/70 p-5">
        <h2 className="font-semibold text-red-900">Delete account</h2>
        <p className="mt-2 text-sm text-red-900/80">
          Soft-deletes your account immediately. After the retention period
          (default 30 days), remaining personal data is purged or anonymised.
        </p>
        <button
          type="button"
          disabled={pending !== null}
          className="mt-4 rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={() => {
            if (
              !window.confirm(
                "Delete your SkillsPhase account? This cannot be undone from the app.",
              )
            ) {
              return;
            }
            void (async () => {
              setPending("delete");
              setError(null);
              setMessage(null);
              try {
                const token = await getToken();
                if (!token) throw new Error("Missing session token");
                await deleteMyAccount(token);
                await signOut({ redirectUrl: "/" });
                router.push("/");
              } catch (err) {
                setError(
                  err instanceof ApiRequestError || err instanceof Error
                    ? err.message
                    : "Delete failed.",
                );
                setPending(null);
              }
            })();
          }}
        >
          Delete my account
        </button>
      </section>

      {message ? (
        <p className="text-sm text-primary" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
