-- CreateEnum
CREATE TYPE "public"."OptionKey" AS ENUM ('CUSTOMER_ID_COUNTER', 'CUSTOMER_ID_SCHEMA');

-- CreateEnum
CREATE TYPE "public"."ContactGender" AS ENUM ('MALE', 'FEMALE', 'DIVERSE', 'NONE');

-- CreateEnum
CREATE TYPE "public"."ContactCommunicationWayType" AS ENUM ('PHONE', 'EMAIL', 'WEB');

-- CreateEnum
CREATE TYPE "public"."ContactCommunicationWayCategory" AS ENUM ('INVOICING', 'WORK', 'FAX', 'MOBILE', 'AUTOBOX', 'NEWSLETTER', 'PRIVAT', 'NONE');

-- CreateEnum
CREATE TYPE "public"."ContactAddressCategory" AS ENUM ('INVOICE', 'WORK', 'DELIVERY', 'PICKUP', 'PRIVAT', 'NONE');

-- CreateTable
CREATE TABLE "public"."Option" (
    "key" "public"."OptionKey" NOT NULL,
    "value" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."Person" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalId" TEXT,
    "firstname" TEXT,
    "surename" TEXT,
    "familyname" TEXT,
    "gender" "public"."ContactGender" NOT NULL DEFAULT 'NONE',
    "birthdayAt" TIMESTAMP(3),

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalId" TEXT,
    "name" TEXT,
    "name2" TEXT,
    "customerId" TEXT,
    "taxId" TEXT,
    "vatId" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContactCommunicationWay" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "public"."ContactCommunicationWayType" NOT NULL,
    "category" "public"."ContactCommunicationWayCategory" NOT NULL,
    "value" TEXT,
    "personId" TEXT,
    "companyId" TEXT,

    CONSTRAINT "ContactCommunicationWay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContactAddress" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" "public"."ContactAddressCategory" NOT NULL,
    "address" TEXT,
    "address2" TEXT,
    "address3" TEXT,
    "address4" TEXT,
    "zipCode" TEXT,
    "city" TEXT,
    "countryId" TEXT NOT NULL,
    "personId" TEXT,
    "companyId" TEXT,

    CONSTRAINT "ContactAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Country" (
    "isoCode" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("isoCode")
);

-- CreateTable
CREATE TABLE "public"."ContactNote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "personId" TEXT,
    "companyId" TEXT,

    CONSTRAINT "ContactNote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ContactCommunicationWay" ADD CONSTRAINT "ContactCommunicationWay_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactCommunicationWay" ADD CONSTRAINT "ContactCommunicationWay_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactAddress" ADD CONSTRAINT "ContactAddress_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("isoCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactAddress" ADD CONSTRAINT "ContactAddress_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactAddress" ADD CONSTRAINT "ContactAddress_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactNote" ADD CONSTRAINT "ContactNote_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactNote" ADD CONSTRAINT "ContactNote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
