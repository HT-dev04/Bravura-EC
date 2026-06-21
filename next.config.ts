import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl
  ? new URL(supabaseUrl).hostname
  : "vvxbbfmwhrnoagbryefj.supabase.co";

const nextConfig: NextConfig = {
  // Garante que a moldura e as fontes sejam empacotadas na função /api/ranking-image
  // (lida do disco em runtime para gerar a arte do ranking).
  outputFileTracingIncludes: {
    "/api/ranking-image": ["./public/fonts/*.ttf", "./public/moldura-ranking2.png", "./public/moldura-ranking3.png"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
