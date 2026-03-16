import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSupabaseAdmin, hasSupabaseStorage, getSupabaseStorageBucket } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

/** GET: Check which storage is configured (for debugging). */
export async function GET() {
  const supabase = hasSupabaseStorage();
  const blob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  return NextResponse.json({
    supabaseStorage: supabase,
    blobConfigured: blob,
    preferred: supabase ? "supabase" : blob ? "blob" : "none",
  });
}

/**
 * POST: Accept multipart/form-data with "file" field(s).
 * Uploads to Supabase Storage if configured, otherwise Vercel Blob.
 * Returns { ok: true, files: [{ name, url, type }] }.
 */
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (e) {
    return NextResponse.json({ error: "Invalid form data. Try a smaller image (under 4 MB)." }, { status: 400 });
  }

  const files: File[] = [];
  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      files.push(value);
    }
  }
  if (!files.length) {
    const keys = [...formData.keys()];
    return NextResponse.json({
      error: keys.length
        ? "No valid file in request. Use form field 'file' with an image (max 4 MB)."
        : "Request body empty or too large. Try an image under 4 MB.",
    }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const bucket = getSupabaseStorageBucket();
  const useSupabase = Boolean(supabase);

  if (useSupabase) {
    const results: { name: string; url: string; type: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file?.size || file.size > MAX_FILE_SIZE) continue;
      const name = (file.name || "image").replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `media/${Date.now()}-${i}-${name}`;
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(path, buffer, {
            contentType: file.type || "image/jpeg",
            upsert: true,
          });
        if (error) {
          console.error("Supabase upload error:", error);
          return NextResponse.json(
            { error: error.message || "Upload failed" },
            { status: 500 }
          );
        }
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        results.push({
          name: file.name || name,
          url: urlData.publicUrl,
          type: file.type || "image/jpeg",
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const lower = msg.toLowerCase();
        console.error("Supabase upload error:", msg);
        if (lower.includes("compact jws") || lower.includes("jwt")) {
          return NextResponse.json(
            {
              error:
                "Invalid Supabase key. In .env.local set SUPABASE_SERVICE_ROLE_KEY to the full service_role secret (Supabase → Project Settings → API). No quotes, one line. Create a public bucket named “media” in Storage.",
            },
            { status: 500 }
          );
        }
        return NextResponse.json({ error: msg || "Upload failed" }, { status: 500 });
      }
    }
    if (results.length === 0) {
      return NextResponse.json({ error: "No valid file (max 4 MB per file)." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, files: results });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "No storage configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example) or BLOB_READ_WRITE_TOKEN.",
      },
      { status: 503 }
    );
  }

  const results: { name: string; url: string; type: string }[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file?.size || file.size > MAX_FILE_SIZE) continue;
    const name = (file.name || "image").replace(/[^a-zA-Z0-9.-]/g, "_");
    const pathname = `media/${Date.now()}-${i}-${name}`;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const blob = await put(pathname, buffer, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type || "image/jpeg",
      });
      results.push({ name: file.name || name, url: blob.url, type: file.type || "image/jpeg" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const lower = msg.toLowerCase();
      console.error("Blob put error:", msg);
      if (lower.includes("compact jws") || lower.includes("jwt") || (lower.includes("invalid") && (lower.includes("token") || lower.includes("key")))) {
        return NextResponse.json(
          {
            error:
              "Invalid Blob token. Use Supabase: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local and create a public “media” bucket in Supabase Storage.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: msg || "Upload failed" }, { status: 500 });
    }
  }

  if (results.length === 0) {
    return NextResponse.json({ error: "No valid file (max 4 MB per file)." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, files: results });
}
