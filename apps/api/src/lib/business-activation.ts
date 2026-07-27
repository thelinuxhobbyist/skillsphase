import {
  createEmailVerificationToken,
  type AppCompany,
  type Database,
} from "@horizon/database";
import type { Context } from "hono";
import type { AppEnv } from "../env";
import { hashToken } from "./admin-crypto";
import { businessActivationEmailHtml, sendEmail } from "./email";

/** Create an activation token and email the company's work address. */
export async function sendBusinessActivationEmail(
  db: Database,
  c: Context<AppEnv>,
  company: AppCompany,
): Promise<{ sent: boolean }> {
  const rawToken = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = await hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await createEmailVerificationToken(db, {
    companyId: company.id,
    email: company.businessEmail,
    tokenHash,
    expiresAt,
  });

  const baseUrl = (c.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const activateUrl = `${baseUrl}/employer/company/verify-email?token=${encodeURIComponent(rawToken)}`;

  return sendEmail({
    to: company.businessEmail,
    subject: "Activate your SkillsPhase business account",
    html: businessActivationEmailHtml({
      companyName: company.companyName,
      activateUrl,
    }),
    apiKey: c.env.EMAIL_API_KEY,
    from: c.env.EMAIL_FROM,
  });
}
