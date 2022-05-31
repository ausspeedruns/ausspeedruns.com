-- CreateEnum
CREATE TYPE "ShirtOrderMethodType" AS ENUM ('bank', 'stripe');

-- CreateEnum
CREATE TYPE "ShirtOrderSizeType" AS ENUM ('xs', 's', 'm', 'l', 'xl', 'xl2', 'xl3');

-- CreateEnum
CREATE TYPE "ShirtOrderColourType" AS ENUM ('blue', 'purple');

-- CreateTable
CREATE TABLE "ShirtOrder" (
    "id" TEXT NOT NULL,
    "user" TEXT,
    "taken" BOOLEAN NOT NULL DEFAULT false,
    "method" "ShirtOrderMethodType" NOT NULL,
    "shirtID" TEXT NOT NULL DEFAULT E'',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL DEFAULT E'',
    "size" "ShirtOrderSizeType" NOT NULL,
    "colour" "ShirtOrderColourType" NOT NULL,
    "stripeID" TEXT NOT NULL DEFAULT E'',
    "created" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShirtOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShirtOrder_shirtID_key" ON "ShirtOrder"("shirtID");

-- CreateIndex
CREATE UNIQUE INDEX "ShirtOrder_stripeID_key" ON "ShirtOrder"("stripeID");

-- CreateIndex
CREATE INDEX "ShirtOrder_user_idx" ON "ShirtOrder"("user");

-- AddForeignKey
ALTER TABLE "ShirtOrder" ADD CONSTRAINT "ShirtOrder_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
