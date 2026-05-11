import "server-only";

import { gallery } from "@/data/gallery";
import { matches } from "@/data/matches";
import { news } from "@/data/news";
import { orders } from "@/data/orders";
import { players } from "@/data/players";
import { products } from "@/data/products";
import { sponsors } from "@/data/sponsors";
import { getTeamStats } from "@/lib/cms-stats";
import { assetUrl } from "@/lib/asset-url";
import { prisma } from "@/lib/prisma";
import type {
  CmsData,
  ExpenseEntry,
  FinanceData,
  GalleryPhoto,
  Match,
  MonthlyPayment,
  NewsItem,
  Order,
  Player,
  Product,
  RevenueEntry,
  Sponsor,
  SponsorshipEntry,
  TeamStatsSummary,
} from "@/types";
import type { Prisma } from "@/generated/prisma/client";

const defaultFinance: FinanceData = {
  monthlyFeeAmount: 50,
  monthlyPayments: [],
  revenues: [],
  expenses: [],
  sponsorships: [],
};

export function defaultCmsData(): CmsData {
  return {
    players,
    matches,
    news,
    gallery,
    products,
    sponsors,
    orders,
    teamStats: getTeamStats(matches),
    finance: defaultFinance,
  };
}

function json<T>(value: T) {
  return value as Prisma.InputJsonValue;
}

function toPlayer(player: Player) {
  return {
    ...player,
    position: player.position,
    preferredFoot: player.preferredFoot,
    stats: json(player.stats),
    history: json(player.history),
    monthlyGoals: json(player.monthlyGoals),
  };
}

function fromPlayer(player: Awaited<ReturnType<typeof prisma.player.findMany>>[number]): Player {
  return {
    id: player.id,
    slug: player.slug,
    name: player.name,
    nickname: player.nickname,
    number: player.number,
    position: player.position as Player["position"],
    birthDate: player.birthDate,
    height: player.height,
    weight: player.weight,
    preferredFoot: player.preferredFoot as Player["preferredFoot"],
    photo: assetUrl(player.photo),
    bio: player.bio,
    season: player.season,
    stats: player.stats as unknown as Player["stats"],
    history: player.history as unknown as Player["history"],
    monthlyGoals: player.monthlyGoals as unknown as Player["monthlyGoals"],
  };
}

function toMatch(match: Match) {
  return {
    ...match,
    events: json(match.events),
    lineupStart: json(match.lineupStart),
    lineupBench: json(match.lineupBench),
    gallery: json(match.gallery),
  };
}

function fromMatch(match: Awaited<ReturnType<typeof prisma.match.findMany>>[number]): Match {
  return {
    id: match.id,
    opponent: match.opponent,
    opponentLogo: assetUrl(match.opponentLogo),
    date: match.date,
    location: match.location,
    homeAway: match.homeAway as Match["homeAway"],
    competition: match.competition,
    season: match.season,
    status: match.status as Match["status"],
    scoreHome: match.scoreHome,
    scoreAway: match.scoreAway,
    result: match.result as Match["result"],
    events: match.events as unknown as Match["events"],
    lineupStart: match.lineupStart as unknown as Match["lineupStart"],
    lineupBench: match.lineupBench as unknown as Match["lineupBench"],
    highlightPlayerId: match.highlightPlayerId || undefined,
    highlightQuote: match.highlightQuote || undefined,
    gallery: (match.gallery as unknown as Match["gallery"]).map(assetUrl),
  };
}

function fromNews(item: Awaited<ReturnType<typeof prisma.newsItem.findMany>>[number]): NewsItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    category: item.category as NewsItem["category"],
    author: item.author,
    publishedAt: item.publishedAt,
    cover: assetUrl(item.cover),
    content: item.content,
  };
}

function fromGallery(item: Awaited<ReturnType<typeof prisma.galleryPhoto.findMany>>[number]): GalleryPhoto {
  return {
    id: item.id,
    src: assetUrl(item.src),
    mediaType: item.mediaType as GalleryPhoto["mediaType"],
    album: item.album as GalleryPhoto["album"],
    season: item.season,
    caption: item.caption,
  };
}

function toProduct(product: Product) {
  return {
    ...product,
    oldPrice: product.oldPrice ?? null,
    images: json(product.images),
    sizes: json(product.sizes),
  };
}

function fromProduct(product: Awaited<ReturnType<typeof prisma.product.findMany>>[number]): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category as Product["category"],
    price: product.price,
    ...(product.oldPrice === null ? {} : { oldPrice: product.oldPrice }),
    images: (product.images as unknown as Product["images"]).map(assetUrl),
    description: product.description,
    sizes: product.sizes as unknown as Product["sizes"],
    stock: product.stock,
    featured: product.featured,
    isNew: product.isNew,
    bestseller: product.bestseller,
  };
}

