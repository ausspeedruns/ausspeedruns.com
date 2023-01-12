/*
  Warnings:

  - The values [tech,runner_management] on the enum `PostRoleType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `canReadRunnerInfo` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canReadRunnerMgmt` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canReadTech` on the `Role` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PostRoleType_new" AS ENUM ('public', 'runner', 'staff');
ALTER TABLE "Post" ALTER COLUMN "role" TYPE "PostRoleType_new" USING ("role"::text::"PostRoleType_new");
ALTER TYPE "PostRoleType" RENAME TO "PostRoleType_old";
ALTER TYPE "PostRoleType_new" RENAME TO "PostRoleType";
DROP TYPE "PostRoleType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "event" TEXT;

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "canReadRunnerInfo",
DROP COLUMN "canReadRunnerMgmt",
DROP COLUMN "canReadTech",
ADD COLUMN     "runner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "volunteer" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Post_event_idx" ON "Post"("event");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_event_fkey" FOREIGN KEY ("event") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
