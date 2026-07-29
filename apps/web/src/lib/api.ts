const DEFAULT_API_BASE = "http://localhost:8787/api/v1";

import type { HomepageSectionType } from "@horizon/shared";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: { page: number; pageSize: number; total: number };
};

export type ApiError = {
  success: false;
  error: { code: string; message: string };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE;
}

export class ApiRequestError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

type ApiFetchOptions = RequestInit & {
  token?: string | null;
  /**
   * Seconds to cache the response for. Only for unauthenticated public reads;
   * everything else stays uncached so users never see another user's data.
   */
  revalidate?: number;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, headers, revalidate, ...rest } = options;
  const isCacheable = typeof revalidate === "number" && !token;

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...(rest.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
      },
      ...(isCacheable
        ? { next: { revalidate } }
        : { cache: "no-store" as const }),
    });
  } catch (err) {
    console.error(`[API Fetch Error] Request to ${path} failed:`, err);
    throw new ApiRequestError(
      0,
      "NETWORK_ERROR",
      `Unable to connect to the SkillsPhase API server (${getApiBaseUrl()}). Please check your connection or ensure the backend server is running.`,
    );
  }

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch (err) {
    console.error(`[API Parse Error] Request to ${path} returned invalid JSON:`, err);
    throw new ApiRequestError(
      response.status,
      "INVALID_RESPONSE",
      `The server returned an invalid response (${response.status} ${response.statusText}).`,
    );
  }

  if (!response.ok || !payload.success) {
    const errorPayload = payload as ApiError;
    throw new ApiRequestError(
      response.status,
      errorPayload.error?.code ?? "REQUEST_FAILED",
      errorPayload.error?.message ?? `API request failed: ${response.status}`,
    );
  }

  return payload.data;
}

