-- AlterTable
ALTER TABLE "CompanyPerson" ADD COLUMN     "department" TEXT;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "personId" TEXT;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
