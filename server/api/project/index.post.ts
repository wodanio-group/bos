import { projectToViewModel, projectNoteValidator, projectMemberRoleValidator, projectStatusValidator } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/project:
 *   post:
 *     summary: Create a new project
 *     description: Creates a new project. Requires project.all.create permission.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
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
 *                 items:
 *                   type: object
 *                   required: [userId, role]
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     role:
 *                       $ref: '#/components/schemas/ProjectMemberRole'
 *               notes:
 *                 type: array
 *     responses:
 *       200:
 *         description: Project created
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
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, { rights: ['project.all.create'] });

  const body = z.object({
    name: z.string().trim().min(1),
    status: projectStatusValidator,
    description: z.string().trim().optional().nullable(),
    companyId: z.string().uuid().optional().nullable(),
    members: z.array(z.object({
      userId: z.string().uuid(),
      role: projectMemberRoleValidator,
    })).default([]),
    notes: z.array(projectNoteValidator).default([]),
  }).safeParse(await readBody(event));

  if (!body.success)
    throw createError({ statusCode: 400, statusMessage: 'Validation failed', data: body.error.flatten().fieldErrors });

  if (body.data.companyId) {
    const companyExists = await prisma.company.findUnique({ where: { id: body.data.companyId } });
    if (!companyExists)
      throw createError({ statusCode: 400, statusMessage: 'Company not found' });
  }

  const item = await prisma.project.create({
    data: {
      name: body.data.name,
      status: body.data.status,
      description: body.data.description,
      companyId: body.data.companyId,
      members: {
        create: body.data.members.map(m => ({ userId: m.userId, role: m.role })),
      },
      notes: {
        create: body.data.notes.map(n => ({ type: n.type, timestamp: n.timestamp, content: n.content })),
      },
    },
    include: { members: { include: { user: true } }, notes: true, company: true },
  });

  return projectToViewModel(item);
});
