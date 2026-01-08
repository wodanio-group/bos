import { quoteToViewModel } from "~~/shared/utils/quote";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/quote/{id}:
 *   get:
 *     summary: Get a quote by ID
 *     description: Returns a single quote with all items. Requires quote.all.view permission.
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The quote ID
 *     responses:
 *       200:
 *         description: Quote details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuoteViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Quote not found
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['quote.all.view']
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.quote.findUnique({
    where: { id },
    include: {
      company: true,
      quoteItems: {
        orderBy: {
          quotePosition: 'asc'
        }
      }
    }
  });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  return quoteToViewModel(findItem);
});
