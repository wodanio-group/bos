/*
  Warnings:

  - You are about to drop the column `externalId` on the `User` table. All the data in the column will be lost.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."User_externalId_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "externalId",
ADD COLUMN     "email" TEXT NOT NULL;
