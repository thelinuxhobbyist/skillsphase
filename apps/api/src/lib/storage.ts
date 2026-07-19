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
