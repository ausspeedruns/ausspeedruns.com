/*
  Warnings:

  - You are about to drop the `Social` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Social" DROP CONSTRAINT "Social_user_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "discord" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "twitch" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "twitter" TEXT NOT NULL DEFAULT E'';

-- DropTable
DROP TABLE "Social";
