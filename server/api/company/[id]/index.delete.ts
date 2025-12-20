import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";
import { authMiddleware } from "~~/server/utils/auth";
import { queue } from '../../../utils/queue';

/**
 * @swagger
 * /api/company/{id}:
 *   delete:
 *     summary: Delete a company
 *     description: Permanently deletes a company and all associated data including persons, communication ways, addresses, and notes. This action cannot be undone. Requires contact.all.delete permission.
 *     tags: [Companies]
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
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company deleted successfully
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
 *         $ref: '#/components/responses/NotFound'
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['contact.all.delete'] 
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.company.findUnique({ where: { id } });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  await queue.add('pes.customer.delete', { companyId: id });

  await prisma.company.delete({ where: { id } });

  return { message: 'OK' };
});
