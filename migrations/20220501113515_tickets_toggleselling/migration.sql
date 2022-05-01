-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "acceptingTickets" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduleReleased" BOOLEAN NOT NULL DEFAULT false;