function fromSponsor(sponsor: Awaited<ReturnType<typeof prisma.sponsor.findMany>>[number]): Sponsor {
  return {
    id: sponsor.id,
    name: sponsor.name,
    logo: assetUrl(sponsor.logo),
    tier: sponsor.tier as Sponsor["tier"],
    ...(sponsor.website ? { website: sponsor.website } : {}),
  };
}

function toOrder(order: Order) {
  return {
    ...order,
    items: json(order.items),
    customer: json(order.customer),
  };
}

function fromOrder(order: Awaited<ReturnType<typeof prisma.order.findMany>>[number]): Order {
  return {
    id: order.id,
    createdAt: order.createdAt,
    items: (order.items as unknown as Order["items"]).map((item) => ({ ...item, image: assetUrl(item.image) })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    customer: order.customer as unknown as Order["customer"],
    status: order.status as Order["status"],
  };
}

function toTeamStats(stats: TeamStatsSummary) {
  return {
    id: "default",
    games: stats.games,
    wins: stats.wins,
    draws: stats.draws,
    losses: stats.losses,
    goalsFor: stats.goalsFor,
    goalsAgainst: stats.goalsAgainst,
    winRate: stats.winRate,
    cleanSheets: stats.cleanSheets,
    goalsByMonth: json(stats.goalsByMonth),
    winRateByCompetition: json(stats.winRateByCompetition),
  };
}

function fromTeamStats(stats: Awaited<ReturnType<typeof prisma.teamStats.findUnique>>): TeamStatsSummary {
  if (!stats) return defaultCmsData().teamStats;
  return {
    games: stats.games,
    wins: stats.wins,
    draws: stats.draws,
    losses: stats.losses,
    goalsFor: stats.goalsFor,
    goalsAgainst: stats.goalsAgainst,
    winRate: stats.winRate,
    cleanSheets: stats.cleanSheets,
    goalsByMonth: stats.goalsByMonth as unknown as TeamStatsSummary["goalsByMonth"],
    winRateByCompetition: stats.winRateByCompetition as unknown as TeamStatsSummary["winRateByCompetition"],
  };
}

function numberOrZero(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function sanitizeFinance(finance: FinanceData): FinanceData {
  const monthlyPayments = new Map<string, FinanceData["monthlyPayments"][number]>();
  for (const item of finance.monthlyPayments || []) {
    if (!item.playerId || !item.month || !item.status) continue;
    monthlyPayments.set(`${item.playerId}:${item.month}`, {
      playerId: item.playerId,
      month: item.month,
      status: item.status,
      ...(item.paidAt ? { paidAt: item.paidAt } : {}),
    });
  }

  const revenues = new Map<string, RevenueEntry>();
  for (const item of finance.revenues || []) {
    if (!item.id || !item.date || !item.description) continue;
    revenues.set(item.id, { id: item.id, date: item.date, description: item.description, value: numberOrZero(item.value) });
  }

  const expenses = new Map<string, ExpenseEntry>();
  for (const item of finance.expenses || []) {
    if (!item.id || !item.date || !item.description) continue;
    expenses.set(item.id, { id: item.id, date: item.date, description: item.description, value: numberOrZero(item.value) });
  }

  const sponsorships = new Map<string, SponsorshipEntry>();
  for (const item of finance.sponsorships || []) {
    if (!item.id || !item.date || !item.name || !item.purpose) continue;
    sponsorships.set(item.id, {
      id: item.id,
      date: item.date,
      name: item.name,
      photo: item.photo || assetUrl("/sponsors/placeholder.svg"),
      purpose: item.purpose,
      value: numberOrZero(item.value),
    });
  }

  return {
    monthlyFeeAmount: numberOrZero(finance.monthlyFeeAmount),
    monthlyPayments: Array.from(monthlyPayments.values()),
    revenues: Array.from(revenues.values()),
    expenses: Array.from(expenses.values()),
    sponsorships: Array.from(sponsorships.values()),
  };
}

function sanitizeGallery(items: GalleryPhoto[]) {
  const galleryRows = new Map<string, GalleryPhoto>();

  for (const item of items || []) {
    if (!item.id || !item.src || !item.album || !item.season) continue;
    galleryRows.set(item.id, {
      id: item.id,
      src: item.src,
      ...(item.mediaType ? { mediaType: item.mediaType } : {}),
      album: item.album,
      season: item.season,
      caption: item.caption || "",
    });
  }

  return Array.from(galleryRows.values());
}

function assertPrismaDelegate(delegate: keyof typeof prisma, modelName: string, methods: string[]) {
  const model = prisma[delegate] as Record<string, unknown> | undefined;

  if (!model) {
    console.error(`Delegate Prisma ausente no getCmsData: ${modelName}`, { delegate });
    throw new Error(`Delegate Prisma ausente: prisma.${String(delegate)}`);
  }

  for (const method of methods) {
    if (typeof model[method] !== "function") {
      console.error(`Método Prisma ausente no getCmsData: ${modelName}.${method}`, { delegate });
      throw new Error(`Método Prisma ausente: prisma.${String(delegate)}.${method}`);
    }
  }
}

function assertCmsPrismaDelegates() {
  assertPrismaDelegate("cmsMetadata", "CmsMetadata", ["findUnique", "upsert"]);
  assertPrismaDelegate("player", "Player", ["findMany", "deleteMany", "createMany"]);
  assertPrismaDelegate("match", "Match", ["findMany", "deleteMany", "createMany"]);
  assertPrismaDelegate("newsItem", "NewsItem", ["findMany", "deleteMany", "createMany"]);
  assertPrismaDelegate("galleryPhoto", "GalleryPhoto", ["findMany", "deleteMany", "createMany"]);
  assertPrismaDelegate("product", "Product", ["findMany", "deleteMany", "createMany"]);
  assertPrismaDelegate("sponsor", "Sponsor", ["findMany", "deleteMany", "createMany"]);
  assertPrismaDelegate("order", "Order", ["findMany", "deleteMany", "createMany"]);
  assertPrismaDelegate("teamStats", "TeamStats", ["findUnique", "upsert"]);
  assertPrismaDelegate("financeSettings", "FinanceSettings", ["findUnique", "upsert"]);
  assertPrismaDelegate("monthlyPayment", "MonthlyPayment", ["findMany", "deleteMany", "createMany"]);
  assertPrismaDelegate("revenueEntry", "RevenueEntry", ["findMany", "deleteMany", "createMany"]);
  assertPrismaDelegate("expenseEntry", "ExpenseEntry", ["findMany", "deleteMany", "createMany"]);
  assertPrismaDelegate("sponsorshipEntry", "SponsorshipEntry", ["findMany", "deleteMany", "createMany"]);
}

export async function getCmsData(): Promise<CmsData> {
  assertCmsPrismaDelegates();

  const [
    playerRows,
    matchRows,
    newsRows,
    galleryRows,
    productRows,
    sponsorRows,
    orderRows,
    teamStats,
    financeSettings,
    monthlyPayments,
    revenues,
    expenses,
    sponsorships,
  ] = await prisma.$transaction([
    prisma.player.findMany({ orderBy: { number: "asc" } }),
    prisma.match.findMany({ orderBy: { date: "desc" } }),
    prisma.newsItem.findMany({ orderBy: { publishedAt: "desc" } }),
    prisma.galleryPhoto.findMany({ orderBy: { id: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.sponsor.findMany({ orderBy: { name: "asc" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.teamStats.findUnique({ where: { id: "default" } }),
    prisma.financeSettings.findUnique({ where: { id: "default" } }),
    prisma.monthlyPayment.findMany({ orderBy: [{ month: "desc" }, { playerId: "asc" }] }),
    prisma.revenueEntry.findMany({ orderBy: { date: "desc" } }),
    prisma.expenseEntry.findMany({ orderBy: { date: "desc" } }),
    prisma.sponsorshipEntry.findMany({ orderBy: { date: "desc" } }),
  ]);

  return {
    players: playerRows.map(fromPlayer),
    matches: matchRows.map(fromMatch),
    news: newsRows.map(fromNews),
    gallery: galleryRows.map(fromGallery),
    products: productRows.map(fromProduct),
    sponsors: sponsorRows.map(fromSponsor),
    orders: orderRows.map(fromOrder),
    teamStats: fromTeamStats(teamStats),
    finance: {
      monthlyFeeAmount: financeSettings?.monthlyFeeAmount ?? defaultFinance.monthlyFeeAmount,
      monthlyPayments: monthlyPayments as MonthlyPayment[],
      revenues: revenues as RevenueEntry[],
      expenses: expenses as ExpenseEntry[],
      sponsorships: sponsorships as SponsorshipEntry[],
    },
  };
}

async function replaceCollection(collection: keyof CmsData, rows: CmsData[keyof CmsData]) {
  switch (collection) {
    case "players":
      await prisma.$transaction(
        async (tx) => {
          const playerRows = (rows as Player[]).map(toPlayer);
          const before = await tx.player.findMany({ select: { id: true } });
          console.info("Persistindo jogadores", {
            beforeIds: before.map((player) => player.id),
            nextIds: playerRows.map((player) => player.id),
            beforeCount: before.length,
            nextCount: playerRows.length,
          });

          await tx.player.deleteMany();
          if (playerRows.length) await tx.player.createMany({ data: playerRows });

          const after = await tx.player.findMany({ select: { id: true } });
          console.info("Jogadores persistidos", {
            afterIds: after.map((player) => player.id),
            afterCount: after.length,
          });
        },
        { maxWait: 10000, timeout: 30000 }
      );
      break;
    case "matches":
      await prisma.$transaction(
        async (tx) => {
          const matchRows = (rows as Match[]).map(toMatch);
          await tx.match.deleteMany();
          if (matchRows.length) await tx.match.createMany({ data: matchRows });
        },
        { maxWait: 10000, timeout: 30000 }
      );
      break;
    case "news":
      await prisma.$transaction(
        async (tx) => {
          const newsRows = rows as NewsItem[];
          await tx.newsItem.deleteMany();
          if (newsRows.length) await tx.newsItem.createMany({ data: newsRows });
        },
        { maxWait: 10000, timeout: 30000 }
      );
      break;
    case "gallery":
      await prisma.$transaction(
        async (tx) => {
          const galleryRows = sanitizeGallery(rows as GalleryPhoto[]);
          await tx.galleryPhoto.deleteMany();
          if (galleryRows.length) await tx.galleryPhoto.createMany({ data: galleryRows });
        },
        { maxWait: 10000, timeout: 30000 }
      );
      break;
    case "products":
      await prisma.$transaction(async (tx) => {
        const productRows = (rows as Product[]).map(toProduct);
        await tx.product.deleteMany();
        if (productRows.length) await tx.product.createMany({ data: productRows });
      });
      break;
    case "sponsors":
      await prisma.$transaction(
        async (tx) => {
          const sponsorRows = rows as Sponsor[];
          await tx.sponsor.deleteMany();
          if (sponsorRows.length) await tx.sponsor.createMany({ data: sponsorRows });
        },
        { maxWait: 10000, timeout: 30000 }
      );
      break;
    case "orders":
      await prisma.$transaction(
        async (tx) => {
          const orderRows = (rows as Order[]).map(toOrder);
          await tx.order.deleteMany();
          if (orderRows.length) await tx.order.createMany({ data: orderRows });
        },
        { maxWait: 10000, timeout: 30000 }
      );
      break;
    case "teamStats":
      await prisma.teamStats.upsert({ where: { id: "default" }, update: toTeamStats(rows as TeamStatsSummary), create: toTeamStats(rows as TeamStatsSummary) });
      break;
    case "finance": {
      const finance = sanitizeFinance(rows as FinanceData);
      await prisma.$transaction(
        async (tx) => {
          await tx.financeSettings.upsert({
            where: { id: "default" },
            update: { monthlyFeeAmount: finance.monthlyFeeAmount },
            create: { id: "default", monthlyFeeAmount: finance.monthlyFeeAmount },
          });

          await tx.monthlyPayment.deleteMany();
          if (finance.monthlyPayments.length) await tx.monthlyPayment.createMany({ data: finance.monthlyPayments });

          await tx.revenueEntry.deleteMany();
          if (finance.revenues.length) await tx.revenueEntry.createMany({ data: finance.revenues });

          await tx.expenseEntry.deleteMany();
          if (finance.expenses.length) await tx.expenseEntry.createMany({ data: finance.expenses });

          await tx.sponsorshipEntry.deleteMany();
          if (finance.sponsorships.length) await tx.sponsorshipEntry.createMany({ data: finance.sponsorships });
        },
        { maxWait: 10000, timeout: 30000 }
      );
      break;
    }
  }
}

export async function updateCmsCollection<K extends keyof CmsData>(collection: K, rows: CmsData[K]) {
  assertCmsPrismaDelegates();
  await replaceCollection(collection, rows);
  const data = await getCmsData();

  if (collection === "players") {
    const playerRows = rows as Player[];
    console.info("Coleção de jogadores salva", {
      requestedIds: playerRows.map((player) => player.id),
      savedIds: data.players.map((player) => player.id),
      requestedCount: playerRows.length,
      savedCount: data.players.length,
    });
  }

  return data;
}
