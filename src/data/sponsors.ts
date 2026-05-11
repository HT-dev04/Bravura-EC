import { assetUrl } from "@/lib/asset-url";
import type { Sponsor } from "@/types";

const sponsorRows: Sponsor[] = [
  { id: "s1", name: "Padaria Central", logo: "/sponsors/padaria-central.svg", tier: "Ouro", website: "#" },
  { id: "s2", name: "Auto Peças União", logo: "/sponsors/auto-pecas-uniao.svg", tier: "Ouro", website: "#" },
  { id: "s3", name: "Posto Bandeirantes", logo: "/sponsors/posto-bandeirantes.svg", tier: "Prata", website: "#" },
  { id: "s4", name: "Construtora Bravo", logo: "/sponsors/construtora-bravo.svg", tier: "Prata", website: "#" },
  { id: "s5", name: "Mercado Bairro Alto", logo: "/sponsors/mercado-bairro-alto.svg", tier: "Bronze", website: "#" },
  { id: "s6", name: "Barbearia do Zé", logo: "/sponsors/barbearia-do-ze.svg", tier: "Bronze", website: "#" },
];

export const sponsors: Sponsor[] = sponsorRows.map((sponsor) => ({ ...sponsor, logo: assetUrl(sponsor.logo) }));
