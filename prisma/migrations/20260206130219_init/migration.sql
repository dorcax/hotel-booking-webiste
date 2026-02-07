/*
  Warnings:

  - You are about to drop the column `images` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Transaction` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `expiresAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Upload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Upload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `Upload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Upload` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" ALTER COLUMN "method" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Property" DROP COLUMN "images",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Room" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "method",
ADD COLUMN     "flwRef" TEXT,
ADD COLUMN     "redirectUrl" TEXT,
ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."Upload" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "publicId" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;
