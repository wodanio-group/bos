import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";

/**
 * @swagger
 * /api/lead/{id}:
 *   delete:
 *     summary: Delete a lead
 *     description: Deletes a lead. Requires lead.all.delete permission.
 *     tags: [Leads]
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
 *         description: The lead ID
 *     responses:
 *       200:
 *         description: Lead successfully deleted
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
 *         description: Lead not found
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['lead.all.delete']
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.lead.findUnique({ where: { id } });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  await prisma.lead.delete({ where: { id } });

  return { message: 'OK' };
});
