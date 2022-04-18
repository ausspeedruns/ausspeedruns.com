/*
  Warnings:

  - A unique constraint covering the columns `[stripeID]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Ticket_stripeID_idx";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "created" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_stripeID_key" ON "Ticket"("stripeID");
