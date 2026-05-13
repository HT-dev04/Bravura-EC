import { NextResponse } from "next/server";
import { getAdminAuthConfigError, getAdminSession } from "@/lib/admin-auth";
import { getCmsData, updateCmsCollection } from "@/lib/cms-store";
import { getErrorCode, getErrorMessage, isTemporaryDatabaseError } from "@/lib/database-retry";
import type { CmsData } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function requireAdmin() {
  return Boolean(await getAdminSession());
}

function errorResponse(error: string, status = 400, message?: string) {
  return NextResponse.json({ success: false, error, ...(message ? { message } : {}) }, { status });
}

function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      error: "UNAUTHORIZED",
      message: "Não autorizado. Faça login novamente no painel admin.",
    },
    { status: 401 }
  );
}

function adminConfigErrorResponse() {
  const message = getAdminAuthConfigError();
  return message ? errorResponse("ADMIN_CONFIG_ERROR", 500, message) : null;
}

function databaseUnavailableResponse() {
  return NextResponse.json(
    {
      success: false,
      error: "DATABASE_TEMPORARILY_UNAVAILABLE",
      message: "Não foi possível conectar ao banco de dados agora. Tente novamente em alguns segundos.",
    },
    { status: 503 }
  );
}

function isUniqueConstraintError(error: unknown) {
  return getErrorCode(error) === "P2002" || getErrorMessage(error).includes("Unique constraint failed");
}

function uniqueConstraintResponse() {
  return NextResponse.json(
    {
      success: false,
      error: "UNIQUE_CONSTRAINT_FAILED",
      message: "Já existe um registro com este ID. O salvamento precisa atualizar o registro existente em vez de criar outro.",
    },
    { status: 409 }
  );
}

function logApiError(context: string, error: unknown) {
  const details = {
    message: getErrorMessage(error),
    code: getErrorCode(error),
    temporary: isTemporaryDatabaseError(error),
    ...(process.env.NODE_ENV === "development" && error instanceof Error ? { stack: error.stack } : {}),
  };

  console.error(context, details);
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
  const configError = adminConfigErrorResponse();
  if (configError) return configError;
  if (!(await requireAdmin())) return unauthorizedResponse();
  try {
    const data = await getCmsData();
    return NextResponse.json({ success: true, data, ...data }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    logApiError("Erro ao carregar /api/admin/cms", error);
    if (isTemporaryDatabaseError(error)) return databaseUnavailableResponse();
    return errorResponse("Erro ao carregar dados", 500);
  }
}

export async function PUT(request: Request) {
  const configError = adminConfigErrorResponse();
  if (configError) return configError;
  if (!(await requireAdmin())) return unauthorizedResponse();

  try {
    const { collection, rows } = await request.json();
    if (!["players", "matches", "news", "gallery", "products", "sponsors", "orders", "teamStats", "finance"].includes(collection)) {
      return errorResponse("Coleção inválida");
    }

    const validationError = validateRows(collection as keyof CmsData, rows);
    if (validationError) return errorResponse(validationError);

    if (collection === "players" && process.env.NODE_ENV === "development") {
      console.info("API /api/admin/cms recebeu jogadores", {
        ids: Array.isArray(rows) ? rows.map((row) => row.id) : [],
        count: Array.isArray(rows) ? rows.length : 0,
      });
    }

    const data = await updateCmsCollection(collection as keyof CmsData, rows);
    if (collection === "players" && process.env.NODE_ENV === "development") {
      console.info("API /api/admin/cms retornando jogadores após salvar", {
        ids: data.players.map((player) => player.id),
        count: data.players.length,
      });
    }
    return NextResponse.json({ success: true, data, ...data }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    logApiError("Erro ao salvar /api/admin/cms", error);
    if (isUniqueConstraintError(error)) return uniqueConstraintResponse();
    if (isTemporaryDatabaseError(error)) return databaseUnavailableResponse();
    return errorResponse("Erro ao salvar dados", 500, process.env.NODE_ENV === "development" ? getErrorMessage(error) : undefined);
  }
}
