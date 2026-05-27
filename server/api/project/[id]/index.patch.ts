import { projectToViewModel, projectNoteValidator, projectMemberRoleValidator, projectStatusValidator } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { getValidatedParamsId } from "~~/shared/utils/default";
import { getUserFromRequest } from "~~/server/utils/auth";
import { hasRoleRights } from "~~/shared/utils/user";

/**
 * @swagger
 * /api/project/{id}:
 *   patch:
 *     summary: Update a project
 *     description: Updates project data. Requires project.all.edit right or MANAGER project role.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 $ref: '#/components/schemas/ProjectStatus'
 *               description:
 *                 type: string
 *                 nullable: true
 *               companyId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               members:
 *                 type: array
 *                 nullable: true
 *               notes:
 *                 type: array
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Updated project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
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
    include: { members: { include: { user: true } }, notes: true, company: true },
  });
  if (!existing)
    throw createError({ statusCode: 404 });

  const canEditAll = hasRoleRights(user.role, ['project.all.edit']);
  const memberEntry = existing.members.find(m => m.userId === user.id);
  const isManager = memberEntry?.role === 'MANAGER';
  const isMember = !!memberEntry;
  // Plain members may only update notes, not project metadata or members
  if (!canEditAll && !isManager && !isMember)
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });

  const body = z.object({
    name: z.string().trim().min(1).optional(),
    status: projectStatusValidator.optional(),
    description: z.string().trim().optional().nullable(),
    companyId: z.string().uuid().optional().nullable(),
    members: z.array(z.object({
      userId: z.string().uuid(),
      role: projectMemberRoleValidator,
    })).optional().nullable(),
    notes: z.array(projectNoteValidator).optional().nullable(),
  }).safeParse(await readBody(event));

  if (!body.success)
    throw createError({ statusCode: 400, statusMessage: 'Validation failed', data: body.error.flatten().fieldErrors });

  if (body.data.companyId) {
    const companyExists = await prisma.company.findUnique({ where: { id: body.data.companyId } });
    if (!companyExists)
      throw createError({ statusCode: 400, statusMessage: 'Company not found' });
  }

  const canEditProject = canEditAll || isManager;
  const canEditMembers = canEditAll || isManager;

  const item = await prisma.project.update({
    where: { id },
    data: {
      // Metadata only writable by manager or global edit right
      ...(canEditProject && body.data.name !== undefined ? { name: body.data.name } : {}),
      ...(canEditProject && body.data.status !== undefined ? { status: body.data.status } : {}),
      ...(canEditProject && body.data.description !== undefined ? { description: body.data.description } : {}),
      ...(canEditProject && body.data.companyId !== undefined ? { companyId: body.data.companyId } : {}),
      ...(body.data.members !== null && body.data.members !== undefined && canEditMembers ? {
        members: {
          deleteMany: {},
          create: body.data.members.map(m => ({ userId: m.userId, role: m.role })),
        },
      } : {}),
      // Notes writable by all members (including plain MEMBER role)
      ...(body.data.notes !== null && body.data.notes !== undefined ? {
        notes: {
          deleteMany: {},
          create: body.data.notes.map(n => ({ type: n.type, timestamp: n.timestamp, content: n.content })),
        },
      } : {}),
    },
    include: { members: { include: { user: true } }, notes: true, company: true },
  });

  return projectToViewModel(item);
});
