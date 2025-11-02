-- DropForeignKey
ALTER TABLE "public"."Hotel" DROP CONSTRAINT "Hotel_attachmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Hotel" DROP CONSTRAINT "Hotel_ruleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Room" DROP CONSTRAINT "Room_attachmentId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Hotel" ADD CONSTRAINT "Hotel_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "public"."Attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Hotel" ADD CONSTRAINT "Hotel_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "public"."Attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
