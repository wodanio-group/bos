import { leadToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/lead/{id}:
 *   get:
 *     summary: Get a lead by ID
 *     description: Returns a single lead. Requires lead.all.view permission.
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
 *         description: Lead details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeadViewModel'
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
    rights: ['lead.all.view']
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.lead.findUnique({
    where: { id },
  });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  return leadToViewModel(findItem);
});
