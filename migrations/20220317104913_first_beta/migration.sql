-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "submissionInstructions" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "availability_json" JSONB,
ADD COLUMN     "specialReqs" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetIssuedAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetRedeemedAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT;
