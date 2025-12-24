import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";
import { getRightsByUserRole } from "~~/shared/utils/user";

/**
 * @swagger
 * /api/task/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Deletes a task. Requires task.all.delete or task.own.delete permission.
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
 *         description: Task successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OK
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
    rights: ['task.all.delete', 'task.own.delete']
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.task.findUnique({ where: { id } });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  // Check if user has permission to delete this task
  const userRights = getRightsByUserRole(user.role);
  const hasAllDelete = userRights.includes('task.all.delete');
  const hasOwnDelete = userRights.includes('task.own.delete');

  if (!hasAllDelete && hasOwnDelete && findItem.userId !== user.id)
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    });

  await prisma.task.delete({ where: { id } });

  return { message: 'OK' };
});
