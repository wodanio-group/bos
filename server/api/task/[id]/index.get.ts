import { taskToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";
import { authMiddleware } from "~~/server/utils/auth";
import { getRightsByUserRole } from "~~/shared/utils/user";

/**
 * @swagger
 * /api/task/{id}:
 *   get:
 *     summary: Get a task by ID
 *     description: Returns a single task. Requires task.all.view or task.own.view permission.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Task not found
 */
export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event, {
    rights: ['task.all.view', 'task.own.view']
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.task.findUnique({
    where: { id },
  });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  // Check if user has permission to view this task
  const userRights = getRightsByUserRole(user.role);
  const hasAllView = userRights.includes('task.all.view');
  const hasOwnView = userRights.includes('task.own.view');

  if (!hasAllView && hasOwnView && findItem.userId !== user.id)
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    });

  return taskToViewModel(findItem);
});
