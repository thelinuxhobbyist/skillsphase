import {
  countPublicDiscoveryFeed,
  createCandidateList,
  findCompanyByOwner,
  getCandidateDetail,
  getPublicCandidateDetail,
  listCandidateLists,
  listDiscoveryFeed,
  listPublicDiscoveryFeed,
  listSavedCandidates,
  recordCandidateReview,
  saveCandidate,
  unsaveCandidate,
  type AppCompany,
} from "@horizon/database";
import {
  createCandidateListSchema,
  discoveryQuerySchema,
  publicDiscoveryQuerySchema,
  reviewCandidateSchema,
  saveCandidateSchema,
} from "@horizon/shared";
import type { Context } from "hono";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { getDb } from "../lib/db";
import { fail, ok } from "../lib/response";
import { requireAppUser, requireClerkAuth, requireRoles } from "../middleware/auth";

/**
 * Unauthenticated preview of the candidate pool. Anonymized (no name/photo/city)
 * so prospective businesses can see real evidence of skill/experience before
 * registering — contacting or saving a candidate still requires a verified
 * business login.
 */
export const publicDiscoveryRoutes = new Hono<AppEnv>();

publicDiscoveryRoutes.get("/", async (c) => {
  if (!c.env.DATABASE_URL) {
    return ok(c, { candidates: [], total: 0 });
  }

  const query = publicDiscoveryQuerySchema.safeParse({
    skills: c.req.query("skills"),
    availability: c.req.query("availability"),
    remoteType: c.req.query("remoteType"),
    minYearsExperience: c.req.query("minYearsExperience"),
    keyword: c.req.query("keyword"),
    limit: c.req.query("limit"),
    offset: c.req.query("offset"),
  });
  if (!query.success) {
    return fail(c, "VALIDATION_ERROR", "Invalid filters.", 400);
  }

  const db = getDb(c);
  const filters = {
    skillNames: query.data.skills
      ? query.data.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined,
    availability: query.data.availability,
    remotePreference: query.data.remoteType,
    minYearsExperience: query.data.minYearsExperience,
    keyword: query.data.keyword,
  };

  try {
    const [candidates, total] = await Promise.all([
      listPublicDiscoveryFeed(db, filters, query.data.limit, query.data.offset),
      countPublicDiscoveryFeed(db, filters),
    ]);
    return ok(c, { candidates, total });
  } catch {
    return ok(c, { candidates: [], total: 0 });
  }
});

publicDiscoveryRoutes.get("/:candidateId", async (c) => {
  if (!c.env.DATABASE_URL) {
    return fail(c, "NOT_FOUND", "Candidate not found.", 404);
  }
  const detail = await getPublicCandidateDetail(getDb(c), c.req.param("candidateId"));
  if (!detail) return fail(c, "NOT_FOUND", "Candidate not found.", 404);
  return ok(c, detail);
});

export const discoveryRoutes = new Hono<AppEnv>();

discoveryRoutes.use("*", requireClerkAuth, requireAppUser, requireRoles("employer"));

type CompanyGuardError =
  | "UNAUTHORIZED"
  | "COMPANY_NOT_FOUND"
  | "COMPANY_NOT_APPROVED"
  | "COMPANY_NOT_ACTIVATED";
type CompanyGuardResult =
  | { ok: false; error: CompanyGuardError }
  | { ok: true; company: AppCompany };

async function requireVerifiedCompany(
  c: Context<AppEnv>,
): Promise<CompanyGuardResult> {
  const appUser = c.get("appUser");
  if (!appUser) return { ok: false, error: "UNAUTHORIZED" };
  const db = getDb(c);
  const company = await findCompanyByOwner(db, appUser.id);
  if (!company) return { ok: false, error: "COMPANY_NOT_FOUND" };
  if (company.verificationStatus !== "approved") {
    return { ok: false, error: "COMPANY_NOT_APPROVED" };
  }
  if (!company.businessEmailVerified) {
    return { ok: false, error: "COMPANY_NOT_ACTIVATED" };
  }
  return { ok: true, company };
}

function companyGuardMessage(error: CompanyGuardError): string {
  switch (error) {
    case "UNAUTHORIZED":
      return "Authentication required.";
    case "COMPANY_NOT_FOUND":
      return "Complete business registration first.";
    case "COMPANY_NOT_APPROVED":
      return "Your registration is still awaiting administrator review.";
    case "COMPANY_NOT_ACTIVATED":
      return "Activate your business account using the link sent to your company email.";
  }
}

