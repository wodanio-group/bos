import { prisma } from "~~/lib/prisma.server";
import { authMiddleware } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  await authMiddleware(event, { rights: ['quote.all.view'] });

  const quoteId = getRouterParam(event, 'id')!;

  const conversions = await prisma.quoteItemPesConversion.findMany({
    where: { quoteItem: { quoteId } },
    orderBy: { createdAt: 'asc' },
  });

  return conversions;
});
