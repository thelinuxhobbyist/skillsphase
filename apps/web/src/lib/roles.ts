export type BootstrapRole = "job_seeker" | "employer";

export const ROLE_STORAGE_KEY = "horizon.bootstrapRole";

export function storeBootstrapRole(role: BootstrapRole) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ROLE_STORAGE_KEY, role);
}

export function readBootstrapRole(): BootstrapRole | null {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(ROLE_STORAGE_KEY);
  if (value === "job_seeker" || value === "employer") {
    return value;
  }
  return null;
}

export function clearBootstrapRole() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ROLE_STORAGE_KEY);
}

export function dashboardPathForRole(
  role: "job_seeker" | "employer" | "admin",
): string {
  switch (role) {
    case "employer":
      return "/employer";
    case "admin":
      return "/admin";
    default:
      return "/dashboard";
  }
}
