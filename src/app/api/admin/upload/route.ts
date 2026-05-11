import path from "path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getSupabaseAdmin, getUploadBucket } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });

  const ext = path.extname(file.name).toLowerCase() || ".bin";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const bucket = getUploadBucket();
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(safeName, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from(bucket).getPublicUrl(safeName);

  return NextResponse.json({ url: data.publicUrl, type: file.type.startsWith("video/") ? "video" : "image" });
}
