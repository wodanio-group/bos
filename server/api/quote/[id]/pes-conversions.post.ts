import { prisma } from "~~/lib/prisma.server";
import { authMiddleware } from "~~/server/utils/auth";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  await authMiddleware(event, { rights: ['quote.all.edit'] });

  const quoteId = getRouterParam(event, 'id')!;

  const body = await z.object({
    quoteItemId: z.string().uuid(),
    type: z.enum(['recurringChargeItem', 'chargeItem']),
    pesId: z.string().min(1),
  }).parseAsync(await readBody(event));

  // Verify the quoteItem belongs to this quote
  const quoteItem = await prisma.quoteItem.findFirst({
    where: { id: body.quoteItemId, quoteId },
  });

  if (!quoteItem) {
    throw createError({ statusCode: 404, statusMessage: 'Quote item not found' });
  }

  const conversion = await prisma.quoteItemPesConversion.create({
    data: {
      quoteItemId: body.quoteItemId,
      type: body.type,
      pesId: body.pesId,
    },
  });

  return conversion;
});
