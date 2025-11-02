/*
  Warnings:

  - You are about to drop the column `number` on the `Room` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roomNumber]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacity` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `floor` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomNumber` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Hotel" ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Room" DROP COLUMN "number",
ADD COLUMN     "amenities" TEXT[],
ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "floor" INTEGER NOT NULL,
ADD COLUMN     "roomNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Room_roomNumber_key" ON "public"."Room"("roomNumber");
