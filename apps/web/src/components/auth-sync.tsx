"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiRequestError,
  bootstrapUser,
  getCurrentUser,
  type HorizonUser,
} from "@/lib/api";
import {
  clearBootstrapRole,
  dashboardPathForRole,
  readBootstrapRole,
  type BootstrapRole,
} from "@/lib/roles";

import { isClerkConfigured } from "@/lib/clerk-config";

type AuthSyncProps = {
  redirectOnSuccess?: boolean;
  preferredRole?: BootstrapRole | null;
};

export function AuthSync(props: AuthSyncProps) {
  if (!isClerkConfigured()) {
    return (
      <p className="px-6 py-16 text-center text-[color:var(--foreground)]/70">
        Clerk authentication is not configured.
      </p>
    );
  }
  return <ConfiguredAuthSync {...props} />;
}

function ConfiguredAuthSync({
  redirectOnSuccess = true,
  preferredRole = null,
}: AuthSyncProps) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [needsRole, setNeedsRole] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || ran.current) {
      return;
    }

    ran.current = true;

    async function sync() {
      try {
        const token = await getToken();
        if (!token) {
          setError("Could not retrieve your session token.");
          return;
        }

        let user: HorizonUser;
        try {
          user = await getCurrentUser(token);
        } catch (err) {
          if (
            err instanceof ApiRequestError &&
            (err.code === "USER_NOT_BOOTSTRAPPED" || err.status === 409)
          ) {
            const role = preferredRole ?? readBootstrapRole();
            if (!role) {
              setNeedsRole(true);
              return;
            }
            user = await bootstrapUser(token, role);
            clearBootstrapRole();
          } else {
            throw err;
          }
        }

        if (redirectOnSuccess) {
          router.replace(dashboardPathForRole(user.role));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to sync your Horizon account.",
        );
      }
    }

    void sync();
  }, [getToken, isLoaded, isSignedIn, preferredRole, redirectOnSuccess, router]);

  if (needsRole) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-6 py-16 text-center">
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-brand">
          Choose how you use Horizon
        </h1>
        <p className="text-[color:var(--foreground)]/75">
          Select a role to finish creating your account. This cannot be changed
          later without support.
        </p>
        <div className="flex flex-col gap-3">
          <RoleChoiceButton
            label="I'm returning to work"
            role="job_seeker"
            onDone={() => {
              ran.current = false;
              setNeedsRole(false);
            }}
          />
          <RoleChoiceButton
            label="I'm hiring"
            role="employer"
            onDone={() => {
              ran.current = false;
              setNeedsRole(false);
            }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="px-6 py-16 text-center text-red-700" role="alert">
        {error}
      </p>
    );
  }

  return (
    <p className="px-6 py-16 text-center text-[color:var(--foreground)]/70">
      Setting up your Horizon account…
    </p>
  );
}

function RoleChoiceButton({
  label,
  role,
  onDone,
}: {
  label: string;
  role: BootstrapRole;
  onDone: () => void;
}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        className="w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        onClick={() => {
          void (async () => {
            setPending(true);
            setError(null);
            try {
              const token = await getToken();
              if (!token) {
                throw new Error("Missing session token");
              }
              const user = await bootstrapUser(token, role);
              clearBootstrapRole();
              onDone();
              router.replace(dashboardPathForRole(user.role));
            } catch (err) {
              setError(err instanceof Error ? err.message : "Bootstrap failed");
              setPending(false);
            }
          })();
        }}
      >
        {label}
      </button>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
