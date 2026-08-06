"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { withdrawApplication } from "@/lib/api";

export function WithdrawApplicationButton({
  applicationId,
}: {
  applicationId: string;
}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      className="rounded-md border border-[color:var(--line)] px-3 py-1.5 text-sm font-medium disabled:opacity-60"
      onClick={() => {
        void (async () => {
          setBusy(true);
          try {
            const token = await getToken();
            if (!token) return;
            await withdrawApplication(token, applicationId);
            router.refresh();
          } finally {
            setBusy(false);
          }
        })();
      }}
    >
      {busy ? "Withdrawing…" : "Withdraw"}
    </button>
  );
}
