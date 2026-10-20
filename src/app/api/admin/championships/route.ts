import { NextResponse } from "next/server";
import { getAdminAuthConfigError, getAdminSession } from "@/lib/admin-auth";
import {
  ChampionshipValidationError,
  deleteChampionship,
  listChampionships,
  saveChampionship,
} from "@/lib/championship-store";
import { getErrorCode, getErrorMessage, isTemporaryDatabaseError } from "@/lib/database-retry";
import type { Championship } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStore = { "Cache-Control": "no-store, max-age=0" };

function errorResponse(error: string, status = 400, message?: string) {
  return NextResponse.json({ success: false, error, ...(message ? { message } : {}) }, { status });
}

async function guard() {
  const configError = getAdminAuthConfigError();
  if (configError) return errorResponse("ADMIN_CONFIG_ERROR", 500, configError);
  if (!(await getAdminSession())) {
    return errorResponse("UNAUTHORIZED", 401, "Não autorizado. Faça login novamente no painel admin.");
  }
  return null;
}

function failure(context: string, error: unknown) {
  console.error(context, { message: getErrorMessage(error), code: getErrorCode(error) });
  if (error instanceof ChampionshipValidationError) return errorResponse("VALIDATION_ERROR", 400, error.message);
  if (isTemporaryDatabaseError(error)) {
    return errorResponse(
      "DATABASE_TEMPORARILY_UNAVAILABLE",
      503,
      "Não foi possível conectar ao banco de dados agora. Tente novamente em alguns segundos."
    );
  }
  return errorResponse("Erro ao processar campeonato", 500, process.env.NODE_ENV === "development" ? getErrorMessage(error) : undefined);
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  try {
    return NextResponse.json({ success: true, championships: await listChampionships() }, { headers: noStore });
  } catch (error) {
    return failure("Erro ao carregar /api/admin/championships", error);
  }
}

export async function PUT(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const { championship } = (await request.json()) as { championship?: Championship };
    if (!championship || typeof championship !== "object") return errorResponse("Dados enviados em formato inválido");
    const saved = await saveChampionship(championship);
    return NextResponse.json({ success: true, championship: saved }, { headers: noStore });
  } catch (error) {
    return failure("Erro ao salvar /api/admin/championships", error);
  }
}

export async function DELETE(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return errorResponse("Informe o campeonato");
    await deleteChampionship(id);
    return NextResponse.json({ success: true, championships: await listChampionships() }, { headers: noStore });
  } catch (error) {
    return failure("Erro ao excluir /api/admin/championships", error);
  }
}
