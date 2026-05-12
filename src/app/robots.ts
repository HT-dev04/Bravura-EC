import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/entrar-admin/",
          "/api/",
          "/loja/carrinho",
          "/loja/checkout",
          "/loja/pedido/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
