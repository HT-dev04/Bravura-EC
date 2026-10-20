import type { NextConfig } from "next";

// Arquivos de public/ que quase nunca mudam: o navegador guarda por 7 dias e ainda usa a cópia
// por mais 30 enquanto revalida. O otimizador de imagens herda esse tempo.
const STATIC_ASSET_CACHE = "public, max-age=604800, stale-while-revalidate=2592000";

const nextConfig: NextConfig = {
  // Garante que a moldura e as fontes sejam empacotadas na função /api/ranking-image
  // (lida do disco em runtime para gerar a arte do ranking).
  outputFileTracingIncludes: {
    "/api/ranking-image": ["./public/fonts/*.ttf", "./public/moldura-ranking2.png", "./public/moldura-ranking3.png", "./public/bravura-escudo.png"],
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 604800,
  },
  async headers() {
    return [
      "/escudos/:path*",
      "/capas/:path*",
      "/products/:path*",
      "/logo/:path*",
      "/fonts/:path*",
      "/bravura-logo.png",
      "/bravura-logo.svg",
      "/bravura-icon-192.png",
      "/apple-touch-icon.png",
      "/bravura-og.svg",
      "/avontz-logo.svg",
      "/avontz-logo-dark.svg",
      "/favicon.ico",
    ].map((source) => ({ source, headers: [{ key: "Cache-Control", value: STATIC_ASSET_CACHE }] }));
  },
};

export default nextConfig;