discoveryRoutes.get("/", async (c) => {
  const result = await requireVerifiedCompany(c);
  if (!result.ok) {
    const status = result.error === "UNAUTHORIZED" ? 401 : 403;
    return fail(c, result.error, companyGuardMessage(result.error), status);
  }

  const query = discoveryQuerySchema.safeParse({
    skills: c.req.query("skills"),
    availability: c.req.query("availability"),
    remoteType: c.req.query("remoteType"),
    minYearsExperience: c.req.query("minYearsExperience"),
    keyword: c.req.query("keyword"),
    limit: c.req.query("limit"),
  });
  if (!query.success) {
    return fail(c, "VALIDATION_ERROR", "Invalid filters.", 400);
  }

  const db = getDb(c);
  const cards = await listDiscoveryFeed(
    db,
    result.company.id,
    {
      skillNames: query.data.skills
        ? query.data.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      availability: query.data.availability,
      remotePreference: query.data.remoteType,
      minYearsExperience: query.data.minYearsExperience,
      keyword: query.data.keyword,
    },
    query.data.limit,
  );

  return ok(c, cards);
});

discoveryRoutes.post("/:candidateId/review", async (c) => {
  const result = await requireVerifiedCompany(c);
  if (!result.ok) {
    return fail(c, result.error, companyGuardMessage(result.error), result.error === "UNAUTHORIZED" ? 401 : 403);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = reviewCandidateSchema.safeParse(body);
  if (!parsed.success) {
    return fail(c, "VALIDATION_ERROR", "Invalid review action.", 400);
  }

  await recordCandidateReview(
    getDb(c),
    result.company.id,
    c.req.param("candidateId"),
    parsed.data.action,
  );
  return ok(c, { reviewed: true });
});

discoveryRoutes.get("/:candidateId", async (c) => {
  const result = await requireVerifiedCompany(c);
  if (!result.ok) {
    return fail(c, result.error, companyGuardMessage(result.error), result.error === "UNAUTHORIZED" ? 401 : 403);
  }

  const detail = await getCandidateDetail(getDb(c), c.req.param("candidateId"));
  if (!detail) return fail(c, "NOT_FOUND", "Candidate not found.", 404);

  await recordCandidateReview(getDb(c), result.company.id, detail.id, "viewed");
  return ok(c, detail);
});

discoveryRoutes.post("/:candidateId/save", async (c) => {
  const result = await requireVerifiedCompany(c);
  if (!result.ok) {
    return fail(c, result.error, companyGuardMessage(result.error), result.error === "UNAUTHORIZED" ? 401 : 403);
  }

  const body = await c.req.json().catch(() => ({}));
  const parsed = saveCandidateSchema.safeParse(body);
  if (!parsed.success) {
    return fail(c, "VALIDATION_ERROR", "Invalid save request.", 400);
  }

  const row = await saveCandidate(
    getDb(c),
    result.company.id,
    c.req.param("candidateId"),
    parsed.data.listId,
  );
  return ok(c, row, 201);
});

discoveryRoutes.delete("/:candidateId/save", async (c) => {
  const result = await requireVerifiedCompany(c);
  if (!result.ok) {
    return fail(c, result.error, companyGuardMessage(result.error), result.error === "UNAUTHORIZED" ? 401 : 403);
  }

  await unsaveCandidate(getDb(c), result.company.id, c.req.param("candidateId"));
  return ok(c, { deleted: true });
});

export const savedCandidateRoutes = new Hono<AppEnv>();
savedCandidateRoutes.use("*", requireClerkAuth, requireAppUser, requireRoles("employer"));

savedCandidateRoutes.get("/", async (c) => {
  const result = await requireVerifiedCompany(c);
  if (!result.ok) {
    return fail(c, result.error, companyGuardMessage(result.error), result.error === "UNAUTHORIZED" ? 401 : 403);
  }
  return ok(c, await listSavedCandidates(getDb(c), result.company.id));
});

export const candidateListRoutes = new Hono<AppEnv>();
candidateListRoutes.use("*", requireClerkAuth, requireAppUser, requireRoles("employer"));

candidateListRoutes.get("/", async (c) => {
  const result = await requireVerifiedCompany(c);
  if (!result.ok) {
    return fail(c, result.error, companyGuardMessage(result.error), result.error === "UNAUTHORIZED" ? 401 : 403);
  }
  return ok(c, await listCandidateLists(getDb(c), result.company.id));
});

candidateListRoutes.post("/", async (c) => {
  const result = await requireVerifiedCompany(c);
  if (!result.ok) {
    return fail(c, result.error, companyGuardMessage(result.error), result.error === "UNAUTHORIZED" ? 401 : 403);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = createCandidateListSchema.safeParse(body);
  if (!parsed.success) {
    return fail(c, "VALIDATION_ERROR", "Invalid list name.", 400);
  }

  const row = await createCandidateList(getDb(c), result.company.id, parsed.data.name);
  return ok(c, row, 201);
});
