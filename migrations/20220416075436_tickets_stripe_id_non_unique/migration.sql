-- DropIndex
DROP INDEX "Ticket_stripeID_key";

-- CreateIndex
CREATE INDEX "Ticket_stripeID_idx" ON "Ticket"("stripeID");
