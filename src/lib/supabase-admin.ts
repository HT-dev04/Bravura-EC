import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const MISSING_SUPABASE_ENV_MESSAGE = "Missing Supabase environment variables";

function getRequiredSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const missing = [
    !url ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !key ? "SUPABASE_SERVICE_ROLE_KEY" : null,
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(`${MISSING_SUPABASE_ENV_MESSAGE}: ${missing.join(", ")}`);
  }

  try {
    new URL(url!);
  } catch {
    throw new Error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL is invalid");
  }

  return { url: url!, key: key! };
}

export function getSupabaseAdmin() {
  const { url, key } = getRequiredSupabaseConfig();

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getUploadBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "uploads";
}

export async function ensureUploadBucket(supabase: SupabaseClient, bucket: string) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw new Error(`Não foi possível listar buckets do Supabase: ${listError.message}`);

  const existing = buckets?.find((item) => item.name === bucket);
  if (!existing) {
    const { error: createError } = await supabase.storage.createBucket(bucket, {
      public: true,
    });

    if (createError) throw new Error(`Não foi possível criar o bucket '${bucket}': ${createError.message}`);
    return;
  }

  if (!existing.public) {
    const { error: updateError } = await supabase.storage.updateBucket(bucket, { public: true });
    if (updateError) throw new Error(`Não foi possível tornar o bucket '${bucket}' público: ${updateError.message}`);
  }
}
