import path from "path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureUploadBucket, getSupabaseAdmin, getUploadBucket } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!(await getAdminSession())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      return NextResponse.json({ error: "Envie apenas imagens ou vídeos." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase() || ".bin";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const bucket = getUploadBucket();
    const supabase = getSupabaseAdmin();
    await ensureUploadBucket(supabase, bucket);

    const { error } = await supabase.storage.from(bucket).upload(safeName, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (error) return NextResponse.json({ error: `Falha ao enviar para o bucket '${bucket}': ${error.message}` }, { status: 500 });

    const { data } = supabase.storage.from(bucket).getPublicUrl(safeName);

    return NextResponse.json({ url: data.publicUrl, type: file.type.startsWith("video/") ? "video" : "image" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao enviar arquivo" },
      { status: 500 }
    );
  }
}
