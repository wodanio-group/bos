-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT';
