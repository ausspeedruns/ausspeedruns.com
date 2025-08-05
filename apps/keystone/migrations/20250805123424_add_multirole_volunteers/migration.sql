-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN     "roles" JSONB NOT NULL DEFAULT '[]';
