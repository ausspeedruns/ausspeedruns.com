/*
  Warnings:

  - You are about to drop the column `postEventPage` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "postEventPage",
ADD COLUMN     "eventPage" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;
