import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAllowedHost() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (url) {
    try {
      return new URL(url).hostname;
    } catch {
      // falls through to default
    }
  }
  return "vvxbbfmwhrnoagbryefj.supabase.co";
}

// Same-origin proxy para imagens do Supabase Storage. Necessário porque o
// html-to-image precisa embutir as fotos no PNG e requisições cross-origin
// (mesmo públicas) podem falhar/“sujar” o canvas dependendo dos headers CORS.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");

  if (!target) {
    return NextResponse.json({ error: "Parâmetro 'url' obrigatório" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  // Allowlist estrito para evitar uso como open proxy / SSRF.
  if (parsed.protocol !== "https:" || parsed.hostname !== getAllowedHost()) {
    return NextResponse.json({ error: "Host não permitido" }, { status: 403 });
  }

  try {
    const upstream = await fetch(parsed.toString(), { cache: "no-store" });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Falha ao buscar imagem" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Conteúdo não é uma imagem" }, { status: 415 });
    }

    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao processar a imagem" }, { status: 502 });
  }
}
