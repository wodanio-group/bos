CREATE TABLE "QuoteItemPesConversion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quoteItemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "pesId" TEXT NOT NULL,
    CONSTRAINT "QuoteItemPesConversion_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "QuoteItemPesConversion" ADD CONSTRAINT "QuoteItemPesConversion_quoteItemId_fkey" FOREIGN KEY ("quoteItemId") REFERENCES "QuoteItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
