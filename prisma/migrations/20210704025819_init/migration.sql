/*
  Warnings:

  - A unique constraint covering the columns `[mudaeMessageId,userId]` on the table `Claim` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `claimedAt` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Made the column `messageClaimId` on table `Claim` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Claim` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "claimedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "messageClaimId" SET NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "MessageClaim" ALTER COLUMN "messageId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "claimPerMessageConstraint" ON "Claim"("mudaeMessageId", "userId");
