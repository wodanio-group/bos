import { timeTrackingActivityToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/time-tracking/activity/me/start:
 *   post:
 *     summary: Start time tracking for current user
 *     description: Starts a new time tracking activity for the authenticated user. If a time tracking activity is already running for the user, it returns the existing running activity instead of creating a new one. Requires timetracking.all.edit or timetracking.own.create permission.
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Started or existing running time tracking activity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimeTrackingActivityViewModel'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event, {
    rights: ['timetracking.all.edit', 'timetracking.own.create'] 
  });
  return timeTrackingActivityToViewModel((await prisma.timeTrackingActivity.findFirst({
    where: {
      user: { id: user.id },
      to: null,
    },
    include: {
      user: true,
    },
  })) ?? (await prisma.timeTrackingActivity.create({
    data: {
      userId: user.id,
      from: new Date(),
    },
    include: {
      user: true,
    },
  })));
});
