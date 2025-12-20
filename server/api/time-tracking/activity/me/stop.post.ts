import { timeTrackingActivityToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/time-tracking/activity/me/stop:
 *   post:
 *     summary: Stop time tracking for current user
 *     description: Stops the currently running time tracking activity for the authenticated user by setting the end time to the current timestamp. Requires timetracking.all.edit or timetracking.own.create permission. Returns an error if no time tracking activity is currently running.
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Stopped time tracking activity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimeTrackingActivityViewModel'
 *       400:
 *         description: No running time tracking activity found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 statusMessage:
 *                   type: string
 *                   example: No running time tracking
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event, {
    rights: ['timetracking.all.edit', 'timetracking.own.create'] 
  });
  const item = (await prisma.timeTrackingActivity.findFirst({
    where: {
      user: { id: user.id },
      to: null,
    },
    include: {
      user: true,
    },
  }));
  if (!item)
    throw createError({ statusCode: 400, statusMessage: 'No running time tracking' });
  return timeTrackingActivityToViewModel((await prisma.timeTrackingActivity.update({
    where: {
      id: item.id,
    },
    data: {
      to: new Date()
    },
  })));
});
