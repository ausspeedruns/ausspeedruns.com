-- CreateEnum
CREATE TYPE "VolunteerJobTypeType" AS ENUM ('host', 'social', 'runMgmt', 'tech');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "acceptingBackups" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptingVolunteers" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "willingBackup" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Volunteer" (
    "id" TEXT NOT NULL,
    "volunteer" TEXT,
    "jobType" "VolunteerJobTypeType",
    "eventHostTime" INTEGER DEFAULT 0,
    "maxDailyHostTime" INTEGER DEFAULT 0,
    "dayTimes" JSONB,
    "specificGame" TEXT NOT NULL DEFAULT E'',
    "specificRunner" TEXT NOT NULL DEFAULT E'',
    "additionalInfo" TEXT NOT NULL DEFAULT E'',
    "experience" TEXT NOT NULL DEFAULT E'',
    "favMeme" TEXT NOT NULL DEFAULT E'',
    "runnerManagementAvaialbility" TEXT NOT NULL DEFAULT E'',
    "techAvailablity" TEXT NOT NULL DEFAULT E'',
    "techExperience" TEXT NOT NULL DEFAULT E'',
    "event" TEXT,

    CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Volunteer_volunteer_idx" ON "Volunteer"("volunteer");

-- CreateIndex
CREATE INDEX "Volunteer_event_idx" ON "Volunteer"("event");

-- AddForeignKey
ALTER TABLE "Volunteer" ADD CONSTRAINT "Volunteer_volunteer_fkey" FOREIGN KEY ("volunteer") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Volunteer" ADD CONSTRAINT "Volunteer_event_fkey" FOREIGN KEY ("event") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
