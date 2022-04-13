-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "user" TEXT,
    "event" TEXT,
    "taken" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_user_key" ON "Ticket"("user");

-- CreateIndex
CREATE INDEX "Ticket_event_idx" ON "Ticket"("event");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_event_fkey" FOREIGN KEY ("event") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
