import { opportunityStageToViewModel } from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { stringToAlias } from "~~/shared/utils/default";

/**
 * @swagger
 * /api/opportunity/stage:
 *   post:
 *     summary: Create a new opportunity stage
 *     description: Creates a new opportunity stage. Requires opportunitystage.all.create permission.
 *     tags: [Opportunity Stages]
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
 *                 description: Opportunity stage name (alias will be auto-generated)
 *               default:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this is the default stage for new opportunities
 *               order:
 *                 type: integer
 *                 description: Display order for sorting stages
 *     responses:
 *       200:
 *         description: Successfully created opportunity stage
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
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['opportunitystage.all.create']
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
  const existingOpportunityStage = await prisma.opportunityStage.findUnique({
    where: { alias }
  });

  if (existingOpportunityStage)
    throw createError({
      statusCode: 400,
      statusMessage: 'Opportunity stage with this name already exists (alias conflict)',
    });

  const item = await prisma.opportunityStage.create({
    data: {
      alias,
      name: body.data.name,
      default: body.data.default,
      order: body.data.order,
    },
  });

  return opportunityStageToViewModel(item);
});
