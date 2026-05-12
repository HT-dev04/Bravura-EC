import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase Storage não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  }

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
