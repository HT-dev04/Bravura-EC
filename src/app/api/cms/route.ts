import { NextResponse } from "next/server";
import { getCmsData } from "@/lib/cms-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getCmsData());
}
