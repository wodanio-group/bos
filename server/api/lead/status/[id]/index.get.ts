import { leadStatusToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/lead/status/{id}:
 *   get:
 *     summary: Get a lead status by ID
 *     description: Returns a single lead status. Requires leadstatus.all.view permission.
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
 *         description: Lead status details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeadStatusViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Lead status not found
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['leadstatus.all.view']
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.leadStatus.findUnique({
    where: { id },
  });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  return leadStatusToViewModel(findItem);
});
