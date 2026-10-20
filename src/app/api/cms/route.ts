import { NextResponse } from "next/server";
import { getPublicCmsData } from "@/lib/cms-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // Pública: nunca expor financeiro nem pedidos (dados de clientes).
  return NextResponse.json(await getPublicCmsData(), {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
