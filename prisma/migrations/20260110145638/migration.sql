/*
  Warnings:

  - The values [QUOTE_DEFAULT_TITLE] on the enum `OptionKey` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OptionKey_new" AS ENUM ('CUSTOMER_ID_COUNTER', 'CUSTOMER_ID_SCHEMA', 'QUOTE_ID_COUNTER', 'QUOTE_ID_SCHEMA', 'QUOTE_DEFAULT_INTRO_TEXT', 'QUOTE_DEFAULT_OUTRO_TEXT', 'SYSTEM_CURRENCY', 'SYSTEM_UNITS', 'SYSTEM_TAX_RATES', 'COMPANY_INFO');
ALTER TABLE "Option" ALTER COLUMN "key" TYPE "OptionKey_new" USING ("key"::text::"OptionKey_new");
ALTER TYPE "OptionKey" RENAME TO "OptionKey_old";
ALTER TYPE "OptionKey_new" RENAME TO "OptionKey";
DROP TYPE "public"."OptionKey_old";
COMMIT;
