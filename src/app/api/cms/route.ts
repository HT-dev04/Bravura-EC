import { NextResponse } from "next/server";
import { getCmsData } from "@/lib/cms-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(await getCmsData(), {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
