import { getObject } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const object = await getObject(path.map(decodeURIComponent).join("/"));
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(object.body), {
    headers: {
      "Content-Type": object.contentType,
      "Content-Length": String(object.body.length),
      "X-Content-Type-Options": "nosniff",
      // Impede que um SVG enviado pelo admin execute script no domínio do site.
      "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
      // As chaves dos uploads são UUIDs, então o conteúdo de uma URL nunca muda.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
