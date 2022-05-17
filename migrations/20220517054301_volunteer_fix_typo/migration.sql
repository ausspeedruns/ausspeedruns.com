/*
  Warnings:

  - You are about to drop the column `runnerManagementAvaialbility` on the `Volunteer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Volunteer" DROP COLUMN "runnerManagementAvaialbility",
ADD COLUMN     "runnerManagementAvailbility" TEXT NOT NULL DEFAULT E'';
