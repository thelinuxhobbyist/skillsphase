import type { Database } from "../client";
import { findCompanyByOwner, toPublicCompany } from "./companies";
import { listContactsForBusiness, listContactsForCandidate } from "./contacts";
import { listSavedCandidates } from "./discovery";
import {
  listEducation,
  listEmploymentHistory,
  listQualifications,
  listUserSkills,
} from "./profile";
import { listProjectsForUser } from "./projects";
import { toPublicUser, type AppUser } from "./users";

export async function buildGdprExport(db: Database, user: AppUser) {
  const base = {
    exportedAt: new Date().toISOString(),
    user: toPublicUser(user),
  };

  if (user.role === "job_seeker") {
    const [employmentHistory, education, qualifications, skills, projects, contacts] =
      await Promise.all([
        listEmploymentHistory(db, user.id),
        listEducation(db, user.id),
        listQualifications(db, user.id),
        listUserSkills(db, user.id),
        listProjectsForUser(db, user.id),
        listContactsForCandidate(db, user.id),
      ]);

    return {
      ...base,
      profile: {
        employmentHistory,
        education,
        qualifications,
        skills,
        projects,
      },
      contacts,
    };
  }

  if (user.role === "employer") {
    const company = await findCompanyByOwner(db, user.id);
    const [savedCandidates, contacts] = await Promise.all([
      company ? listSavedCandidates(db, company.id) : Promise.resolve([]),
      company ? listContactsForBusiness(db, company.id) : Promise.resolve([]),
    ]);
    return {
      ...base,
      company: company ? toPublicCompany(company) : null,
      savedCandidates,
      contacts,
    };
  }

  return base;
}
