import { ALLOWED_CV_MIME_TYPES, MAX_UPLOAD_BYTES } from "@horizon/shared";

type UploadResult = {
  key: string;
  url: string;
  fileName: string;
  contentType: string;
  size: number;
  storage: "r2" | "dev";
};

export function assertCvFile(file: File) {
  if (!ALLOWED_CV_MIME_TYPES.includes(file.type as (typeof ALLOWED_CV_MIME_TYPES)[number])) {
    throw new Error("CV must be a PDF or DOCX file.");
  }
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    throw new Error("CV must be between 1 byte and 5 MB.");
  }
}

/**
 * Store a CV in R2 when bound; otherwise use a deterministic dev:// key
 * so profile completion can proceed before R2 credentials are configured.
 */
export async function storeCvObject(input: {
  userId: string;
  file: File;
  bucket?: R2Bucket;
  environment: string;
}): Promise<UploadResult> {
  assertCvFile(input.file);

  const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const key = `cvs/${input.userId}/${crypto.randomUUID()}-${safeName}`;
  const bytes = await input.file.arrayBuffer();

  if (input.bucket) {
    await input.bucket.put(key, bytes, {
      httpMetadata: {
        contentType: input.file.type,
      },
      customMetadata: {
        originalFileName: input.file.name,
        userId: input.userId,
      },
    });

    return {
      key,
      url: `r2://${key}`,
      fileName: input.file.name,
      contentType: input.file.type,
      size: input.file.size,
      storage: "r2",
    };
  }

  if (input.environment !== "development") {
    throw new Error("File storage is not configured.");
  }

  return {
    key,
    url: `dev://${key}`,
    fileName: input.file.name,
    contentType: input.file.type,
    size: input.file.size,
    storage: "dev",
  };
}

function parseStorageKey(url: string): { kind: "r2" | "dev"; key: string } | null {
  if (url.startsWith("r2://")) {
    return { kind: "r2", key: url.slice("r2://".length) };
  }
  if (url.startsWith("dev://")) {
    return { kind: "dev", key: url.slice("dev://".length) };
  }
  return null;
}

/**
 * Copy the seeker's current CV into an application-specific snapshot
 * so later profile CV changes do not alter historical applications.
 */
export async function snapshotCvForApplication(input: {
  userId: string;
  applicationId: string;
  sourceCvUrl: string;
  sourceFileName?: string | null;
  bucket?: R2Bucket;
  environment: string;
}): Promise<{ cvUrl: string; cvFileName: string | null }> {
  const parsed = parseStorageKey(input.sourceCvUrl);
  if (!parsed) {
    throw new Error("Current CV storage reference is invalid.");
  }

  const safeName = (input.sourceFileName ?? "cv.pdf")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120);
  const snapshotKey = `applications/${input.userId}/${input.applicationId}-${safeName}`;

  if (parsed.kind === "r2") {
    if (!input.bucket) {
      throw new Error("File storage is not configured.");
    }
    const object = await input.bucket.get(parsed.key);
    if (!object) {
      throw new Error("Current CV could not be found in storage.");
    }
    const bytes = await object.arrayBuffer();
    await input.bucket.put(snapshotKey, bytes, {
      httpMetadata: object.httpMetadata,
      customMetadata: {
        ...(object.customMetadata ?? {}),
        snapshotOf: parsed.key,
        applicationId: input.applicationId,
      },
    });
    return {
      cvUrl: `r2://${snapshotKey}`,
      cvFileName: input.sourceFileName ?? null,
    };
  }

  // Dev marker: keep a distinct application URL even without real object bytes.
  if (input.environment !== "development" && !input.bucket) {
    throw new Error("File storage is not configured.");
  }

  return {
    cvUrl: `dev://${snapshotKey}`,
    cvFileName: input.sourceFileName ?? null,
  };
}

export async function readStoredObject(input: {
  cvUrl: string;
  bucket?: R2Bucket;
}): Promise<{ body: ArrayBuffer | Uint8Array; contentType: string; fileName: string } | null> {
  const parsed = parseStorageKey(input.cvUrl);
  if (!parsed) return null;

  if (parsed.kind === "dev") {
    const text = `Dev CV snapshot placeholder for ${parsed.key}`;
    return {
      body: new TextEncoder().encode(text),
      contentType: "text/plain",
      fileName: parsed.key.split("/").pop() ?? "cv.txt",
    };
  }

  if (!input.bucket) return null;
  const object = await input.bucket.get(parsed.key);
  if (!object) return null;

  return {
    body: await object.arrayBuffer(),
    contentType: object.httpMetadata?.contentType ?? "application/octet-stream",
    fileName:
      object.customMetadata?.originalFileName ??
      parsed.key.split("/").pop() ??
      "cv",
  };
}
