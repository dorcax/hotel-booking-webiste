/*
  Warnings:

  - You are about to drop the column `city` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Property` table. All the data in the column will be lost.
  - Added the required column `email` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rule` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Property" DROP COLUMN "city",
DROP COLUMN "country",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "rule" TEXT NOT NULL;
