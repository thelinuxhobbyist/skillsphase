import {
  ALLOWED_PORTFOLIO_DOCUMENT_MIME_TYPES,
  ALLOWED_PORTFOLIO_IMAGE_MIME_TYPES,
  MAX_UPLOAD_BYTES,
} from "@horizon/shared";

type UploadResult = {
  key: string;
  url: string;
  fileName: string;
  contentType: string;
  size: number;
  storage: "r2" | "dev";
};

const ALL_ALLOWED_MIME_TYPES = [
  ...ALLOWED_PORTFOLIO_IMAGE_MIME_TYPES,
  ...ALLOWED_PORTFOLIO_DOCUMENT_MIME_TYPES,
];

export function assertPortfolioFile(file: File) {
  const mimeOk = (ALL_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type);
  if (!mimeOk) {
    throw new Error("Upload an image (PNG/JPEG/WebP/GIF) or a document (PDF/DOCX).");
  }
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File must be between 1 byte and 10 MB.");
  }
}

/**
 * Store a portfolio file (image or document) in R2 when bound; otherwise use a
 * deterministic dev:// key so profile flows can proceed before R2 is configured.
 */
export async function storePortfolioFile(input: {
  userId: string;
  file: File;
  bucket?: R2Bucket;
  environment: string;
}): Promise<UploadResult> {
  assertPortfolioFile(input.file);

  const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const key = `portfolio/${input.userId}/${crypto.randomUUID()}-${safeName}`;
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

export async function readStoredObject(input: {
  ref: string;
  bucket?: R2Bucket;
}): Promise<{ body: ArrayBuffer | Uint8Array; contentType: string; fileName: string } | null> {
  const parsed = parseStorageKey(input.ref);
  if (!parsed) return null;

  if (parsed.kind === "dev") {
    const text = `Dev storage placeholder for ${parsed.key}`;
    return {
      body: new TextEncoder().encode(text),
      contentType: "text/plain",
      fileName: parsed.key.split("/").pop() ?? "file.txt",
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
      "file",
  };
}

/** Ownership check: only the uploading candidate's own media keys may be requested via /me routes. */
export function storageKeyBelongsToUser(key: string, userId: string): boolean {
  return key.startsWith(`portfolio/${userId}/`);
}
