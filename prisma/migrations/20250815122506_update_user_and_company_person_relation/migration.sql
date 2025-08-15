/*
  Warnings:

  - The required column `publicKey` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `publicSecret` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "publicKey" TEXT NOT NULL,
ADD COLUMN     "publicSecret" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."CompanyPerson" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "main" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT,
    "personId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "CompanyPerson_pkey" PRIMARY KEY ("personId","companyId")
);

-- AddForeignKey
ALTER TABLE "public"."CompanyPerson" ADD CONSTRAINT "CompanyPerson_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompanyPerson" ADD CONSTRAINT "CompanyPerson_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
