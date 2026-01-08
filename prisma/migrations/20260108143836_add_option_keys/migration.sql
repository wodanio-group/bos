-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OptionKey" ADD VALUE 'QUOTE_DEFAULT_TITLE';
ALTER TYPE "OptionKey" ADD VALUE 'QUOTE_DEFAULT_INTRO_TEXT';
ALTER TYPE "OptionKey" ADD VALUE 'QUOTE_DEFAULT_OUTRO_TEXT';
ALTER TYPE "OptionKey" ADD VALUE 'SYSTEM_UNITS';
ALTER TYPE "OptionKey" ADD VALUE 'SYSTEM_TAX_RATES';
