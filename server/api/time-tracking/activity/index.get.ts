import { hasRoleRights, timeTrackingActivityToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/time-tracking/activity:
 *   get:
 *     summary: List all time tracking activities
 *     description: Returns a paginated list of time tracking activities. Users with timetracking.all.view permission can see all activities, while users with only timetracking.own.view permission can only see their own activities. Supports filtering by user, company, running status, and search text.
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/take'
 *       - $ref: '#/components/parameters/search'
 *       - in: query
 *         name: isRunning
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filter for currently running activities (activities without an end time)
 *       - in: query
 *         name: isNotRunning
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filter for completed activities (activities with an end time)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter activities by user ID
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter activities by company ID
 *     responses:
 *       200:
 *         description: List of time tracking activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TimeTrackingActivityViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event, {
    rights: ['timetracking.all.view', 'timetracking.own.view'] 
  });
  const allAllowed = hasRoleRights(user.role, ['timetracking.all.view']);

  const query = z.object({
    take: z.coerce.number().default(100),
    page: z.coerce.number().default(1),
    search: z.string().optional().nullable(),
    isRunning: z.coerce.boolean().default(false),
    isNotRunning: z.coerce.boolean().default(false),
    userId: z.string().uuid().optional().nullable(),
    companyId: z.string().uuid().optional().nullable(),
  }).safeParse(getQuery(event));

  if (!query.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: query.error.flatten().fieldErrors,
    });

  return (await prisma.timeTrackingActivity.findMany({
    take: query.data.take,
    skip: ((query.data.page - 1) * query.data.take),
    where: { AND: [

      ...(allAllowed ? [] : [{
        user: { id: user.id }
      }]),

      ...(query.data.userId ? [{
        user: { id: query.data.userId }
      }] : []),
      ...(query.data.companyId ? [{
        company: { id: query.data.companyId }
      }] : []),

      ...((query.data.isRunning === true) ? [{
        to: null
      }] : []),
      ...((query.data.isNotRunning === true) ? [{
        to: { not: null }
      }] : []),

      ...(query.data.search ? [{ OR: [
        { description: { contains: query.data.search } },
      ] }] : []),

    ] },
    orderBy: {
      from: 'desc'
    },
    include: {
      user: true,
      company: true,
    },
  })).map(o => timeTrackingActivityToViewModel(o));
});
