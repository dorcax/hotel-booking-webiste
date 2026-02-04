/*
  Warnings:

  - The values [CUSTOMER,HOTELOWNER,SUPERADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `hotelId` on the `AuthOtpToken` table. All the data in the column will be lost.
  - You are about to drop the column `floor` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `hotelId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `roomNumber` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `flwRef` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `redirectUrl` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `reservationId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `transactionStatus` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `txRef` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Upload` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Upload` table. All the data in the column will be lost.
  - You are about to drop the column `publicId` on the `Upload` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Upload` table. All the data in the column will be lost.
  - You are about to drop the `Hotel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reservation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AttachmentsToUpload` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[attachmentId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `propertyId` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `method` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `amount` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."PropertyType" AS ENUM ('APARTMENT', 'HOTEL');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CARD', 'WALLET', 'BANK_TRANSFER', 'PAYPAL');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('GUEST', 'HOST', 'ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'GUEST';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."AuthOtpToken" DROP CONSTRAINT "AuthOtpToken_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Hotel" DROP CONSTRAINT "Hotel_attachmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Hotel" DROP CONSTRAINT "Hotel_ruleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Hotel" DROP CONSTRAINT "Hotel_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reservation" DROP CONSTRAINT "Reservation_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reservation" DROP CONSTRAINT "Reservation_roomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reservation" DROP CONSTRAINT "Reservation_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Room" DROP CONSTRAINT "Room_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_reservationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_roomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Upload" DROP CONSTRAINT "Upload_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AttachmentsToUpload" DROP CONSTRAINT "_AttachmentsToUpload_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AttachmentsToUpload" DROP CONSTRAINT "_AttachmentsToUpload_B_fkey";

-- DropIndex
DROP INDEX "public"."Room_roomNumber_key";

-- AlterTable
ALTER TABLE "public"."AuthOtpToken" DROP COLUMN "hotelId";

-- AlterTable
ALTER TABLE "public"."Room" DROP COLUMN "floor",
DROP COLUMN "hotelId",
DROP COLUMN "isAvailable",
DROP COLUMN "roomNumber",
ADD COLUMN     "propertyId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "flwRef",
DROP COLUMN "redirectUrl",
DROP COLUMN "reservationId",
DROP COLUMN "transactionStatus",
DROP COLUMN "txRef",
ADD COLUMN     "bookingId" TEXT,
ADD COLUMN     "method" "public"."PaymentMethod" NOT NULL,
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "response" TEXT,
ADD COLUMN     "status" "public"."TransactionStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "amount",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'USD',
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "roomId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Upload" DROP COLUMN "name",
DROP COLUMN "order",
DROP COLUMN "publicId",
DROP COLUMN "size",
ADD COLUMN     "attachmentId" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'GUEST',
ALTER COLUMN "phoneNumber" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "public"."Hotel";

-- DropTable
DROP TABLE "public"."Reservation";

-- DropTable
DROP TABLE "public"."_AttachmentsToUpload";

-- CreateTable
CREATE TABLE "public"."Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "type" "public"."PropertyType" NOT NULL DEFAULT 'APARTMENT',
    "amenities" TEXT[],
    "images" TEXT[],
    "price" DOUBLE PRECISION,
    "capacity" INTEGER,
    "hostId" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "fullText" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "guestId" TEXT NOT NULL,
    "propertyId" TEXT,
    "roomId" TEXT,
    "fullText" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "public"."PaymentMethod" NOT NULL,
    "transactionId" TEXT,
    "guestId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_attachmentId_key" ON "public"."Room"("attachmentId");

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "public"."Attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Upload" ADD CONSTRAINT "Upload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Upload" ADD CONSTRAINT "Upload_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "public"."Attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
