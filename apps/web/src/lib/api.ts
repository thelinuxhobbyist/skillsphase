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
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as ApiResponse<T>;

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
  careerGapNarrative: string | null;
  coverLetterTemplate: string | null;
  profilePhotoUrl: string | null;
  cvUrl: string | null;
  cvFileName: string | null;
  profileCompleted: boolean;
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
    pendingEmployers: number;
    totalEmployers: number;
    approvedEmployers: number;
    activeJobs: number;
    totalJobSeekers: number;
    pendingApplications: number;
    recentUsers: AdminUser[];
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

export function listAdminAudit(token: string) {
  return apiFetch<AdminAuditLog[]>("/admin/audit", { token });
}

export function getAdminReports(token: string) {
  return apiFetch<{
    note: string;
    totalEmployers: number;
    approvedEmployers: number;
    pendingEmployers: number;
    activeJobs: number;
    totalJobSeekers: number;
    totalEmployerUsers: number;
    pendingApplications: number;
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

export function getJobById(token: string, id: number) {
  return apiFetch<HorizonJob>(`/jobs/${id}`, { token });
}

export function updateJob(
  token: string,
  id: number,
  body: Record<string, unknown>,
) {
  return apiFetch<HorizonJob>(`/jobs/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}

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
  skills: Array<{ id: string; name: string; category: string | null }>;
  completion: {
    profileCompleted: boolean;
    required: string[];
  };
};

export function getProfileBundle(token: string) {
  return apiFetch<ProfileBundle>("/users/me/profile", { token });
}

export function setSkillsByName(token: string, skills: string[]) {
  return apiFetch<Array<{ id: string; name: string; category: string | null }>>(
    "/users/me/skills",
    {
      method: "PUT",
      token,
      body: JSON.stringify({ skills }),
    },
  );
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

export function deleteQualification(token: string, id: string) {
  return apiFetch<{ deleted: boolean }>(`/users/me/qualifications/${id}`, {
    method: "DELETE",
    token,
  });
}

export type HorizonJob = {
  id: number;
  companyId: string;
  companyName: string;
  title: string;
  slug: string;
  description: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  location: string;
  remoteType: "on_site" | "hybrid" | "remote";
  employmentType: string;
  industry: string;
  closingDate: string | null;
  status: "draft" | "published" | "closed";
  skills: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
};

export type JobListResult = {
  jobs: HorizonJob[];
  meta: { page: number; pageSize: number; total: number };
};

export async function listPublishedJobs(params: {
  keyword?: string;
  location?: string;
  employmentType?: string;
  remoteType?: string;
  industry?: string;
  page?: number;
  pageSize?: number;
}): Promise<JobListResult> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  const response = await fetch(
    `${getApiBaseUrl()}/jobs${query ? `?${query}` : ""}`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  );
  const payload = (await response.json()) as ApiResponse<HorizonJob[]> & {
    meta?: JobListResult["meta"];
  };
  if (!response.ok || !payload.success) {
    const errorPayload = payload as ApiError;
    throw new ApiRequestError(
      response.status,
      errorPayload.error?.code ?? "REQUEST_FAILED",
      errorPayload.error?.message ?? "Failed to load jobs",
    );
  }
  return {
    jobs: payload.data,
    meta: payload.meta ?? { page: 1, pageSize: 20, total: payload.data.length },
  };
}

export function getJobBySlug(slug: string) {
  return apiFetch<HorizonJob>(`/jobs/by-slug/${encodeURIComponent(slug)}`);
}

export function listMyJobs(token: string) {
  return apiFetch<HorizonJob[]>("/jobs/mine", { token });
}

export function createJob(
  token: string,
  body: Record<string, unknown>,
) {
  return apiFetch<HorizonJob>("/jobs", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export function publishJob(token: string, id: number) {
  return apiFetch<HorizonJob>(`/jobs/${id}/publish`, { method: "POST", token });
}

export function closeJob(token: string, id: number) {
  return apiFetch<HorizonJob>(`/jobs/${id}/close`, { method: "POST", token });
}

export function reopenJob(token: string, id: number) {
  return apiFetch<HorizonJob>(`/jobs/${id}/reopen`, { method: "POST", token });
}

export function deleteDraftJob(token: string, id: number) {
  return apiFetch<{ deleted: boolean }>(`/jobs/${id}`, {
    method: "DELETE",
    token,
  });
}

export function listAdminJobs(token: string) {
  return apiFetch<HorizonJob[]>("/admin/jobs", { token });
}

export function adminRemoveJob(token: string, id: number) {
  return apiFetch<HorizonJob>(`/admin/jobs/${id}`, {
    method: "DELETE",
    token,
  });
}

export type HorizonApplication = {
  id: string;
  jobId: number;
  jobTitle: string;
  jobSlug: string;
  companyName: string;
  userId: string;
  candidateName: string;
  candidateEmail: string;
  coverLetter: string | null;
  cvUrl: string;
  cvFileName: string | null;
  status:
    | "applied"
    | "under_review"
    | "interview"
    | "offer"
    | "hired"
    | "rejected"
    | "withdrawn";
  createdAt: string;
  updatedAt: string;
  careerSummary?: string | null;
  location?: string | null;
};

export function applyToJob(
  token: string,
  jobId: number,
  coverLetter?: string | null,
) {
  return apiFetch<HorizonApplication>(`/jobs/${jobId}/apply`, {
    method: "POST",
    token,
    body: JSON.stringify({ coverLetter: coverLetter ?? null }),
  });
}

export function listMyApplications(token: string) {
  return apiFetch<HorizonApplication[]>("/applications/me", { token });
}

export function withdrawApplication(token: string, id: string) {
  return apiFetch<HorizonApplication>(`/applications/${id}`, {
    method: "DELETE",
    token,
  });
}

export function listJobApplications(token: string, jobId: number) {
  return apiFetch<HorizonApplication[]>(`/jobs/${jobId}/applications`, {
    token,
  });
}

export function updateApplicationStatus(
  token: string,
  id: string,
  status: Exclude<
    HorizonApplication["status"],
    "applied" | "withdrawn"
  >,
) {
  return apiFetch<HorizonApplication>(`/applications/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}

export function applicationCvUrl(id: string) {
  return `${getApiBaseUrl()}/applications/${id}/cv`;
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
  }>("/content/homepage");
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

export async function uploadCv(token: string, file: File) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${getApiBaseUrl()}/users/me/cv`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const payload = (await response.json()) as ApiResponse<{
    user: HorizonUser;
    upload: { fileName: string; storage: "r2" | "dev" };
  }>;

  if (!response.ok || !payload.success) {
    const errorPayload = payload as ApiError;
    throw new ApiRequestError(
      response.status,
      errorPayload.error?.code ?? "UPLOAD_FAILED",
      errorPayload.error?.message ?? "CV upload failed",
    );
  }

  return payload.data;
}
