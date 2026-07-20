import type { AppUser } from "./lib/users";

export type AppEnv = {
  Bindings: Env & {
    CLERK_SECRET_KEY: string;
    CLERK_PUBLISHABLE_KEY: string;
    CLERK_AUTHORIZED_PARTIES?: string;
    DATABASE_URL: string;
    COMPANIES_HOUSE_API_KEY?: string;
    EMAIL_API_KEY?: string;
    EMAIL_FROM?: string;
  };
  Variables: {
    requestId: string;
    clerkUserId?: string;
    appUser?: AppUser;
    adminSessionToken?: string;
    adminSessionId?: string;
  };
};
