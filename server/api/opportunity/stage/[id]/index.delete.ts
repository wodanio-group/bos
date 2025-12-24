import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";

/**
 * @swagger
 * /api/opportunity/stage/{id}:
 *   delete:
 *     summary: Delete an opportunity stage
 *     description: Deletes an opportunity stage. Requires opportunitystage.all.delete permission.
 *     tags: [Opportunity Stages]
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
 *         description: The opportunity stage ID
 *     responses:
 *       200:
 *         description: Opportunity stage successfully deleted
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
 *         description: Opportunity stage not found
 *       409:
 *         description: Cannot delete opportunity stage with existing opportunities
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['opportunitystage.all.delete']
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.opportunityStage.findUnique({ where: { id } });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  // Check if there are any opportunities assigned to this opportunity stage
  const opportunitiesCount = await prisma.opportunity.count({
    where: { opportunityStageId: id }
  });

  if (opportunitiesCount > 0)
    throw createError({
      statusCode: 409,
      statusMessage: `Cannot delete opportunity stage. ${opportunitiesCount} opportunit${opportunitiesCount === 1 ? 'y is' : 'ies are'} assigned to this stage.`,
    });

  await prisma.opportunityStage.delete({ where: { id } });

  return { message: 'OK' };
});
