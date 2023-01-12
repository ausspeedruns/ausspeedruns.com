/*
  Warnings:

  - You are about to drop the column `runnerManagementAvailbility` on the `Volunteer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Volunteer" DROP COLUMN "runnerManagementAvailbility",
ADD COLUMN     "runnerManagementAvailability" TEXT NOT NULL DEFAULT E'';
