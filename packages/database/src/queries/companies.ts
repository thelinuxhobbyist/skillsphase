import { and, desc, eq, isNull } from "drizzle-orm";
import type { VerificationStatus } from "@horizon/shared";
import type { Database } from "../client";
import { adminLogs } from "../schema/admin";
import { companies } from "../schema/companies";
import { waitlistEntries } from "../schema/admin";
import { users } from "../schema/users";

export type AppCompany = typeof companies.$inferSelect;

export type PublicCompany = {
  id: string;
  ownerUserId: string;
  companyNumber: string;
  companyName: string;
  website: string;
  businessEmail: string;
  recruiterName: string;
  recruiterJobTitle: string;
  verificationStatus: VerificationStatus;
  companiesHouseVerified: boolean;
  businessEmailVerified: boolean;
  rejectionReason: string | null;
  countryCode: string;
  businessEmailIsFreeProvider: boolean;
  createdAt: string;
  updatedAt: string;
};

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "yahoo.co.uk",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "mail.com",
]);

export function isFreeEmailProvider(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return Boolean(domain && FREE_EMAIL_DOMAINS.has(domain));
}

export function toPublicCompany(company: AppCompany): PublicCompany {
  return {
    id: company.id,
    ownerUserId: company.ownerUserId,
    companyNumber: company.companyNumber,
    companyName: company.companyName,
    website: company.website,
    businessEmail: company.businessEmail,
    recruiterName: company.recruiterName,
    recruiterJobTitle: company.recruiterJobTitle,
    verificationStatus: company.verificationStatus,
    companiesHouseVerified: company.companiesHouseVerified,
    businessEmailVerified: company.businessEmailVerified,
    rejectionReason: company.rejectionReason,
    countryCode: company.countryCode,
    businessEmailIsFreeProvider: isFreeEmailProvider(company.businessEmail),
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };
}

export async function findCompanyByOwner(
  db: Database,
  ownerUserId: string,
): Promise<AppCompany | null> {
  const [row] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.ownerUserId, ownerUserId), isNull(companies.deletedAt)))
    .limit(1);
  return row ?? null;
}

export async function findCompanyByNumber(
  db: Database,
  companyNumber: string,
): Promise<AppCompany | null> {
  const [row] = await db
    .select()
    .from(companies)
    .where(
      and(
        eq(companies.companyNumber, companyNumber.toUpperCase()),
        isNull(companies.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function findCompanyById(
  db: Database,
  companyId: string,
): Promise<AppCompany | null> {
  const [row] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.id, companyId), isNull(companies.deletedAt)))
    .limit(1);
  return row ?? null;
}

export async function createCompany(
  db: Database,
  input: {
    ownerUserId: string;
    companyNumber: string;
    companyName: string;
    website: string;
    businessEmail: string;
    recruiterName: string;
    recruiterJobTitle: string;
    companiesHousePayload: unknown;
  },
): Promise<AppCompany> {
  const [created] = await db
    .insert(companies)
    .values({
      ownerUserId: input.ownerUserId,
      companyNumber: input.companyNumber.toUpperCase(),
      companyName: input.companyName,
      website: input.website,
      businessEmail: input.businessEmail,
      recruiterName: input.recruiterName,
      recruiterJobTitle: input.recruiterJobTitle,
      verificationStatus: "pending_review",
      companiesHouseVerified: true,
      companiesHousePayload: input.companiesHousePayload as Record<string, unknown>,
      countryCode: "GB",
      rejectionReason: null,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create company");
  }
  return created;
}

export async function updateCompany(
  db: Database,
  company: AppCompany,
  input: {
    companyNumber?: string;
    companyName?: string;
    website?: string;
    businessEmail?: string;
    recruiterName?: string;
    recruiterJobTitle?: string;
    companiesHousePayload?: unknown;
    companiesHouseVerified?: boolean;
    verificationStatus?: VerificationStatus;
    rejectionReason?: string | null;
  },
): Promise<AppCompany> {
  const emailChanged =
    input.businessEmail !== undefined &&
    input.businessEmail !== company.businessEmail;

  const [updated] = await db
    .update(companies)
    .set({
      companyNumber: input.companyNumber
        ? input.companyNumber.toUpperCase()
        : company.companyNumber,
      companyName: input.companyName ?? company.companyName,
      website: input.website ?? company.website,
      businessEmail: input.businessEmail ?? company.businessEmail,
      businessEmailVerified: emailChanged ? false : company.businessEmailVerified,
      businessEmailVerifiedAt: emailChanged ? null : company.businessEmailVerifiedAt,
      recruiterName: input.recruiterName ?? company.recruiterName,
      recruiterJobTitle: input.recruiterJobTitle ?? company.recruiterJobTitle,
      companiesHousePayload:
        input.companiesHousePayload === undefined
          ? company.companiesHousePayload
          : (input.companiesHousePayload as Record<string, unknown>),
      companiesHouseVerified:
        input.companiesHouseVerified ?? company.companiesHouseVerified,
      verificationStatus: input.verificationStatus ?? company.verificationStatus,
      rejectionReason:
        input.rejectionReason === undefined
          ? company.rejectionReason
          : input.rejectionReason,
      updatedAt: new Date(),
    })
    .where(eq(companies.id, company.id))
    .returning();

  if (!updated) {
    throw new Error("Company not found");
  }
  return updated;
}

export async function listCompaniesForAdmin(
  db: Database,
  status?: VerificationStatus,
) {
  const rows = await db
    .select({
      company: companies,
      ownerEmail: users.email,
      ownerFirstName: users.firstName,
      ownerLastName: users.lastName,
    })
    .from(companies)
    .innerJoin(users, eq(users.id, companies.ownerUserId))
    .where(
      status
        ? and(isNull(companies.deletedAt), eq(companies.verificationStatus, status))
        : isNull(companies.deletedAt),
    )
    .orderBy(desc(companies.createdAt));

  return rows.map((row) => ({
    ...toPublicCompany(row.company),
    ownerEmail: row.ownerEmail,
    ownerName: [row.ownerFirstName, row.ownerLastName].filter(Boolean).join(" "),
  }));
}

export async function writeAdminLog(
  db: Database,
  input: {
    adminUserId: string;
    action: string;
    entity: string;
    entityId: string;
    notes?: string;
  },
) {
  await db.insert(adminLogs).values({
    adminUserId: input.adminUserId,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId,
    notes: input.notes,
  });
}

export async function createWaitlistEntry(
  db: Database,
  input: {
    email: string;
    companyName?: string;
    countryCode: string;
    notes?: string;
  },
) {
  const [created] = await db
    .insert(waitlistEntries)
    .values({
      email: input.email,
      companyName: input.companyName,
      countryCode: input.countryCode.toUpperCase(),
      notes: input.notes,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create waitlist entry");
  }
  return created;
}
