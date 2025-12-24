import { leadStatusToViewModel } from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { stringToAlias } from "~~/shared/utils/default";

/**
 * @swagger
 * /api/lead/status:
 *   post:
 *     summary: Create a new lead status
 *     description: Creates a new lead status. Requires leadstatus.all.create permission.
 *     tags: [Lead Statuses]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - order
 *             properties:
 *               name:
 *                 type: string
 *                 description: Lead status name (alias will be auto-generated)
 *               default:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this is the default status for new leads
 *               order:
 *                 type: integer
 *                 description: Display order for sorting statuses
 *     responses:
 *       200:
 *         description: Successfully created lead status
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
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['leadstatus.all.create']
  });

  const body = z.object({
    name: z.string().trim().min(1),
    default: z.boolean().default(false),
    order: z.number().int(),
  }).safeParse(await readBody(event));

  if (!body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body.error.flatten().fieldErrors,
    });

  // Auto-generate alias from name
  const alias = stringToAlias(body.data.name);

  // Check if alias is unique
  const existingLeadStatus = await prisma.leadStatus.findUnique({
    where: { alias }
  });

  if (existingLeadStatus)
    throw createError({
      statusCode: 400,
      statusMessage: 'Lead status with this name already exists (alias conflict)',
    });

  const item = await prisma.leadStatus.create({
    data: {
      alias,
      name: body.data.name,
      default: body.data.default,
      order: body.data.order,
    },
  });

  return leadStatusToViewModel(item);
});
