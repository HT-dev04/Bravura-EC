import path from "path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { mediaUrl, putObject } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024;

function errorResponse(error: string, message: string, status = 500) {
  return NextResponse.json({ success: false, error, message }, { status });
}

function createUploadPath(file: File) {
  const ext = path.extname(file.name).toLowerCase() || (file.type.startsWith("video/") ? ".mp4" : ".jpg");
  const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `admin/${id}${ext}`;
}

export async function POST(request: Request) {
  try {
    if (!(await getAdminSession())) {
      return errorResponse("UNAUTHORIZED", "Não autorizado. Faça login novamente no painel admin.", 401);
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return errorResponse("FILE_REQUIRED", "Arquivo obrigatório", 400);
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      return errorResponse("INVALID_FILE_TYPE", "Envie apenas imagens ou vídeos.", 400);
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      return errorResponse("FILE_TOO_LARGE", "Arquivo muito grande. Envie arquivos de até 25 MB.", 400);
    }

    const uploadPath = createUploadPath(file);

    try {
      await putObject(uploadPath, Buffer.from(await file.arrayBuffer()));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Erro ao gravar upload", { path: uploadPath, message });
      return errorResponse("UPLOAD_FAILED", `Falha ao gravar o arquivo: ${message}`, 500);
    }

    return NextResponse.json({ success: true, url: mediaUrl(uploadPath), path: uploadPath, type: file.type.startsWith("video/") ? "video" : "image" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao enviar arquivo";
    console.error("Erro em POST /api/admin/upload", { message });

    return errorResponse("UPLOAD_ERROR", message, 500);
  }
}
