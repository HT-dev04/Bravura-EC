import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getCmsData, updateCmsCollection } from "@/lib/cms-store";
import type { CmsData } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function requireAdmin() {
  return Boolean(await getAdminSession());
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

function validateRows(collection: keyof CmsData, rows: CmsData[keyof CmsData]) {
  if ((collection === "teamStats" || collection === "finance") && rows && !Array.isArray(rows)) return null;
  if (!Array.isArray(rows)) return "Dados enviados em formato inválido";

  const ids = rows
    .map((row) => (row && typeof row === "object" && "id" in row ? String(row.id) : ""))
    .filter(Boolean);
  const duplicateId = ids.find((id, index) => ids.indexOf(id) !== index);
  return duplicateId ? `ID duplicado na coleção ${collection}: ${duplicateId}` : null;
}

export async function GET() {
  if (!(await requireAdmin())) return errorResponse("Não autorizado", 401);
  const data = await getCmsData();
  return NextResponse.json({ success: true, data, ...data }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return errorResponse("Não autorizado", 401);

  try {
    const { collection, rows } = await request.json();
    if (!["players", "matches", "news", "gallery", "products", "sponsors", "orders", "teamStats", "finance"].includes(collection)) {
      return errorResponse("Coleção inválida");
    }

    const validationError = validateRows(collection as keyof CmsData, rows);
    if (validationError) return errorResponse(validationError);

    if (collection === "players") {
      console.info("API /api/admin/cms recebeu jogadores", {
        ids: Array.isArray(rows) ? rows.map((row) => row.id) : [],
        count: Array.isArray(rows) ? rows.length : 0,
      });
    }

    const data = await updateCmsCollection(collection as keyof CmsData, rows);
    if (collection === "players") {
      console.info("API /api/admin/cms retornando jogadores após salvar", {
        ids: data.players.map((player) => player.id),
        count: data.players.length,
      });
    }
    return NextResponse.json({ success: true, data, ...data }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("Erro na API /api/admin/cms", {
      message: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(error instanceof Error ? error.message : "Erro ao salvar dados", 500);
  }
}
