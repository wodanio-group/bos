import { projectToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";
import { getUserFromRequest } from "~~/server/utils/auth";
import { hasRoleRights } from "~~/shared/utils/user";

/**
 * @swagger
 * /api/project/{id}:
 *   get:
 *     summary: Get a project by ID
 *     description: Returns project details. Requires project.all.view right or project membership.
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
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectViewModel'
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

  const item = await prisma.project.findUnique({
    where: { id },
    include: { members: { include: { user: true } }, notes: true, company: true },
  });
  if (!item)
    throw createError({ statusCode: 404 });

  const canViewAll = hasRoleRights(user.role, ['project.all.view']);
  const isMember = item.members.some(m => m.userId === user.id);
  if (!canViewAll && !isMember)
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });

  return projectToViewModel(item);
});
