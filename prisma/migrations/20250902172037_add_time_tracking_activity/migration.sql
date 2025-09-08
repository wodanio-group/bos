-- CreateTable
CREATE TABLE "public"."TimeTrackingActivity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "companyId" TEXT,
    "exportedAt" TIMESTAMP(3),

    CONSTRAINT "TimeTrackingActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TimeTrackingActivity" ADD CONSTRAINT "TimeTrackingActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimeTrackingActivity" ADD CONSTRAINT "TimeTrackingActivity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
