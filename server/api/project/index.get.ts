import { projectToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { getUserFromRequest } from "~~/server/utils/auth";
import { hasRoleRights } from "~~/shared/utils/user";

/**
 * @swagger
 * /api/project:
 *   get:
 *     summary: List projects
 *     description: Returns a paginated list of projects. Returns all projects for users with project.all.view right, or only projects where the user is a member.
 *     tags: [Projects]
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
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectViewModel'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export default defineEventHandler(async (event) => {
  const user = await getUserFromRequest(event);
  if (!user)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

  const query = z.object({
    take: z.coerce.number().default(100),
    page: z.coerce.number().default(1),
    search: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional().nullable(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }).safeParse(getQuery(event));

  if (!query.success)
    throw createError({ statusCode: 400, statusMessage: 'Validation failed', data: query.error.flatten().fieldErrors });

  const canViewAll = hasRoleRights(user.role, ['project.all.view']);

  return (await prisma.project.findMany({
    take: query.data.take,
    skip: (query.data.page - 1) * query.data.take,
    where: {
      AND: [
        ...(canViewAll ? [] : [{ members: { some: { userId: user.id } } }]),
        ...(query.data.status ? [{ status: query.data.status }] : []),
        ...(query.data.search ? [{ OR: [
          { name: { contains: query.data.search, mode: 'insensitive' as const } },
          { description: { contains: query.data.search, mode: 'insensitive' as const } },
        ] }] : []),
      ],
    },
    orderBy: { [query.data.sortBy]: query.data.sortOrder },
    include: {
      members: { include: { user: true } },
      notes: true,
      company: true,
    },
  })).map(o => projectToViewModel(o));
});
