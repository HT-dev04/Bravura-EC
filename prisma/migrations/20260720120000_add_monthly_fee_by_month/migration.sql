-- AlterTable
ALTER TABLE "FinanceSettings" ADD COLUMN "monthlyFeeByMonth" JSONB NOT NULL DEFAULT '{}';
