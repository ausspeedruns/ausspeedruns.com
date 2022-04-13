/*
  Warnings:

  - Added the required column `method` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TicketMethodType" AS ENUM ('bank', 'stripe');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "method" "TicketMethodType" NOT NULL,
ADD COLUMN     "numberOfTickets" INTEGER,
ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ticketID" TEXT NOT NULL DEFAULT E'';
