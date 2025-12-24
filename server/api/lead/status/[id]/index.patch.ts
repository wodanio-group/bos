import { leadStatusToViewModel } from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";

/**
 * @swagger
 * /api/lead/status/{id}:
 *   patch:
 *     summary: Update a lead status
 *     description: Updates an existing lead status. Requires leadstatus.all.edit permission.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Lead status name (alias is not editable)
 *               default:
 *                 type: boolean
 *                 description: Whether this is the default status for new leads
 *               order:
 *                 type: integer
 *                 description: Display order for sorting statuses
 *     responses:
 *       200:
 *         description: Successfully updated lead status
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
    rights: ['leadstatus.all.edit']
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

  const findItem = await prisma.leadStatus.findUnique({ where: { id } });
  if (!findItem)
    throw createError({ statusCode: 404 });

  const item = await prisma.leadStatus.update({
    where: { id },
    data: {
      name: body.data.name,
      default: body.data.default,
      order: body.data.order,
    },
  });

  return leadStatusToViewModel(item);
});
