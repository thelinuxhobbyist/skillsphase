export type CompaniesHouseCompany = {
  companyNumber: string;
  companyName: string;
  companyStatus: string;
  dateOfCreation?: string;
  registeredOfficeAddress?: {
    address_line_1?: string;
    address_line_2?: string;
    locality?: string;
    postal_code?: string;
    country?: string;
  };
  raw: Record<string, unknown>;
};

export class CompaniesHouseError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "CompaniesHouseError";
    this.code = code;
    this.status = status;
  }
}

function normaliseCompanyNumber(companyNumber: string) {
  return companyNumber.trim().toUpperCase();
}

function mockCompany(companyNumber: string): CompaniesHouseCompany {
  return {
    companyNumber,
    companyName: `Mock Company ${companyNumber}`,
    companyStatus: "active",
    dateOfCreation: "2010-01-01",
    registeredOfficeAddress: {
      address_line_1: "1 Example Street",
      locality: "London",
      postal_code: "EC1A 1BB",
      country: "United Kingdom",
    },
    raw: { mock: true, company_number: companyNumber },
  };
}

/**
 * Look up a UK company via Companies House.
 * When no API key is configured in development, returns a deterministic mock.
 */
export async function lookupCompaniesHouseCompany(input: {
  companyNumber: string;
  apiKey?: string;
  allowMock: boolean;
}): Promise<CompaniesHouseCompany> {
  const companyNumber = normaliseCompanyNumber(input.companyNumber);
  const apiKey = input.apiKey?.trim();

  if (!apiKey) {
    if (input.allowMock) {
      return mockCompany(companyNumber);
    }
    throw new CompaniesHouseError(
      "COMPANIES_HOUSE_NOT_CONFIGURED",
      "Companies House is not configured on this environment.",
      503,
    );
  }

  // Basic auth: API key is the username, password is empty → encode "key:"
  const credentials = btoa(`${apiKey}:`);
  const response = await fetch(
    `https://api.company-information.service.gov.uk/company/${encodeURIComponent(companyNumber)}`,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
        "User-Agent": "SkillsPhase/1.0 (https://skillsphase.com)",
      },
    },
  );

  if (response.status === 404) {
    throw new CompaniesHouseError(
      "COMPANY_NOT_FOUND",
      "No UK company was found for that registration number.",
      404,
    );
  }

  if (response.status === 401) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "companies_house_unauthorized",
        companyNumber,
      }),
    );
    throw new CompaniesHouseError(
      "COMPANIES_HOUSE_UNAUTHORIZED",
      "Companies House rejected the API key. Re-check COMPANIES_HOUSE_API_KEY on the API worker.",
      502,
    );
  }

  if (response.status === 429) {
    throw new CompaniesHouseError(
      "COMPANIES_HOUSE_RATE_LIMITED",
      "Companies House rate limit hit. Please wait a minute and try again.",
      429,
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error(
      JSON.stringify({
        level: "error",
        message: "companies_house_error",
        status: response.status,
        companyNumber,
        body: body.slice(0, 300),
      }),
    );
    throw new CompaniesHouseError(
      "COMPANIES_HOUSE_ERROR",
      "Companies House validation failed. Please try again shortly.",
      502,
    );
  }

  const data = (await response.json()) as Record<string, unknown>;
  const companyName = String(data.company_name ?? "");
  const companyStatus = String(data.company_status ?? "");

  if (!companyName) {
    throw new CompaniesHouseError(
      "COMPANIES_HOUSE_ERROR",
      "Companies House returned an incomplete company record.",
      502,
    );
  }

  return {
    companyNumber: String(data.company_number ?? companyNumber).toUpperCase(),
    companyName,
    companyStatus,
    dateOfCreation:
      typeof data.date_of_creation === "string"
        ? data.date_of_creation
        : undefined,
    registeredOfficeAddress:
      typeof data.registered_office_address === "object" &&
      data.registered_office_address
        ? (data.registered_office_address as CompaniesHouseCompany["registeredOfficeAddress"])
        : undefined,
    raw: data,
  };
}
