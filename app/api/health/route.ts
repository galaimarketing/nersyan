import { NextResponse } from "next/server";
import { getConnectionString } from "@/lib/db";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

/** GET /api/health - Check if database, storage, and email are configured. */
export async function GET() {
  const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  // Email config booleans only (never expose the key).
  const email = {
    resendKey: Boolean(process.env.RESEND_API_KEY),
    from: Boolean(process.env.EMAIL_FROM),
    reception: Boolean(process.env.RECEPTION_EMAIL),
  };
  const connectionString = getConnectionString();
  if (!connectionString) {
    return NextResponse.json({
      ok: false,
      database: false,
      blobConfigured,
      email,
      error: "No DATABASE_URL or POSTGRES_URL set in environment",
    });
  }

  try {
    const sql = neon(connectionString);
    await sql`SELECT 1`;
    const rows = await sql`SELECT key FROM app_data LIMIT 1`;
    const tableExists = Array.isArray(rows) && rows.length >= 0;
    return NextResponse.json({
      ok: true,
      database: true,
      blobConfigured,
      email,
      tableExists,
      message: tableExists ? "Database and app_data table OK" : "Connected but app_data table missing - run lib/db/schema.sql in Neon SQL Editor",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      ok: false,
      database: true,
      blobConfigured,
      email,
      error: message,
      hint: message.includes("does not exist") ? "Run lib/db/schema.sql in Neon SQL Editor" : "Check DATABASE_URL and network",
    });
  }
}
