"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateJobApplicationStatus, type MyApplication } from "@/lib/api";

const NEXT_STATUSES = [
  "under_review",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const;

export function ApplicationStatusControls({
  applicationId,
  status,
}: {
  applicationId: string;
  status: MyApplication["status"];
}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (status === "withdrawn" || status === "hired" || status === "rejected") {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {NEXT_STATUSES.filter((value) => value !== status).map((value) => (
        <button
          key={value}
          type="button"
          disabled={busy}
          className="rounded-md border border-[color:var(--line)] px-3 py-1.5 text-xs font-medium capitalize disabled:opacity-60"
          onClick={() => {
            void (async () => {
              setBusy(true);
              try {
                const token = await getToken();
                if (!token) return;
                await updateJobApplicationStatus(token, applicationId, value);
                router.refresh();
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          Mark {value.replaceAll("_", " ")}
        </button>
      ))}
    </div>
  );
}
