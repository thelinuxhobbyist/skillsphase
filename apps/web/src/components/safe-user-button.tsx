import { isClerkConfigured } from "@/lib/clerk-config";
import { UserButton } from "@clerk/nextjs";

export function SafeUserButton() {
  if (!isClerkConfigured()) {
    return null;
  }

  return <UserButton afterSignOutUrl="/" />;
}
