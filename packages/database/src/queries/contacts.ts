import { and, asc, desc, eq } from "drizzle-orm";
import type { Database } from "../client";
import { companies } from "../schema/companies";
import { contacts, messages } from "../schema/marketplace";
import { users } from "../schema/users";

export async function findContact(
  db: Database,
  companyId: string,
  candidateUserId: string,
) {
  const [row] = await db
    .select()
    .from(contacts)
    .where(
      and(eq(contacts.companyId, companyId), eq(contacts.candidateUserId, candidateUserId)),
    )
    .limit(1);
  return row ?? null;
}

export async function createContact(
  db: Database,
  input: { companyId: string; candidateUserId: string; senderUserId: string; message: string },
) {
  const [contact] = await db
    .insert(contacts)
    .values({ companyId: input.companyId, candidateUserId: input.candidateUserId })
    .returning();
  if (!contact) throw new Error("Failed to create contact");

  await db.insert(messages).values({
    contactId: contact.id,
    senderUserId: input.senderUserId,
    body: input.message,
  });

  return contact;
}

export async function findContactById(db: Database, id: string) {
  const [row] = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  return row ?? null;
}

export async function listContactsForBusiness(db: Database, companyId: string) {
  const rows = await db
    .select({ contact: contacts, candidate: users })
    .from(contacts)
    .innerJoin(users, eq(users.id, contacts.candidateUserId))
    .where(eq(contacts.companyId, companyId))
    .orderBy(desc(contacts.createdAt));

  return rows.map((r) => ({
    id: r.contact.id,
    createdAt: r.contact.createdAt.toISOString(),
    candidate: {
      id: r.candidate.id,
      firstName: r.candidate.firstName,
      lastName: r.candidate.lastName,
      professionalTitle: r.candidate.professionalTitle,
    },
  }));
}

export async function listContactsForCandidate(db: Database, candidateUserId: string) {
  const rows = await db
    .select({ contact: contacts, company: companies })
    .from(contacts)
    .innerJoin(companies, eq(companies.id, contacts.companyId))
    .where(eq(contacts.candidateUserId, candidateUserId))
    .orderBy(desc(contacts.createdAt));

  return rows.map((r) => ({
    id: r.contact.id,
    createdAt: r.contact.createdAt.toISOString(),
    business: {
      id: r.company.id,
      companyName: r.company.companyName,
    },
  }));
}

export async function listMessages(db: Database, contactId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.contactId, contactId))
    .orderBy(asc(messages.createdAt));
}

export async function createMessage(
  db: Database,
  input: { contactId: string; senderUserId: string; body: string },
) {
  const [row] = await db
    .insert(messages)
    .values({ contactId: input.contactId, senderUserId: input.senderUserId, body: input.body })
    .returning();
  if (!row) throw new Error("Failed to send message");
  return row;
}

export async function countContactsForCompany(db: Database, companyId: string) {
  const rows = await db
    .select({ id: contacts.id })
    .from(contacts)
    .where(eq(contacts.companyId, companyId));
  return rows.length;
}