/** Internal role identifiers: job_seeker = Candidate, employer = Business. */
export type HorizonUser = {
  id: string;
  clerkUserId: string;
  role: "job_seeker" | "employer" | "admin";
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  city: string | null;
  country: string | null;
  careerSummary: string | null;
  profilePhotoUrl: string | null;
  professionalTitle: string | null;
  remotePreference: "on_site" | "hybrid" | "remote" | null;
  availability: "immediate" | "within_one_month" | "freelance" | "permanent" | null;
  yearsExperience: number | null;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string;
  profileCompleted: boolean;
  isRootAdmin: boolean;
  adminRole: string | null;
  adminPermissions: string[] | null;
  lastAdminLoginAt: string | null;
  suspendedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUser = HorizonUser & {
  deletedAt: string | null;
};

export type AdminAuditLog = {
  id: string;
  adminUserId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  entity: string;
  entityId: string;
  notes: string | null;
  createdAt: string;
};

export function bootstrapUser(
  token: string,
  role: "job_seeker" | "employer",
) {
  return apiFetch<HorizonUser>("/users/me/bootstrap", {
    method: "POST",
    token,
    body: JSON.stringify({ role }),
  });
}

export function getCurrentUser(token: string) {
  return apiFetch<HorizonUser>("/users/me", { token });
}

export function getAdminMe(token: string) {
  return apiFetch<HorizonUser>("/admin/auth/me", { token });
}

export function adminLogin(email: string, password: string) {
  return apiFetch<{ token: string; expiresAt: string; user: HorizonUser }>(
    "/admin/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  );
}

export function adminChangePassword(
  token: string,
  currentPassword: string,
  newPassword: string,
) {
  return apiFetch<{ changed: boolean }>("/admin/auth/change-password", {
    method: "POST",
    token,
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function adminUpdateProfile(
  token: string,
  body: {
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
  },
) {
  return apiFetch<HorizonUser>("/admin/auth/profile", {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}

export function updateCurrentUser(
  token: string,
  body: Record<string, unknown>,
) {
  return apiFetch<HorizonUser>("/users/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}

export function updateCandidateProfile(
  token: string,
  body: Record<string, unknown>,
) {
  return apiFetch<HorizonUser>("/users/me/candidate-profile", {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}

export type HorizonCompany = {
  id: string;
  ownerUserId: string;
  companyNumber: string;
  companyName: string;
  website: string;
  businessEmail: string;
  recruiterName: string;
  recruiterJobTitle: string;
  verificationStatus:
    | "pending_review"
    | "approved"
    | "rejected"
    | "suspended";
  companiesHouseVerified: boolean;
  businessEmailVerified: boolean;
  rejectionReason: string | null;
  countryCode: string;
  businessEmailIsFreeProvider: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CompaniesHousePreview = {
  companyNumber: string;
  companyName: string;
  companyStatus: string;
  dateOfCreation?: string;
  registeredOfficeAddress?: Record<string, string | undefined>;
  valid: boolean;
};

export type AdminEmployer = HorizonCompany & {
  ownerEmail: string;
  ownerName: string;
};

export function verifyCompanyNumber(token: string, companyNumber: string) {
  return apiFetch<CompaniesHousePreview>("/companies/verify", {
    method: "POST",
    token,
    body: JSON.stringify({ companyNumber }),
  });
}

export function getMyCompany(token: string) {
  return apiFetch<HorizonCompany>("/companies/me", { token });
}

export function createCompany(
  token: string,
  body: {
    companyNumber: string;
    website: string;
    businessEmail: string;
    recruiterName: string;
    recruiterJobTitle: string;
    countryCode?: "GB";
  },
) {
  return apiFetch<HorizonCompany>("/companies", {
    method: "POST",
    token,
    body: JSON.stringify({ ...body, countryCode: "GB" }),
  });
}

export function updateMyCompany(
  token: string,
  body: Record<string, unknown>,
) {
  return apiFetch<HorizonCompany>("/companies/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}

export function resubmitCompany(token: string) {
  return apiFetch<HorizonCompany>("/companies/me/resubmit", {
    method: "POST",
    token,
  });
}

export function sendBusinessEmailVerification(token: string) {
  return apiFetch<{ sent: boolean; alreadyVerified?: boolean }>(
    "/companies/me/verify-email/send",
    { method: "POST", token },
  );
}

export function confirmBusinessEmailVerification(token: string, verifyToken: string) {
  return apiFetch<HorizonCompany>("/companies/me/verify-email/confirm", {
    method: "POST",
    token,
    body: JSON.stringify({ token: verifyToken }),
  });
}

export function joinWaitlist(body: {
  email: string;
  companyName?: string;
  countryCode: string;
  notes?: string;
}) {
  return apiFetch<{ id: string }>("/waitlist", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listAdminEmployers(
  token: string,
  status?: HorizonCompany["verificationStatus"],
) {
  const query = status ? `?status=${status}` : "";
  return apiFetch<AdminEmployer[]>(`/admin/employers${query}`, { token });
}

export function adminEmployerAction(
  token: string,
  companyId: string,
  action: "approve" | "reject" | "suspend" | "reinstate",
  rejectionReason?: string,
) {
  return apiFetch<HorizonCompany>(`/admin/employers/${companyId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ action, rejectionReason }),
  });
}

export function getAdminDashboard(token: string) {
  return apiFetch<{
    pendingBusinesses: number;
    totalBusinesses: number;
    verifiedBusinesses: number;
    totalCandidates: number;
    candidatesWithCompleteProfile: number;
    recentActions: AdminAuditLog[];
  }>("/admin/dashboard", { token });
}

export function listAdminUsers(
  token: string,
  params?: { role?: string; q?: string },
) {
  const search = new URLSearchParams();
  if (params?.role) search.set("role", params.role);
  if (params?.q) search.set("q", params.q);
  const query = search.toString();
  return apiFetch<AdminUser[]>(`/admin/users${query ? `?${query}` : ""}`, {
    token,
  });
}

export function adminUserAction(
  token: string,
  userId: string,
  action: "suspend" | "reactivate" | "delete",
) {
  return apiFetch<AdminUser | { deleted: boolean; id: string }>(
    `/admin/users/${userId}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify({ action }),
    },
  );
}

export function recordAdminSession(token: string) {
  return apiFetch<AdminUser>("/admin/session", {
    method: "POST",
    token,
    body: JSON.stringify({}),
  });
}

export function listAdminStaff(token: string, q?: string) {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  return apiFetch<AdminUser[]>(`/admin/staff${query}`, { token });
}

export function createAdminStaff(
  token: string,
  body: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    adminRole?: "admin" | "editor" | "moderator";
    isRootAdmin?: boolean;
    permissions?: string[] | null;
  },
) {
  return apiFetch<AdminUser>("/admin/staff", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export function updateAdminStaffMember(
  token: string,
  userId: string,
  body: Record<string, unknown>,
) {
  return apiFetch<AdminUser>(`/admin/staff/${userId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}

export function resetAdminStaffPassword(
  token: string,
  userId: string,
  password: string,
) {
  return apiFetch<{ reset: boolean; id: string }>(
    `/admin/staff/${userId}/reset-password`,
    {
      method: "POST",
      token,
      body: JSON.stringify({ password }),
    },
  );
}

export function listAdminAudit(token: string) {
  return apiFetch<AdminAuditLog[]>("/admin/audit", { token });
}

export function getAdminReports(token: string) {
  return apiFetch<{
    note: string;
    totalBusinesses: number;
    verifiedBusinesses: number;
    pendingBusinesses: number;
    totalCandidates: number;
    candidatesWithCompleteProfile: number;
    totalBusinessUsers: number;
  }>("/admin/reports", { token });
}

export function exportMyData(token: string) {
  return apiFetch<Record<string, unknown>>("/users/me/export", { token });
}

export function deleteMyAccount(token: string) {
  return apiFetch<{ deleted: boolean; softDeletedAt: string }>("/users/me", {
    method: "DELETE",
    token,
  });
}

export type SkillRef = { id: string; name: string; category: string | null };

export type ProjectMediaItem = {
  type: "image" | "video" | "document" | "link";
  url: string;
  label?: string | null;
};

export type Project = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  role: string | null;
  projectUrl: string | null;
  media: ProjectMediaItem[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProfileBundle = {
  user: HorizonUser;
  employmentHistory: Array<{
    id: string;
    employerName: string;
    jobTitle: string;
    startDate: string;
    endDate: string | null;
    currentlyWorking: boolean;
    description: string | null;
  }>;
  education: Array<{
    id: string;
    institution: string;
    qualification: string;
    startDate: string;
    endDate: string | null;
    description: string | null;
  }>;
  qualifications: Array<{
    id: string;
    name: string;
    issuingBody: string | null;
    dateAwarded: string | null;
    description: string | null;
  }>;
  skills: SkillRef[];
  projects: Project[];
  completion: {
    profileCompleted: boolean;
    required: string[];
  };
};

export function getProfileBundle(token: string) {
  return apiFetch<ProfileBundle>("/users/me/profile", { token });
}

export function setSkillsByName(token: string, skills: string[]) {
  return apiFetch<SkillRef[]>("/users/me/skills", {
    method: "PUT",
    token,
    body: JSON.stringify({ skills }),
  });
}

export function searchSkills(token: string, q?: string) {
  const query = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  return apiFetch<SkillRef[]>(`/users/skills${query}`, { token });
}

export function addEmployment(
  token: string,
  body: {
    employerName: string;
    jobTitle: string;
    startDate: string;
    endDate?: string | null;
    currentlyWorking?: boolean;
    description?: string | null;
  },
) {
  return apiFetch<ProfileBundle["employmentHistory"][number]>(
    "/users/me/employment-history",
    {
      method: "POST",
      token,
      body: JSON.stringify(body),
    },
  );
}

export function updateEmployment(
  token: string,
  id: string,
  body: {
    employerName: string;
    jobTitle: string;
    startDate: string;
    endDate?: string | null;
    currentlyWorking?: boolean;
    description?: string | null;
  },
) {
  return apiFetch<ProfileBundle["employmentHistory"][number]>(
    `/users/me/employment-history/${id}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(body),
    },
  );
}

export function deleteEmployment(token: string, id: string) {
  return apiFetch<{ deleted: boolean }>(`/users/me/employment-history/${id}`, {
    method: "DELETE",
    token,
  });
}

export function addEducation(
  token: string,
  body: {
    institution: string;
    qualification: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
  },
) {
  return apiFetch<ProfileBundle["education"][number]>("/users/me/education", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export function updateEducation(
  token: string,
  id: string,
  body: {
    institution: string;
    qualification: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
  },
) {
  return apiFetch<ProfileBundle["education"][number]>(
    `/users/me/education/${id}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(body),
    },
  );
}

export function deleteEducation(token: string, id: string) {
  return apiFetch<{ deleted: boolean }>(`/users/me/education/${id}`, {
    method: "DELETE",
    token,
  });
}

export function addQualification(
  token: string,
  body: {
    name: string;
    issuingBody?: string | null;
    dateAwarded?: string | null;
    description?: string | null;
  },
) {
  return apiFetch<ProfileBundle["qualifications"][number]>(
    "/users/me/qualifications",
    {
      method: "POST",
      token,
      body: JSON.stringify(body),
    },
  );
}

export function updateQualification(
  token: string,
  id: string,
  body: {
    name: string;
    issuingBody?: string | null;
    dateAwarded?: string | null;
    description?: string | null;
  },
) {
  return apiFetch<ProfileBundle["qualifications"][number]>(
    `/users/me/qualifications/${id}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(body),
    },
  );
}

export function deleteQualification(token: string, id: string) {
  return apiFetch<{ deleted: boolean }>(`/users/me/qualifications/${id}`, {
    method: "DELETE",
    token,
  });
}

export function listMyProjects(token: string) {
  return apiFetch<Project[]>("/projects", { token });
}

export function createProject(
  token: string,
  body: {
    title: string;
    description?: string | null;
    role?: string | null;
    projectUrl?: string | null;
    media?: ProjectMediaItem[];
  },
) {
  return apiFetch<Project>("/projects", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export function updateProject(
  token: string,
  id: string,
  body: Partial<{
    title: string;
    description: string | null;
    role: string | null;
    projectUrl: string | null;
    media: ProjectMediaItem[];
  }>,
) {
  return apiFetch<Project>(`/projects/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}

export function deleteProject(token: string, id: string) {
  return apiFetch<{ deleted: boolean }>(`/projects/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function uploadProjectMedia(token: string, file: File) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${getApiBaseUrl()}/projects/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const payload = (await response.json()) as ApiResponse<ProjectMediaItem>;
  if (!response.ok || !payload.success) {
    const errorPayload = payload as ApiError;
    throw new ApiRequestError(
      response.status,
      errorPayload.error?.code ?? "UPLOAD_FAILED",
      errorPayload.error?.message ?? "Upload failed",
    );
  }
  return payload.data;
}

export function mediaUrl(relativeUrl: string) {
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
    return relativeUrl;
  }
  const base = getApiBaseUrl().replace(/\/api\/v1$/, "");
  return `${base}${relativeUrl}`;
}

export type CandidateCard = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  professionalTitle: string | null;
  city: string | null;
  remotePreference: "on_site" | "hybrid" | "remote" | null;
  availability: "immediate" | "within_one_month" | "freelance" | "permanent" | null;
  yearsExperience: number | null;
  profilePhotoUrl: string | null;
  skills: string[];
  topProject: string | null;
};

export type CandidateDetail = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  professionalTitle: string | null;
  city: string | null;
  country: string | null;
  careerSummary: string | null;
  profilePhotoUrl: string | null;
  remotePreference: "on_site" | "hybrid" | "remote" | null;
  availability: "immediate" | "within_one_month" | "freelance" | "permanent" | null;
  yearsExperience: number | null;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string;
  skills: SkillRef[];
  projects: Project[];
  employmentHistory: ProfileBundle["employmentHistory"];
  education: ProfileBundle["education"];
  qualifications: ProfileBundle["qualifications"];
};

export function getDiscoveryFeed(
  token: string,
  filters: {
    skills?: string;
    availability?: string;
    remoteType?: string;
    minYearsExperience?: number;
    keyword?: string;
    limit?: number;
  } = {},
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return apiFetch<CandidateCard[]>(`/discover${query ? `?${query}` : ""}`, { token });
}

export type PublicCandidateCard = CandidateCard;

export function getPublicCandidates(
  filters: {
    skills?: string;
    availability?: string;
    remoteType?: string;
    minYearsExperience?: number;
    keyword?: string;
    limit?: number;
    offset?: number;
  } = {},
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return apiFetch<{ candidates: PublicCandidateCard[]; total: number }>(
    `/public/candidates${query ? `?${query}` : ""}`,
  );
}

export type PublicCandidateDetail = CandidateDetail;

export function getPublicCandidateDetail(candidateId: string) {
  return apiFetch<PublicCandidateDetail>(`/public/candidates/${candidateId}`);
}

export function getCandidateDetail(token: string, candidateId: string) {
  return apiFetch<CandidateDetail>(`/discover/${candidateId}`, { token });
}

export function reviewCandidate(
  token: string,
  candidateId: string,
  action: "skip" | "viewed",
) {
  return apiFetch<{ reviewed: boolean }>(`/discover/${candidateId}/review`, {
    method: "POST",
    token,
    body: JSON.stringify({ action }),
  });
}

export function saveCandidate(token: string, candidateId: string, listId?: string | null) {
  return apiFetch<{ id: string }>(`/discover/${candidateId}/save`, {
    method: "POST",
    token,
    body: JSON.stringify({ listId: listId ?? null }),
  });
}

export function unsaveCandidate(token: string, candidateId: string) {
  return apiFetch<{ deleted: boolean }>(`/discover/${candidateId}/save`, {
    method: "DELETE",
    token,
  });
}

export type SavedCandidateEntry = {
  savedAt: string;
  listId: string | null;
  candidate: CandidateCard;
};

export function listSavedCandidates(token: string) {
  return apiFetch<SavedCandidateEntry[]>("/saved-candidates", { token });
}

export type CandidateList = { id: string; companyId: string; name: string; createdAt: string };

export function listCandidateLists(token: string) {
  return apiFetch<CandidateList[]>("/candidate-lists", { token });
}

export function createCandidateList(token: string, name: string) {
  return apiFetch<CandidateList>("/candidate-lists", {
    method: "POST",
    token,
    body: JSON.stringify({ name }),
  });
}

export type ContactSummary = {
  id: string;
  createdAt: string;
  candidate?: { id: string; firstName: string | null; lastName: string | null; professionalTitle: string | null };
  business?: { id: string; companyName: string };
};

export function listContacts(token: string) {
  return apiFetch<ContactSummary[]>("/contacts", { token });
}

export function createContact(token: string, candidateId: string, message: string) {
  return apiFetch<{ id: string }>(`/contacts/${candidateId}`, {
    method: "POST",
    token,
    body: JSON.stringify({ message }),
  });
}

export type Message = {
  id: string;
  contactId: string;
  senderUserId: string;
  body: string;
  createdAt: string;
};

export function listMessages(token: string, contactId: string) {
  return apiFetch<Message[]>(`/contacts/${contactId}/messages`, { token });
}

export function sendMessage(token: string, contactId: string, body: string) {
  return apiFetch<Message>(`/contacts/${contactId}/messages`, {
    method: "POST",
    token,
    body: JSON.stringify({ body }),
  });
}

export type HomepageSectionDto = {
  id: string;
  type: HomepageSectionType;
  enabled: boolean;
  sortOrder: number;
  label: string;
  content: Record<string, unknown>;
};

export async function getHomepageContent() {
  return apiFetch<{
    source: "database" | "defaults";
    sections: HomepageSectionDto[];
  }>("/content/homepage", { revalidate: 60 });
}

export async function getFooterContent() {
  return apiFetch<{
    source: "database" | "defaults";
    enabled: boolean;
    content: Record<string, unknown>;
  }>("/content/footer", { revalidate: 60 });
}

export function listAdminHomepageSections(token: string) {
  return apiFetch<{ sections: HomepageSectionDto[] }>("/admin/homepage", {
    token,
  });
}

export function updateAdminHomepageSection(
  token: string,
  id: string,
  body: {
    enabled?: boolean;
    label?: string;
    content?: Record<string, unknown>;
  },
) {
  return apiFetch<HomepageSectionDto>(`/admin/homepage/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}

export function reorderAdminHomepageSections(token: string, orderedIds: string[]) {
  return apiFetch<{ sections: HomepageSectionDto[] }>("/admin/homepage/reorder", {
    method: "PATCH",
    token,
    body: JSON.stringify({ orderedIds }),
  });
}

export function createAdminHomepageSection(
  token: string,
  body: { type: string; label?: string; enabled?: boolean },
) {
  return apiFetch<HomepageSectionDto>("/admin/homepage", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export function deleteAdminHomepageSection(token: string, id: string) {
  return apiFetch<{ deleted: boolean; id: string }>(`/admin/homepage/${id}`, {
    method: "DELETE",
    token,
  });
}

export function resetAdminHomepageSections(token: string) {
  return apiFetch<{ sections: HomepageSectionDto[] }>("/admin/homepage/reset", {
    method: "POST",
    token,
  });
}
