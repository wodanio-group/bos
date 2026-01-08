import { quoteToViewModel } from "~~/shared/utils/quote";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/quote:
 *   get:
 *     summary: List all quotes
 *     description: Returns a paginated list of all quotes. Requires quote.all.view permission.
 *     tags: [Quotes]
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
 *           enum: [createdAt, updatedAt, quoteDate, quoteId, total]
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
 *         name: companyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by company ID
 *       - in: query
 *         name: quoteId
 *         schema:
 *           type: string
 *         description: Filter by quote business ID
 *     responses:
 *       200:
 *         description: List of quotes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuoteViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['quote.all.view']
  });

  const query = z.object({
    take: z.coerce.number().default(100),
    page: z.coerce.number().default(1),
    search: z.string().optional().nullable(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'quoteDate', 'quoteId', 'total']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    ownerId: z.string().uuid().optional().nullable(),
    companyId: z.string().uuid().optional().nullable(),
    quoteId: z.string().optional().nullable(),
  }).safeParse(getQuery(event));

  if (!query.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: query.error.flatten().fieldErrors,
    });

  return (await prisma.quote.findMany({
    take: query.data.take,
    skip: ((query.data.page - 1) * query.data.take),
    where: { AND: [

      ...(query.data.ownerId ? [{ ownerId: query.data.ownerId }] : []),
      ...(query.data.companyId ? [{ companyId: query.data.companyId }] : []),
      ...(query.data.quoteId ? [{ quoteId: query.data.quoteId }] : []),

      ...(query.data.search ? [{ OR: [
        { quoteId: { contains: query.data.search } },
        { title: { contains: query.data.search } },
        { company: { name: { contains: query.data.search } } },
        { company: { customerId: { contains: query.data.search } } },
      ] }] : []),

    ] },
    orderBy: {
      [query.data.sortBy]: query.data.sortOrder
    },
    include: {
      company: true,
      quoteItems: {
        orderBy: {
          quotePosition: 'asc'
        }
      }
    }
  })).map(o => quoteToViewModel(o));
});
