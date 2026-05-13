import "server-only";

import { connection } from "next/server";
import { assetUrl } from "@/lib/asset-url";
import { withDatabaseRetry } from "@/lib/database-retry";
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

const CMS_READ_LIMITS = {
  news: 100,
  gallery: 500,
  products: 200,
  orders: 200,
  monthlyPayments: 1000,
  revenues: 500,
  expenses: 500,
  sponsorships: 500,
};

const emptyTeamStats: TeamStatsSummary = {
  games: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  winRate: 0,
  cleanSheets: 0,
  goalsByMonth: [],
  winRateByCompetition: [],
};

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
    id: match.id,
    opponent: match.opponent,
    opponentLogo: match.opponentLogo,
    date: match.date,
    location: match.location,
    homeAway: match.homeAway,
    competition: match.competition,
    season: match.season,
    status: match.status,
    scoreHome: match.scoreHome,
    scoreAway: match.scoreAway,
    result: match.result,
    highlightPlayerId: match.highlightPlayerId || null,
    highlightPhoto: match.highlightPhoto || null,
    highlightQuote: match.highlightQuote || null,
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
    highlightPhoto: assetUrl((match as typeof match & { highlightPhoto?: string | null }).highlightPhoto || "") || undefined,
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
  if (!stats) return emptyTeamStats;
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
      photo: item.photo || "",
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

function withoutId<T extends { id: string }>(row: T) {
  const { id: _id, ...data } = row;
  void _id;
  return data;
}

function rowIds(rows: Array<{ id: string }>) {
  return rows.map((row) => row.id).filter(Boolean);
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
  assertPrismaDelegate("player", "Player", ["findMany", "deleteMany", "upsert"]);
  assertPrismaDelegate("match", "Match", ["findMany", "deleteMany", "upsert"]);
  assertPrismaDelegate("newsItem", "NewsItem", ["findMany", "deleteMany", "upsert"]);
  assertPrismaDelegate("galleryPhoto", "GalleryPhoto", ["findMany", "deleteMany", "upsert"]);
  assertPrismaDelegate("product", "Product", ["findMany", "deleteMany", "upsert"]);
  assertPrismaDelegate("sponsor", "Sponsor", ["findMany", "deleteMany", "upsert"]);
  assertPrismaDelegate("order", "Order", ["findMany", "deleteMany", "upsert"]);
  assertPrismaDelegate("teamStats", "TeamStats", ["findUnique", "upsert"]);
  assertPrismaDelegate("financeSettings", "FinanceSettings", ["findUnique", "upsert"]);
  assertPrismaDelegate("monthlyPayment", "MonthlyPayment", ["findMany", "deleteMany", "upsert"]);
  assertPrismaDelegate("revenueEntry", "RevenueEntry", ["findMany", "deleteMany", "upsert"]);
  assertPrismaDelegate("expenseEntry", "ExpenseEntry", ["findMany", "deleteMany", "upsert"]);
  assertPrismaDelegate("sponsorshipEntry", "SponsorshipEntry", ["findMany", "deleteMany", "upsert"]);
}

