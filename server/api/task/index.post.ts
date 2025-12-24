import { taskToViewModel, taskTypeValidator } from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { getRightsByUserRole } from "~~/shared/utils/user";

/**
 * @swagger
 * /api/task:
 *   post:
 *     summary: Create a new task
 *     description: Creates a new task. Requires task.all.create or task.own.create permission. If user has only task.own.create, userId will be forced to the logged-in user. If userId is not provided, it defaults to the logged-in user.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *             properties:
 *               type:
 *                 $ref: '#/components/schemas/TaskType'
 *                 description: Type of task
 *               name:
 *                 type: string
 *                 description: Task name or title
 *               content:
 *                 type: string
 *                 nullable: true
 *                 description: Detailed task description
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: When the task should start
 *               dueDateAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Task due date
 *               doneAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: When the task was completed
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user assigned to this task (optional, defaults to logged-in user)
 *               companyId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Associated company ID
 *               personId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Associated person ID
 *               leadId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Associated lead ID
 *               opportunityId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Associated opportunity ID
 *     responses:
 *       200:
 *         description: Successfully created task
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
 */
export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event, {
    rights: ['task.all.create', 'task.own.create']
  });

  const body = z.object({
    type: taskTypeValidator,
    name: z.string().trim().min(1),
    content: z.string().trim().optional().nullable(),
    startAt: z.string().trim().datetime().optional().nullable(),
    dueDateAt: z.string().trim().datetime().optional().nullable(),
    doneAt: z.string().trim().datetime().optional().nullable(),
    userId: z.string().uuid().optional(),
    companyId: z.string().uuid().optional().nullable(),
    personId: z.string().uuid().optional().nullable(),
    leadId: z.string().uuid().optional().nullable(),
    opportunityId: z.string().uuid().optional().nullable(),
  }).safeParse(await readBody(event));

  if (!body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body.error.flatten().fieldErrors,
    });

  // Determine userId based on permissions
  const userRights = getRightsByUserRole(user.role);
  const hasAllCreate = userRights.includes('task.all.create');
  const hasOwnCreate = userRights.includes('task.own.create');

  let targetUserId: string;
  if (!hasAllCreate && hasOwnCreate) {
    // User has only task.own.create - force to logged-in user
    targetUserId = user.id;
  } else {
    // User has task.all.create - use provided userId or default to logged-in user
    targetUserId = body.data.userId ?? user.id;
  }

  // Verify the target user exists
  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser)
    throw createError({
      statusCode: 400,
      statusMessage: 'User not found',
    });

  if (body.data.companyId) {
    const company = await prisma.company.findUnique({ where: { id: body.data.companyId } });
    if (!company)
      throw createError({
        statusCode: 400,
        statusMessage: 'Company not found',
      });
  }

  if (body.data.personId) {
    const person = await prisma.person.findUnique({ where: { id: body.data.personId } });
    if (!person)
      throw createError({
        statusCode: 400,
        statusMessage: 'Person not found',
      });
  }

  if (body.data.leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: body.data.leadId } });
    if (!lead)
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead not found',
      });
  }

  if (body.data.opportunityId) {
    const opportunity = await prisma.opportunity.findUnique({ where: { id: body.data.opportunityId } });
    if (!opportunity)
      throw createError({
        statusCode: 400,
        statusMessage: 'Opportunity not found',
      });
  }

  const item = await prisma.task.create({
    data: {
      type: body.data.type,
      name: body.data.name,
      content: body.data.content,
      startAt: body.data.startAt,
      dueDateAt: body.data.dueDateAt,
      doneAt: body.data.doneAt,
      userId: targetUserId,
      companyId: body.data.companyId,
      personId: body.data.personId,
      leadId: body.data.leadId,
      opportunityId: body.data.opportunityId,
    },
  });

  return taskToViewModel(item);
});
