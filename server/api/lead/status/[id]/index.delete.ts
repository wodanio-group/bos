import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";

/**
 * @swagger
 * /api/lead/status/{id}:
 *   delete:
 *     summary: Delete a lead status
 *     description: Deletes a lead status. Requires leadstatus.all.delete permission.
 *     tags: [Lead Statuses]
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
 *         description: The lead status ID
 *     responses:
 *       200:
 *         description: Lead status successfully deleted
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
 *         description: Lead status not found
 *       409:
 *         description: Cannot delete lead status with existing leads
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['leadstatus.all.delete']
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.leadStatus.findUnique({ where: { id } });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  // Check if there are any leads assigned to this lead status
  const leadsCount = await prisma.lead.count({
    where: { leadStatusId: id }
  });

  if (leadsCount > 0)
    throw createError({
      statusCode: 409,
      statusMessage: `Cannot delete lead status. ${leadsCount} lead(s) are assigned to this status.`,
    });

  await prisma.leadStatus.delete({ where: { id } });

  return { message: 'OK' };
});
