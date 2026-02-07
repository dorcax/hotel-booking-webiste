/*
  Warnings:

  - You are about to drop the column `rule` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `attachmentId` on the `Upload` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ruleId]` on the table `Property` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Property" DROP CONSTRAINT "Property_attachmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Upload" DROP CONSTRAINT "Upload_attachmentId_fkey";

-- AlterTable
ALTER TABLE "public"."Property" DROP COLUMN "rule",
ADD COLUMN     "ruleId" TEXT,
ALTER COLUMN "attachmentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Upload" DROP COLUMN "attachmentId",
ADD COLUMN     "attachmentsId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Property_ruleId_key" ON "public"."Property"("ruleId");

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "public"."Attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Upload" ADD CONSTRAINT "Upload_attachmentsId_fkey" FOREIGN KEY ("attachmentsId") REFERENCES "public"."Attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
