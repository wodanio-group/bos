import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";
import { getUserFromRequest } from "~~/server/utils/auth";
import { hasRoleRights } from "~~/shared/utils/user";

/**
 * @swagger
 * /api/project/{id}:
 *   delete:
 *     summary: Delete a project
 *     description: Deletes a project. Requires project.all.delete right or MANAGER project role.
 *     tags: [Projects]
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
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export default defineEventHandler(async (event) => {
  const user = await getUserFromRequest(event);
  if (!user)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Validation failed' });

  const existing = await prisma.project.findUnique({
    where: { id },
    include: { members: true },
  });
  if (!existing)
    throw createError({ statusCode: 404 });

  const canDeleteAll = hasRoleRights(user.role, ['project.all.delete']);
  const isManager = existing.members.find(m => m.userId === user.id)?.role === 'MANAGER';
  if (!canDeleteAll && !isManager)
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });

  await prisma.project.delete({ where: { id } });

  return { success: true };
});
