-- AlterTable
ALTER TABLE "Championship" ADD COLUMN "teams" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN "groups" JSONB NOT NULL DEFAULT '[]';
