const DEFAULT_API_BASE = "http://localhost:8787/api/v1";

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
  createdAt: string;
  updatedAt: string;
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
  }>("/admin/dashboard", { token });
}
