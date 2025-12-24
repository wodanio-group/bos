import { opportunityStageToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/opportunity/stage/{id}:
 *   get:
 *     summary: Get an opportunity stage by ID
 *     description: Returns a single opportunity stage. Requires opportunitystage.all.view permission.
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
 *         description: Opportunity stage details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OpportunityStageViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Opportunity stage not found
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['opportunitystage.all.view']
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.opportunityStage.findUnique({
    where: { id },
  });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  return opportunityStageToViewModel(findItem);
});
