-- CreateEnum
CREATE TYPE "public"."ContactNoteType" AS ENUM ('NOTE', 'CALL', 'MEETING', 'OTHER');

-- AlterTable
ALTER TABLE "public"."ContactNote" ADD COLUMN     "timestamp" TIMESTAMP(3),
ADD COLUMN     "type" "public"."ContactNoteType" NOT NULL DEFAULT 'NOTE';
