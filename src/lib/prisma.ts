import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || "";

if (!databaseUrl) {
  throw new Error("DATABASE_URL não configurada. Defina DATABASE_URL no ambiente do servidor.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });

const requiredDelegates = [
  "cmsMetadata",
  "player",
  "match",
  "newsItem",
  "galleryPhoto",
  "product",
  "sponsor",
  "order",
  "teamStats",
  "financeSettings",
  "monthlyPayment",
  "revenueEntry",
  "expenseEntry",
  "sponsorshipEntry",
] as const;

function hasRequiredDelegates(client: PrismaClient | undefined): client is PrismaClient {
  return requiredDelegates.every((delegate) => Boolean(client?.[delegate]));
}

export const prisma: PrismaClient = hasRequiredDelegates(globalForPrisma.prisma)
  ? globalForPrisma.prisma
  : new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
