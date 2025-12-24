import { opportunityToViewModel, opportunityStatusValidator, opportunityRecurringUnitValidator } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/opportunity:
 *   get:
 *     summary: List all opportunities
 *     description: Returns a paginated list of all opportunities. Requires opportunity.all.view permission.
 *     tags: [Opportunities]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/take'
 *       - $ref: '#/components/parameters/search'
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, name, amount, probabilityPercent]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by owner user ID
 *       - in: query
 *         name: opportunityStageId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by opportunity stage ID
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by company ID
 *       - in: query
 *         name: personId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by person ID
 *       - in: query
 *         name: leadId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by lead ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, WON, LOST]
 *         description: Filter by opportunity status
 *     responses:
 *       200:
 *         description: List of opportunities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OpportunityViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['opportunity.all.view']
  });

  const query = z.object({
    take: z.coerce.number().default(100),
    page: z.coerce.number().default(1),
    search: z.string().optional().nullable(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'amount', 'probabilityPercent']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    ownerId: z.string().uuid().optional().nullable(),
    opportunityStageId: z.string().uuid().optional().nullable(),
    companyId: z.string().uuid().optional().nullable(),
    personId: z.string().uuid().optional().nullable(),
    leadId: z.string().uuid().optional().nullable(),
    status: opportunityStatusValidator.optional().nullable(),
  }).safeParse(getQuery(event));

  if (!query.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: query.error.flatten().fieldErrors,
    });

  return (await prisma.opportunity.findMany({
    take: query.data.take,
    skip: ((query.data.page - 1) * query.data.take),
    where: { AND: [

      ...(query.data.ownerId ? [{ ownerId: query.data.ownerId }] : []),
      ...(query.data.opportunityStageId ? [{ opportunityStageId: query.data.opportunityStageId }] : []),
      ...(query.data.companyId ? [{ companyId: query.data.companyId }] : []),
      ...(query.data.personId ? [{ personId: query.data.personId }] : []),
      ...(query.data.leadId ? [{ leadId: query.data.leadId }] : []),
      ...(query.data.status ? [{ status: query.data.status }] : []),

      ...(query.data.search ? [{ OR: [
        { name: { contains: query.data.search } },
        { description: { contains: query.data.search } },
      ] }] : []),

    ] },
    orderBy: {
      [query.data.sortBy]: query.data.sortOrder
    },
  })).map(o => opportunityToViewModel(o));
});
