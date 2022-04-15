-- DropIndex
DROP INDEX "Ticket_user_key";

-- CreateIndex
CREATE INDEX "Ticket_user_idx" ON "Ticket"("user");
