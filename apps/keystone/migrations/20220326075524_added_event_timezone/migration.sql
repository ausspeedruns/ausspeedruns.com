-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventTimezone" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "sentVerification" SET DEFAULT CURRENT_TIMESTAMP;
