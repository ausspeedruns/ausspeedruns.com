/*
  Warnings:

  - You are about to drop the column `status` on the `Incentive` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Incentive" DROP COLUMN "status",
ADD COLUMN     "event" TEXT;

-- DropEnum
DROP TYPE "IncentiveStatusType";

-- CreateIndex
CREATE INDEX "Incentive_event_idx" ON "Incentive"("event");

-- AddForeignKey
ALTER TABLE "Incentive" ADD CONSTRAINT "Incentive_event_fkey" FOREIGN KEY ("event") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
