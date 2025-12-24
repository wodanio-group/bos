import { opportunityStageToViewModel } from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";

/**
 * @swagger
 * /api/opportunity/stage/{id}:
 *   patch:
 *     summary: Update an opportunity stage
 *     description: Updates an existing opportunity stage. Requires opportunitystage.all.edit permission.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Opportunity stage name (alias is not editable)
 *               default:
 *                 type: boolean
 *                 description: Whether this is the default stage for new opportunities
 *               order:
 *                 type: integer
 *                 description: Display order for sorting stages
 *     responses:
 *       200:
 *         description: Successfully updated opportunity stage
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
    rights: ['opportunitystage.all.edit']
  });

  const id = getValidatedParamsId(event);
  const body = z.object({
    name: z.string().trim().min(1).optional(),
    default: z.boolean().optional(),
    order: z.number().int().optional(),
  }).safeParse(await readBody(event));

  if (!id || !body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body?.error?.flatten()?.fieldErrors,
    });

  const findItem = await prisma.opportunityStage.findUnique({ where: { id } });
  if (!findItem)
    throw createError({ statusCode: 404 });

  const item = await prisma.opportunityStage.update({
    where: { id },
    data: {
      name: body.data.name,
      default: body.data.default,
      order: body.data.order,
    },
  });

  return opportunityStageToViewModel(item);
});
