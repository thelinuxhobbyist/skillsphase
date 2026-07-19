import {
  createCompanySchema,
  updateCompanySchema,
  verifyCompanySchema,
} from "@horizon/shared";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import {
  CompaniesHouseError,
  lookupCompaniesHouseCompany,
} from "../lib/companies-house";
import { getDb } from "../lib/db";
import { fail, ok } from "../lib/response";
import {
  createCompany,
  findCompanyByNumber,
  findCompanyByOwner,
  toPublicCompany,
  updateCompany,
} from "@horizon/database";
import {
  requireAppUser,
  requireClerkAuth,
  requireRoles,
} from "../middleware/auth";

export const companyRoutes = new Hono<AppEnv>();

companyRoutes.use("*", requireClerkAuth, requireAppUser, requireRoles("employer"));

function chOptions(c: { env: AppEnv["Bindings"] }) {
  return {
    apiKey: c.env.COMPANIES_HOUSE_API_KEY,
    allowMock: (c.env.ENVIRONMENT ?? "development") === "development",
  };
}

companyRoutes.post("/verify", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = verifyCompanySchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid company number.",
      400,
    );
  }

  try {
    const company = await lookupCompaniesHouseCompany({
      companyNumber: parsed.data.companyNumber,
      ...chOptions(c),
    });

    return ok(c, {
      companyNumber: company.companyNumber,
      companyName: company.companyName,
      companyStatus: company.companyStatus,
      dateOfCreation: company.dateOfCreation,
      registeredOfficeAddress: company.registeredOfficeAddress,
      valid: company.companyStatus === "active",
    });
  } catch (error) {
    if (error instanceof CompaniesHouseError) {
      return fail(c, error.code, error.message, error.status as 400 | 404 | 502 | 503);
    }
    throw error;
  }
});

companyRoutes.get("/me", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) {
    return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  }

  const db = getDb(c);
  const company = await findCompanyByOwner(db, appUser.id);
  if (!company) {
    return fail(c, "COMPANY_NOT_FOUND", "No company registration found.", 404);
  }

  return ok(c, toPublicCompany(company));
});

companyRoutes.post("/", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) {
    return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = createCompanySchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid company details.",
      400,
    );
  }

  if (parsed.data.countryCode !== "GB") {
    return fail(
      c,
      "UK_ONLY",
      "MVP registration is limited to UK companies. Join the waitlist instead.",
      400,
    );
  }

  const db = getDb(c);
  const existingForOwner = await findCompanyByOwner(db, appUser.id);
  if (existingForOwner) {
    return fail(
      c,
      "COMPANY_EXISTS",
      "You already have a company registration.",
      409,
    );
  }

  const duplicate = await findCompanyByNumber(db, parsed.data.companyNumber);
  if (duplicate) {
    return fail(
      c,
      "DUPLICATE_COMPANY_NUMBER",
      "A company with this registration number is already registered.",
      409,
    );
  }

  try {
    const ch = await lookupCompaniesHouseCompany({
      companyNumber: parsed.data.companyNumber,
      ...chOptions(c),
    });

    if (ch.companyStatus && ch.companyStatus !== "active") {
      return fail(
        c,
        "COMPANY_NOT_ACTIVE",
        "Only active UK companies can register on Project Horizon.",
        400,
      );
    }

    const created = await createCompany(db, {
      ownerUserId: appUser.id,
      companyNumber: ch.companyNumber,
      companyName: ch.companyName,
      website: parsed.data.website,
      businessEmail: parsed.data.businessEmail,
      recruiterName: parsed.data.recruiterName,
      recruiterJobTitle: parsed.data.recruiterJobTitle,
      companiesHousePayload: ch.raw,
    });

    return ok(c, toPublicCompany(created), 201);
  } catch (error) {
    if (error instanceof CompaniesHouseError) {
      return fail(c, error.code, error.message, error.status as 400 | 404 | 502 | 503);
    }
    throw error;
  }
});

companyRoutes.patch("/me", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) {
    return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  }

  const db = getDb(c);
  const company = await findCompanyByOwner(db, appUser.id);
  if (!company) {
    return fail(c, "COMPANY_NOT_FOUND", "No company registration found.", 404);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = updateCompanySchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid company details.",
      400,
    );
  }

  const data = parsed.data;
  let companyName = company.companyName;
  let companiesHousePayload = company.companiesHousePayload;
  let companiesHouseVerified = company.companiesHouseVerified;
  let verificationStatus = company.verificationStatus;
  let rejectionReason = company.rejectionReason;

  if (data.companyNumber && data.companyNumber !== company.companyNumber) {
    const duplicate = await findCompanyByNumber(db, data.companyNumber);
    if (duplicate && duplicate.id !== company.id) {
      return fail(
        c,
        "DUPLICATE_COMPANY_NUMBER",
        "A company with this registration number is already registered.",
        409,
      );
    }

    try {
      const ch = await lookupCompaniesHouseCompany({
        companyNumber: data.companyNumber,
        ...chOptions(c),
      });
      companyName = ch.companyName;
      companiesHousePayload = ch.raw;
      companiesHouseVerified = true;
      verificationStatus = "pending_review";
      rejectionReason = null;
    } catch (error) {
      if (error instanceof CompaniesHouseError) {
        return fail(c, error.code, error.message, error.status as 400 | 404 | 502 | 503);
      }
      throw error;
    }
  }

  const updated = await updateCompany(db, company, {
    companyNumber: data.companyNumber,
    companyName,
    website: data.website,
    businessEmail: data.businessEmail,
    recruiterName: data.recruiterName,
    recruiterJobTitle: data.recruiterJobTitle,
    companiesHousePayload,
    companiesHouseVerified,
    verificationStatus,
    rejectionReason,
  });

  return ok(c, toPublicCompany(updated));
});

companyRoutes.post("/me/resubmit", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) {
    return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  }

  const db = getDb(c);
  const company = await findCompanyByOwner(db, appUser.id);
  if (!company) {
    return fail(c, "COMPANY_NOT_FOUND", "No company registration found.", 404);
  }

  if (company.verificationStatus !== "rejected") {
    return fail(
      c,
      "RESUBMIT_NOT_ALLOWED",
      "Only rejected registrations can be resubmitted.",
      409,
    );
  }

  try {
    const ch = await lookupCompaniesHouseCompany({
      companyNumber: company.companyNumber,
      ...chOptions(c),
    });

    const updated = await updateCompany(db, company, {
      companyName: ch.companyName,
      companiesHousePayload: ch.raw,
      companiesHouseVerified: true,
      verificationStatus: "pending_review",
      rejectionReason: null,
    });

    return ok(c, toPublicCompany(updated));
  } catch (error) {
    if (error instanceof CompaniesHouseError) {
      return fail(c, error.code, error.message, error.status as 400 | 404 | 502 | 503);
    }
    throw error;
  }
});
