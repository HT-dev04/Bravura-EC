import { NextResponse } from "next/server";
import { getAdminAuthConfigError, setAdminSession, verifyCredentials } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const configError = getAdminAuthConfigError({ requireCredentials: true });
  if (configError) {
    console.error("Erro de configuração do admin", { message: configError });
    return NextResponse.json({ error: "ADMIN_CONFIG_ERROR", message: configError }, { status: 500 });
  }

  const { email, password } = await request.json();
  if (!verifyCredentials(String(email || ""), String(password || ""))) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  await setAdminSession(email);
  return NextResponse.json({ ok: true });
}
