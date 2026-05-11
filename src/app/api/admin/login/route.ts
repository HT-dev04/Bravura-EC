import { NextResponse } from "next/server";
import { setAdminSession, verifyCredentials } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!verifyCredentials(String(email || ""), String(password || ""))) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  await setAdminSession(email);
  return NextResponse.json({ ok: true });
}
