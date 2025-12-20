import { userTokenToViewModel, getRightsByUserRole } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/user/token:
 *   get:
 *     summary: List user tokens
 *     description: Returns a paginated list of user tokens. Users with user.token.all.view permission can view all tokens, while users with user.token.own.view can only view their own tokens.
 *     tags: [User Tokens]
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
 *           enum: [createdAt, updatedAt, name]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter tokens by user ID (only available for users with user.token.all.view permission)
 *     responses:
 *       200:
 *         description: List of user tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserTokenViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event, {
    rights: ['user.token.all.view', 'user.token.own.view']
  });

  const query = z.object({
    take: z.coerce.number().default(100),
    page: z.coerce.number().default(1),
    search: z.string().optional().nullable(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    userId: z.string().optional().nullable(),
  }).safeParse(getQuery(event));

  if (!query.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: query.error.flatten().fieldErrors,
    });

  // Check if user has permission to view all tokens or only their own
  const hasAllViewPermission = user && getRightsByUserRole(user.role).includes('user.token.all.view');
  const userIdFilter = hasAllViewPermission
    ? (query.data.userId ? query.data.userId : undefined)
    : user.id;

  return (await prisma.userToken.findMany({
    take: query.data.take,
    skip: ((query.data.page - 1) * query.data.take),
    where: { AND: [

      // Filter by userId if specified or if user only has own.view permission
      ...(userIdFilter ? [{ userId: userIdFilter }] : []),

      // Search filter
      ...(query.data.search ? [{ OR: [
        { name: { contains: query.data.search } },
        { id: { contains: query.data.search } },
      ] }] : []),

    ] },
    orderBy: {
      [query.data.sortBy]: query.data.sortOrder
    },
    include: {
      user: true
    }
  })).map(o => userTokenToViewModel(o));
});
