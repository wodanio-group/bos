import { opportunityToViewModel, opportunityStatusValidator, opportunityRecurringUnitValidator } from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";

/**
 * @swagger
 * /api/opportunity/{id}:
 *   patch:
 *     summary: Update an opportunity
 *     description: Updates an existing opportunity. Requires opportunity.all.edit permission.
 *     tags: [Opportunities]
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
 *         description: The opportunity ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *                 description: One-time opportunity amount
 *               recurringAmount:
 *                 type: number
 *                 format: float
 *                 description: Recurring amount per period
 *               recurringCount:
 *                 type: number
 *                 format: float
 *                 description: Number of recurring periods
 *               recurringUnit:
 *                 type: string
 *                 enum: [MONTHLY, QUARTERLY, YEARLY]
 *                 nullable: true
 *                 description: Recurring period unit
 *               probabilityPercent:
 *                 type: number
 *                 format: float
 *                 description: Probability of closing (0-100)
 *               status:
 *                 type: string
 *                 enum: [OPEN, WON, LOST]
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
 *         description: Successfully updated opportunity
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
 *       404:
 *         description: Opportunity not found
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['opportunity.all.edit']
  });

  const id = getValidatedParamsId(event);
  const body = z.object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().optional().nullable(),
    amount: z.number().optional(),
    recurringAmount: z.number().optional(),
    recurringCount: z.number().optional(),
    recurringUnit: opportunityRecurringUnitValidator.optional().nullable(),
    probabilityPercent: z.number().min(0).max(100).optional(),
    status: opportunityStatusValidator.optional(),
    opportunityStageId: z.string().uuid().optional(),
    companyId: z.string().uuid().optional().nullable(),
    personId: z.string().uuid().optional().nullable(),
    leadId: z.string().uuid().optional().nullable(),
    ownerId: z.string().uuid().optional().nullable(),
  }).safeParse(await readBody(event));

  if (!id || !body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body?.error?.flatten()?.fieldErrors,
    });

  const findItem = await prisma.opportunity.findUnique({ where: { id } });
  if (!findItem)
    throw createError({ statusCode: 404 });

  // Verify referenced entities exist if they are being updated
  if (body.data.opportunityStageId) {
    const opportunityStage = await prisma.opportunityStage.findUnique({ where: { id: body.data.opportunityStageId } });
    if (!opportunityStage)
      throw createError({
        statusCode: 400,
        statusMessage: 'Opportunity stage not found',
      });
  }

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

  const item = await prisma.opportunity.update({
    where: { id },
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
