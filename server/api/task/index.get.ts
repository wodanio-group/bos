import { taskToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";
import { getRightsByUserRole } from "~~/shared/utils/user";

/**
 * @swagger
 * /api/task:
 *   get:
 *     summary: List all tasks
 *     description: Returns a paginated list of all tasks. Requires task.all.view or task.own.view permission.
 *     tags: [Tasks]
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
 *           enum: [createdAt, updatedAt, name, startAt, dueDateAt, doneAt]
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
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by assigned user ID
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by associated company ID
 *       - in: query
 *         name: personId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by associated person ID
 *       - in: query
 *         name: leadId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by associated lead ID
 *       - in: query
 *         name: opportunityId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by associated opportunity ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CALL, MAIL, ACTION, OTHER]
 *         description: Filter by task type
 *       - in: query
 *         name: isDone
 *         schema:
 *           type: boolean
 *         description: Filter by completion status (true for completed, false for pending)
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event, {
    rights: ['task.all.view', 'task.own.view']
  });

  const query = z.object({
    take: z.coerce.number().default(100),
    page: z.coerce.number().default(1),
    search: z.string().optional().nullable(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'startAt', 'dueDateAt', 'doneAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    userId: z.string().uuid().optional().nullable(),
    companyId: z.string().uuid().optional().nullable(),
    personId: z.string().uuid().optional().nullable(),
    leadId: z.string().uuid().optional().nullable(),
    opportunityId: z.string().uuid().optional().nullable(),
    type: z.enum(['CALL', 'MAIL', 'ACTION', 'OTHER']).optional().nullable(),
    isDone: z.coerce.boolean().optional().nullable(),
  }).safeParse(getQuery(event));

  if (!query.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: query.error.flatten().fieldErrors,
    });

  // Check if user has only task.own.view permission
  const userRights = getRightsByUserRole(user.role);
  const hasAllView = userRights.includes('task.all.view');
  const hasOwnView = userRights.includes('task.own.view');

  return (await prisma.task.findMany({
    take: query.data.take,
    skip: ((query.data.page - 1) * query.data.take),
    where: { AND: [

      // If user only has task.own.view, filter by their userId
      ...(!hasAllView && hasOwnView ? [{ userId: user.id }] : []),

      ...(query.data.userId ? [{ userId: query.data.userId }] : []),
      ...(query.data.companyId ? [{ companyId: query.data.companyId }] : []),
      ...(query.data.personId ? [{ personId: query.data.personId }] : []),
      ...(query.data.leadId ? [{ leadId: query.data.leadId }] : []),
      ...(query.data.opportunityId ? [{ opportunityId: query.data.opportunityId }] : []),
      ...(query.data.type ? [{ type: query.data.type }] : []),
      ...(query.data.isDone !== null && query.data.isDone !== undefined
        ? [query.data.isDone ? { doneAt: { not: null } } : { doneAt: null }]
        : []
      ),

      ...(query.data.search ? [{ OR: [
        { name: { contains: query.data.search } },
        { content: { contains: query.data.search } },
      ] }] : []),

    ] },
    orderBy: {
      [query.data.sortBy]: query.data.sortOrder
    },
  })).map(o => taskToViewModel(o));
});
