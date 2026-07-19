import type { Database } from "../client";
import { findCompanyByOwner, toPublicCompany } from "./companies";
import { listApplicationsForUser } from "./applications";
import {
  listEducation,
  listEmploymentHistory,
  listQualifications,
  listUserSkills,
} from "./profile";
import { toPublicUser, type AppUser } from "./users";

export async function buildGdprExport(db: Database, user: AppUser) {
  const base = {
    exportedAt: new Date().toISOString(),
    user: toPublicUser(user),
  };

  if (user.role === "job_seeker") {
    const [employmentHistory, education, qualifications, skills, applications] =
      await Promise.all([
        listEmploymentHistory(db, user.id),
        listEducation(db, user.id),
        listQualifications(db, user.id),
        listUserSkills(db, user.id),
        listApplicationsForUser(db, user.id),
      ]);

    return {
      ...base,
      profile: {
        employmentHistory,
        education,
        qualifications,
        skills,
      },
      applications,
    };
  }

  if (user.role === "employer") {
    const company = await findCompanyByOwner(db, user.id);
    return {
      ...base,
      company: company ? toPublicCompany(company) : null,
    };
  }

  return base;
}
