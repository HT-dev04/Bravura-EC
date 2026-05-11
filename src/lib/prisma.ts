import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL || "" });

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

export const prisma: PrismaClient = hasRequiredDelegates(globalForPrisma.prisma) ? globalForPrisma.prisma : new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
