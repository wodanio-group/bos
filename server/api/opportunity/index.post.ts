import { opportunityToViewModel, opportunityStatusValidator, opportunityRecurringUnitValidator } from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";

/**
 * @swagger
 * /api/opportunity:
 *   post:
 *     summary: Create a new opportunity
 *     description: Creates a new opportunity. Requires opportunity.all.create permission.
 *     tags: [Opportunities]
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
 *               - opportunityStageId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Opportunity name
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Opportunity description
 *               amount:
 *                 type: number
 *                 format: float
 *                 default: 0
 *                 description: One-time opportunity amount
 *               recurringAmount:
 *                 type: number
 *                 format: float
 *                 default: 0
 *                 description: Recurring amount per period
 *               recurringCount:
 *                 type: number
 *                 format: float
 *                 default: 0
 *                 description: Number of recurring periods
 *               recurringUnit:
 *                 type: string
 *                 enum: [MONTHLY, QUARTERLY, YEARLY]
 *                 nullable: true
 *                 description: Recurring period unit
 *               probabilityPercent:
 *                 type: number
 *                 format: float
 *                 default: 0
 *                 description: Probability of closing (0-100)
 *               status:
 *                 type: string
 *                 enum: [OPEN, WON, LOST]
 *                 default: OPEN
 *                 description: Opportunity status
 *               opportunityStageId:
 *                 type: string
 *                 format: uuid
 *                 description: Opportunity stage ID
 *               companyId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               personId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               leadId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               ownerId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Successfully created opportunity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OpportunityViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['opportunity.all.create']
  });

  const body = z.object({
    name: z.string().trim().min(1),
    description: z.string().trim().optional().nullable(),
    amount: z.number().default(0),
    recurringAmount: z.number().default(0),
    recurringCount: z.number().default(0),
    recurringUnit: opportunityRecurringUnitValidator.optional().nullable(),
    probabilityPercent: z.number().min(0).max(100).default(0),
    status: opportunityStatusValidator.default('OPEN'),
    opportunityStageId: z.string().uuid(),
    companyId: z.string().uuid().optional().nullable(),
    personId: z.string().uuid().optional().nullable(),
    leadId: z.string().uuid().optional().nullable(),
    ownerId: z.string().uuid().optional().nullable(),
  }).safeParse(await readBody(event));

  if (!body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body.error.flatten().fieldErrors,
    });

  // Verify referenced entities exist
  const opportunityStage = await prisma.opportunityStage.findUnique({ where: { id: body.data.opportunityStageId } });
  if (!opportunityStage)
    throw createError({
      statusCode: 400,
      statusMessage: 'Opportunity stage not found',
    });

  if (body.data.companyId) {
    const company = await prisma.company.findUnique({ where: { id: body.data.companyId } });
    if (!company)
      throw createError({
        statusCode: 400,
        statusMessage: 'Company not found',
      });
  }

  if (body.data.personId) {
    const person = await prisma.person.findUnique({ where: { id: body.data.personId } });
    if (!person)
      throw createError({
        statusCode: 400,
        statusMessage: 'Person not found',
      });
  }

  if (body.data.leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: body.data.leadId } });
    if (!lead)
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead not found',
      });
  }

  if (body.data.ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: body.data.ownerId } });
    if (!owner)
      throw createError({
        statusCode: 400,
        statusMessage: 'Owner user not found',
      });
  }

  const item = await prisma.opportunity.create({
    data: {
      name: body.data.name,
      description: body.data.description,
      amount: body.data.amount,
      recurringAmount: body.data.recurringAmount,
      recurringCount: body.data.recurringCount,
      recurringUnit: body.data.recurringUnit,
      probabilityPercent: body.data.probabilityPercent,
      status: body.data.status,
      opportunityStageId: body.data.opportunityStageId,
      companyId: body.data.companyId,
      personId: body.data.personId,
      leadId: body.data.leadId,
      ownerId: body.data.ownerId,
    },
  });

  return opportunityToViewModel(item);
});
