import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Garante que a moldura e as fontes sejam empacotadas na função /api/ranking-image
  // (lida do disco em runtime para gerar a arte do ranking).
  outputFileTracingIncludes: {
    "/api/ranking-image": ["./public/fonts/*.ttf", "./public/moldura-ranking2.png", "./public/moldura-ranking3.png"],
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
