import { companyToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/company:
 *   get:
 *     summary: List all companies
 *     description: Returns a paginated list of all companies with optional search and sorting. Requires contact.all.view permission.
 *     tags: [Companies]
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
 *           enum: [createdAt, updatedAt, name, customerId]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: List of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CompanyViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['contact.all.view'] 
  });

  const query = z.object({
    take: z.coerce.number().default(100),
    page: z.coerce.number().default(1),
    search: z.string().optional().nullable(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'customerId']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }).safeParse(getQuery(event));

  if (!query.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: query.error.flatten().fieldErrors,
    });

  return (await prisma.company.findMany({
    take: query.data.take,
    skip: ((query.data.page - 1) * query.data.take),
    where: { AND: [

      // TODO: make search case insensitive

      ...(query.data.search ? [{ OR: [
        { externalId: { contains: query.data.search } },
        { name: { contains: query.data.search } },
        { name2: { contains: query.data.search } },
        { customerId: { contains: query.data.search } },
        { vatId: { contains: query.data.search } },
        { taxId: { contains: query.data.search } },
        { contactCommunicationWays: { some: { value: { contains: query.data.search } } } },
        { contactAddresses: { some: { address: { contains: query.data.search } } } },
        { contactAddresses: { some: { address2: { contains: query.data.search } } } },
        { contactAddresses: { some: { address3: { contains: query.data.search } } } },
        { contactAddresses: { some: { address4: { contains: query.data.search } } } },
        { contactAddresses: { some: { zipCode: { contains: query.data.search } } } },
        { contactAddresses: { some: { city: { contains: query.data.search } } } },
      ] }] : []),

    ] },
    orderBy: {
      [query.data.sortBy]: query.data.sortOrder
    },
    include: {
      companyPersons: true,
      contactCommunicationWays: true,
      contactAddresses: true,
      contactNotes: true
    },
  })).map(o => companyToViewModel(o));
});
