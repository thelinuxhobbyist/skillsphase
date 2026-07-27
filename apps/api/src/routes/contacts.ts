import {
  createContact,
  createMessage,
  findCompanyByOwner,
  findContact,
  findContactById,
  findUserById,
  listContactsForBusiness,
  listContactsForCandidate,
  listMessages,
} from "@horizon/database";
import { createContactSchema, sendMessageSchema } from "@horizon/shared";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { getDb } from "../lib/db";
import type { Database } from "@horizon/database";
import { contactNotificationEmailHtml, sendEmail } from "../lib/email";
import { fail, ok } from "../lib/response";
import { requireAppUser, requireClerkAuth } from "../middleware/auth";

export const contactRoutes = new Hono<AppEnv>();

contactRoutes.use("*", requireClerkAuth, requireAppUser);

contactRoutes.get("/", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  const db = getDb(c);

  if (appUser.role === "job_seeker") {
    return ok(c, await listContactsForCandidate(db, appUser.id));
  }

  if (appUser.role === "employer") {
    const company = await findCompanyByOwner(db, appUser.id);
    if (!company) return ok(c, []);
    return ok(c, await listContactsForBusiness(db, company.id));
  }

  return ok(c, []);
});

/** A business initiates contact with a candidate. There is no automatic match. */
contactRoutes.post("/:candidateId", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  if (appUser.role !== "employer") {
    return fail(c, "FORBIDDEN", "Only businesses can contact candidates.", 403);
  }

  const db = getDb(c);
  const company = await findCompanyByOwner(db, appUser.id);
  if (!company) {
    return fail(c, "COMPANY_NOT_FOUND", "Complete business registration first.", 403);
  }
  if (company.verificationStatus !== "approved" || !company.businessEmailVerified) {
    return fail(
      c,
      "COMPANY_NOT_VERIFIED",
      "Verify your company and business email before contacting candidates.",
      403,
    );
  }

  const body = await c.req.json().catch(() => null);
  const parsed = createContactSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "A message is required.",
      400,
    );
  }

  const candidateId = c.req.param("candidateId");
  const existing = await findContact(db, company.id, candidateId);
  if (existing) {
    return fail(c, "CONTACT_EXISTS", "You have already contacted this candidate.", 409);
  }

  const created = await createContact(db, {
    companyId: company.id,
    candidateUserId: candidateId,
    senderUserId: appUser.id,
    message: parsed.data.message,
  });

  const candidate = await findUserById(db, candidateId);
  if (candidate?.email) {
    await sendEmail({
      to: candidate.email,
      subject: `${company.companyName} is interested in your Skill Profile`,
      html: contactNotificationEmailHtml({
        companyName: company.companyName,
        message: parsed.data.message,
      }),
      apiKey: c.env.EMAIL_API_KEY,
      from: c.env.EMAIL_FROM,
    });
  }

  return ok(c, created, 201);
});

async function assertContactAccess(
  db: Database,
  contactId: string,
  appUser: NonNullable<AppEnv["Variables"]["appUser"]>,
) {
  const contact = await findContactById(db, contactId);
  if (!contact) return null;

  if (appUser.role === "job_seeker") {
    return contact.candidateUserId === appUser.id ? contact : null;
  }
  if (appUser.role === "employer") {
    const company = await findCompanyByOwner(db, appUser.id);
    return company && contact.companyId === company.id ? contact : null;
  }
  return null;
}

contactRoutes.get("/:id/messages", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  const db = getDb(c);

  const contact = await assertContactAccess(db, c.req.param("id"), appUser);
  if (!contact) return fail(c, "NOT_FOUND", "Conversation not found.", 404);

  return ok(c, await listMessages(db, contact.id));
});

contactRoutes.post("/:id/messages", async (c) => {
  const appUser = c.get("appUser");
  if (!appUser) return fail(c, "UNAUTHORIZED", "Authentication required.", 401);
  const db = getDb(c);

  const contact = await assertContactAccess(db, c.req.param("id"), appUser);
  if (!contact) return fail(c, "NOT_FOUND", "Conversation not found.", 404);

  const body = await c.req.json().catch(() => null);
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      c,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "A message body is required.",
      400,
    );
  }

  const message = await createMessage(db, {
    contactId: contact.id,
    senderUserId: appUser.id,
    body: parsed.data.body,
  });

  return ok(c, message, 201);
});
