-- CreateEnum
CREATE TYPE "IncentiveStatusType" AS ENUM ('active', 'closed');

-- CreateTable
CREATE TABLE "Incentive" (
    "id" TEXT NOT NULL,
    "run" TEXT,
    "title" TEXT NOT NULL DEFAULT E'',
    "type" TEXT NOT NULL DEFAULT E'',
    "data" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "status" "IncentiveStatusType" DEFAULT E'active',

    CONSTRAINT "Incentive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Incentive_run_idx" ON "Incentive"("run");

-- AddForeignKey
ALTER TABLE "Incentive" ADD CONSTRAINT "Incentive_run_fkey" FOREIGN KEY ("run") REFERENCES "Run"("id") ON DELETE SET NULL ON UPDATE CASCADE;
