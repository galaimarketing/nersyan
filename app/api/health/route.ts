import { NextResponse } from "next/server";
import { getConnectionString } from "@/lib/db";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

/** GET /api/health - Check if database is configured and reachable. */
export async function GET() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    return NextResponse.json({
      ok: false,
      database: false,
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
      tableExists,
      message: tableExists ? "Database and app_data table OK" : "Connected but app_data table missing - run lib/db/schema.sql in Neon SQL Editor",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      ok: false,
      database: true,
      error: message,
      hint: message.includes("does not exist") ? "Run lib/db/schema.sql in Neon SQL Editor" : "Check DATABASE_URL and network",
    });
  }
}
