import type { HorizonUser } from "@/lib/api";

export type NavLink = {
  href: string;
  label: string;
  /** Trailing links collapse into the More menu under ~720px. */
  collapsible?: boolean;
};

export const PUBLIC_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Jobs" },
  { href: "/discover-talent", label: "Browse Talent" },
  { href: "/about", label: "About" },
];

export function linksForUser(user: HorizonUser | null): NavLink[] {
  if (user?.role === "job_seeker") {
    return [
      { href: "/", label: "Home" },
      { href: "/jobs", label: "Jobs" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/applications", label: "Applications" },
      { href: "/profile", label: "SkillsPhase profile" },
      { href: "/contacts", label: "Messages", collapsible: true },
      { href: "/settings", label: "Settings", collapsible: true },
    ];
  }
  if (user?.role === "employer") {
    return [
      { href: "/", label: "Home" },
      { href: "/employer", label: "Dashboard" },
      { href: "/employer/jobs", label: "Jobs" },
      { href: "/employer/discover", label: "Discover Talent" },
      { href: "/employer/saved", label: "Saved", collapsible: true },
      { href: "/employer/contacts", label: "Contacts", collapsible: true },
      { href: "/employer/company", label: "Company", collapsible: true },
      { href: "/employer/settings", label: "Settings", collapsible: true },
    ];
  }
  if (user?.role === "admin") {
    return [
      { href: "/", label: "Home" },
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/employers", label: "Businesses" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/staff", label: "Admins" },
      { href: "/admin/audit", label: "Audit" },
      { href: "/admin/homepage", label: "Homepage" },
      { href: "/admin/reports", label: "Reports" },
      { href: "/admin/account", label: "Account" },
    ];
  }
  return [...PUBLIC_LINKS];
}

/** True when the signed-in role should use the two-row app chrome. */
export function usesAppNav(user: HorizonUser | null): boolean {
  return user?.role === "job_seeker" || user?.role === "employer";
}

export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
