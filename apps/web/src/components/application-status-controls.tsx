"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { APPLICATION_STATUS_LABELS, type ApplicationStatus } from "@horizon/shared";
import { updateJobApplicationStatus, type MyApplication } from "@/lib/api";

const NEXT_STATUSES: Array<{ value: ApplicationStatus; label: string; primary?: boolean }> = [
  { value: "viewed", label: "Mark as Viewed" },
  { value: "interested", label: "Show Interest", primary: true },
  { value: "info_requested", label: "Request Info (CV / References / Licences)", primary: true },
  { value: "interview", label: "Invite to Interview", primary: true },
  { value: "offer", label: "Make Offer" },
  { value: "hired", label: "Mark Position Filled" },
  { value: "rejected", label: "Not Proceeding" },
];

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
    <div className="flex flex-wrap items-center gap-2">
      {NEXT_STATUSES.filter((item) => item.value !== status).map((item) => (
        <button
          key={item.value}
          type="button"
          disabled={busy}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-60 ${
            item.primary
              ? "bg-primary text-white hover:bg-primary/90"
              : "border border-[color:var(--line)] bg-white text-[color:var(--ink)] hover:bg-black/5"
          }`}
          onClick={() => {
            void (async () => {
              setBusy(true);
              try {
                const token = await getToken();
                if (!token) return;
                await updateJobApplicationStatus(token, applicationId, item.value);
                router.refresh();
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
