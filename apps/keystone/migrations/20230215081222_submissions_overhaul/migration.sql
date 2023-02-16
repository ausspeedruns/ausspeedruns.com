-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "newDonationIncentives" JSONB,
ADD COLUMN     "possibleEstimate" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "techPlatform" TEXT NOT NULL DEFAULT '';
