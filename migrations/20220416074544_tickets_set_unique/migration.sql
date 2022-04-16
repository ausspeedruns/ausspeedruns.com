/*
  Warnings:

  - A unique constraint covering the columns `[ticketID]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeID]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketID_key" ON "Ticket"("ticketID");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_stripeID_key" ON "Ticket"("stripeID");
