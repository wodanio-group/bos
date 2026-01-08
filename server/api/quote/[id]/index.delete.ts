import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";

/**
 * @swagger
 * /api/quote/{id}:
 *   delete:
 *     summary: Delete a quote
 *     description: Deletes a quote and all its items. Requires quote.all.delete permission.
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
 *         description: Quote successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OK
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
    rights: ['quote.all.delete']
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.quote.findUnique({ where: { id } });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  await prisma.quote.delete({ where: { id } });

  return { message: 'OK' };
});
