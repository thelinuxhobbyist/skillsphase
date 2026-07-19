import { createDb, purgeExpiredSoftDeletedUsers } from "@horizon/database";

/**
 * Daily retention purge: hard-delete / anonymise soft-deleted accounts
 * past DATA_RETENTION_DAYS (default 30).
 */
export async function runRetentionPurge(env: {
  DATABASE_URL?: string;
  DATA_RETENTION_DAYS?: string;
}) {
  if (!env.DATABASE_URL) {
    console.log(
      JSON.stringify({
        level: "info",
        message: "retention_purge_skipped_no_database",
      }),
    );
    return { skipped: true };
  }

  const days = Number(env.DATA_RETENTION_DAYS ?? "30");
  const retentionDays = Number.isFinite(days) && days > 0 ? days : 30;
  const db = createDb(env.DATABASE_URL);
  const result = await purgeExpiredSoftDeletedUsers(db, retentionDays);

  console.log(
    JSON.stringify({
      level: "info",
      message: "retention_purge_complete",
      retentionDays,
      ...result,
    }),
  );

  return result;
}
