import { leadToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/lead:
 *   get:
 *     summary: List all leads
 *     description: Returns a paginated list of all leads. Requires lead.all.view permission.
 *     tags: [Leads]
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
 *           enum: [createdAt, updatedAt, firstname, familyname, companyName, email]
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
 *         name: leadStatusId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by lead status ID
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
 *         name: campaignId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by campaign ID
 *     responses:
 *       200:
 *         description: List of leads
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeadViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['lead.all.view']
  });

  const query = z.object({
    take: z.coerce.number().default(100),
    page: z.coerce.number().default(1),
    search: z.string().optional().nullable(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'firstname', 'familyname', 'companyName', 'email']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    ownerId: z.string().uuid().optional().nullable(),
    leadStatusId: z.string().uuid().optional().nullable(),
    companyId: z.string().uuid().optional().nullable(),
    personId: z.string().uuid().optional().nullable(),
    campaignId: z.string().uuid().optional().nullable(),
  }).safeParse(getQuery(event));

  if (!query.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: query.error.flatten().fieldErrors,
    });

  return (await prisma.lead.findMany({
    take: query.data.take,
    skip: ((query.data.page - 1) * query.data.take),
    where: { AND: [

      ...(query.data.ownerId ? [{ ownerId: query.data.ownerId }] : []),
      ...(query.data.leadStatusId ? [{ leadStatusId: query.data.leadStatusId }] : []),
      ...(query.data.companyId ? [{ companyId: query.data.companyId }] : []),
      ...(query.data.personId ? [{ personId: query.data.personId }] : []),
      ...(query.data.campaignId ? [{ campaignId: query.data.campaignId }] : []),

      ...(query.data.search ? [{ OR: [
        { firstname: { contains: query.data.search } },
        { familyname: { contains: query.data.search } },
        { companyName: { contains: query.data.search } },
        { email: { contains: query.data.search } },
        { phoneNumber: { contains: query.data.search } },
        { mobileNumber: { contains: query.data.search } },
        { note: { contains: query.data.search } },
      ] }] : []),

    ] },
    orderBy: {
      [query.data.sortBy]: query.data.sortOrder
    },
  })).map(o => leadToViewModel(o));
});
