/*
  Warnings:

  - The `dayTimes` column on the `Volunteer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "willingBackup" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN     "favMeme" TEXT NOT NULL DEFAULT E'',
DROP COLUMN "dayTimes",
ADD COLUMN     "dayTimes" JSONB;
