/*
  Warnings:

  - The `submissionInstructions` column on the `Event` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "postEventPage" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
DROP COLUMN "submissionInstructions",
ADD COLUMN     "submissionInstructions" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]';