export async function getCmsData(): Promise<CmsData> {
  await connection();
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
  ] = await withDatabaseRetry(async () =>
    Promise.all([
      prisma.player.findMany({ orderBy: { number: "asc" } }),
      prisma.match.findMany({ orderBy: { date: "desc" } }),
      prisma.newsItem.findMany({ orderBy: { publishedAt: "desc" }, take: CMS_READ_LIMITS.news }),
      prisma.galleryPhoto.findMany({ orderBy: { id: "asc" }, take: CMS_READ_LIMITS.gallery }),
      prisma.product.findMany({ orderBy: { name: "asc" }, take: CMS_READ_LIMITS.products }),
      prisma.sponsor.findMany({ orderBy: { name: "asc" } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: CMS_READ_LIMITS.orders }),
      prisma.teamStats.findUnique({ where: { id: "default" } }),
      prisma.financeSettings.findUnique({ where: { id: "default" } }),
      prisma.monthlyPayment.findMany({
        orderBy: [{ month: "desc" }, { playerId: "asc" }],
        take: CMS_READ_LIMITS.monthlyPayments,
        select: { playerId: true, month: true, status: true, paidAt: true },
      }),
      prisma.revenueEntry.findMany({
        orderBy: { date: "desc" },
        take: CMS_READ_LIMITS.revenues,
        select: { id: true, date: true, description: true, value: true },
      }),
      prisma.expenseEntry.findMany({
        orderBy: { date: "desc" },
        take: CMS_READ_LIMITS.expenses,
        select: { id: true, date: true, description: true, value: true },
      }),
      prisma.sponsorshipEntry.findMany({
        orderBy: { date: "desc" },
        take: CMS_READ_LIMITS.sponsorships,
        select: { id: true, date: true, name: true, photo: true, purpose: true, value: true },
      }),
    ])
  );

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
          await tx.player.deleteMany({ where: { id: { notIn: rowIds(playerRows) } } });
          for (const player of playerRows) {
            await tx.player.upsert({ where: { id: player.id }, update: withoutId(player), create: player });
          }
        },
        { maxWait: 10000, timeout: 30000 }
      );
      break;
    case "matches":
      await prisma.$transaction(
        async (tx) => {
          const matchRows = (rows as Match[]).map(toMatch);
          await tx.match.deleteMany({ where: { id: { notIn: rowIds(matchRows) } } });
          for (const match of matchRows) {
            await tx.match.upsert({ where: { id: match.id }, update: withoutId(match), create: match });
          }
        },
        { maxWait: 10000, timeout: 30000 }
      );
      break;
    case "news":
      await prisma.$transaction(
        async (tx) => {
          const newsRows = rows as NewsItem[];
          await tx.newsItem.deleteMany({ where: { id: { notIn: rowIds(newsRows) } } });
          for (const item of newsRows) {
            await tx.newsItem.upsert({ where: { id: item.id }, update: withoutId(item), create: item });
          }
        },
        { maxWait: 10000, timeout: 30000 }
      );
      break;
    case "gallery":
      await prisma.$transaction(
        async (tx) => {
          const galleryRows = sanitizeGallery(rows as GalleryPhoto[]);
          await tx.galleryPhoto.deleteMany({ where: { id: { notIn: rowIds(galleryRows) } } });
          for (const item of galleryRows) {
            await tx.galleryPhoto.upsert({ where: { id: item.id }, update: withoutId(item), create: item });
          }
        },
        { maxWait: 10000, timeout: 30000 }
      );
      break;
    case "products":
      await prisma.$transaction(async (tx) => {
        const productRows = (rows as Product[]).map(toProduct);
        await tx.product.deleteMany({ where: { id: { notIn: rowIds(productRows) } } });
        for (const product of productRows) {
          await tx.product.upsert({ where: { id: product.id }, update: withoutId(product), create: product });
        }
      });
      break;
    case "sponsors":
      await prisma.$transaction(
        async (tx) => {
          const sponsorRows = rows as Sponsor[];
          await tx.sponsor.deleteMany({ where: { id: { notIn: rowIds(sponsorRows) } } });
          for (const sponsor of sponsorRows) {
            await tx.sponsor.upsert({ where: { id: sponsor.id }, update: withoutId(sponsor), create: sponsor });
          }
        },
        { maxWait: 10000, timeout: 30000 }
      );
      break;
    case "orders":
      await prisma.$transaction(
        async (tx) => {
          const orderRows = (rows as Order[]).map(toOrder);
          await tx.order.deleteMany({ where: { id: { notIn: rowIds(orderRows) } } });
          for (const order of orderRows) {
            await tx.order.upsert({ where: { id: order.id }, update: withoutId(order), create: order });
          }
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

          await tx.monthlyPayment.deleteMany({
            where: finance.monthlyPayments.length
              ? { NOT: { OR: finance.monthlyPayments.map((item) => ({ playerId: item.playerId, month: item.month })) } }
              : undefined,
          });
          for (const payment of finance.monthlyPayments) {
            await tx.monthlyPayment.upsert({
              where: { playerId_month: { playerId: payment.playerId, month: payment.month } },
              update: { status: payment.status, paidAt: payment.paidAt ?? null },
              create: payment,
            });
          }

          await tx.revenueEntry.deleteMany({ where: { id: { notIn: rowIds(finance.revenues) } } });
          for (const revenue of finance.revenues) {
            await tx.revenueEntry.upsert({ where: { id: revenue.id }, update: withoutId(revenue), create: revenue });
          }

          await tx.expenseEntry.deleteMany({ where: { id: { notIn: rowIds(finance.expenses) } } });
          for (const expense of finance.expenses) {
            await tx.expenseEntry.upsert({ where: { id: expense.id }, update: withoutId(expense), create: expense });
          }

          await tx.sponsorshipEntry.deleteMany({ where: { id: { notIn: rowIds(finance.sponsorships) } } });
          for (const sponsorship of finance.sponsorships) {
            await tx.sponsorshipEntry.upsert({ where: { id: sponsorship.id }, update: withoutId(sponsorship), create: sponsorship });
          }
        },
        { maxWait: 10000, timeout: 30000 }
      );
      break;
    }
  }
}

export async function updateCmsCollection<K extends keyof CmsData>(collection: K, rows: CmsData[K]) {
  assertCmsPrismaDelegates();
  await withDatabaseRetry(() => replaceCollection(collection, rows));
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
