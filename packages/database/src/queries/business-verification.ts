import { and, eq, gt, isNull } from "drizzle-orm";
import type { Database } from "../client";
import { companies } from "../schema/companies";
import { businessEmailVerifications } from "../schema/marketplace";

export async function createEmailVerificationToken(
  db: Database,
  input: { companyId: string; email: string; tokenHash: string; expiresAt: Date },
) {
  const [row] = await db
    .insert(businessEmailVerifications)
    .values({
      companyId: input.companyId,
      email: input.email,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    })
    .returning();
  if (!row) throw new Error("Failed to create verification token");
  return row;
}

export async function findValidVerificationByTokenHash(
  db: Database,
  tokenHash: string,
) {
  const [row] = await db
    .select()
    .from(businessEmailVerifications)
    .where(
      and(
        eq(businessEmailVerifications.tokenHash, tokenHash),
        isNull(businessEmailVerifications.verifiedAt),
        gt(businessEmailVerifications.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function markVerificationUsed(db: Database, id: string) {
  await db
    .update(businessEmailVerifications)
    .set({ verifiedAt: new Date() })
    .where(eq(businessEmailVerifications.id, id));
}

export async function markCompanyEmailVerified(db: Database, companyId: string) {
  const [row] = await db
    .update(companies)
    .set({
      businessEmailVerified: true,
      businessEmailVerifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(companies.id, companyId))
    .returning();
  return row ?? null;
}
