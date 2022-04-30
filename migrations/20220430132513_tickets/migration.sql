-- CreateEnum
CREATE TYPE "TicketMethodType" AS ENUM ('bank', 'stripe');

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "user" TEXT,
    "event" TEXT,
    "taken" BOOLEAN NOT NULL DEFAULT false,
    "method" "TicketMethodType" NOT NULL,
    "ticketID" TEXT NOT NULL DEFAULT E'',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL DEFAULT E'',
    "numberOfTickets" INTEGER,
    "stripeID" TEXT NOT NULL DEFAULT E'',
    "created" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketID_key" ON "Ticket"("ticketID");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_stripeID_key" ON "Ticket"("stripeID");

-- CreateIndex
CREATE INDEX "Ticket_user_idx" ON "Ticket"("user");

-- CreateIndex
CREATE INDEX "Ticket_event_idx" ON "Ticket"("event");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_event_fkey" FOREIGN KEY ("event") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
