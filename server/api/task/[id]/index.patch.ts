import { taskToViewModel, taskTypeValidator } from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { getRightsByUserRole } from "~~/shared/utils/user";

/**
 * @swagger
 * /api/task/{id}:
 *   patch:
 *     summary: Update a task
 *     description: Updates an existing task. Requires task.all.edit or task.own.edit permission. If user has only task.own.edit, userId will be forced to the logged-in user if provided.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *                 description: ID of the user assigned to this task (optional, forced to logged-in user if user has only task.own.edit)
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
 *         description: Successfully updated task
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
    rights: ['task.all.edit', 'task.own.edit']
  });

  const id = getValidatedParamsId(event);
  const body = z.object({
    type: taskTypeValidator.optional(),
    name: z.string().trim().min(1).optional(),
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

  if (!id || !body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body?.error?.flatten()?.fieldErrors,
    });

  const findItem = await prisma.task.findUnique({ where: { id } });
  if (!findItem)
    throw createError({ statusCode: 404 });

  // Check if user has permission to edit this task
  const userRights = getRightsByUserRole(user.role);
  const hasAllEdit = userRights.includes('task.all.edit');
  const hasOwnEdit = userRights.includes('task.own.edit');

  if (!hasAllEdit && hasOwnEdit && findItem.userId !== user.id)
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    });

  // Determine userId based on permissions
  let targetUserId: string | undefined;
  if (body.data.userId !== undefined) {
    if (!hasAllEdit && hasOwnEdit) {
      // User has only task.own.edit - force to logged-in user
      targetUserId = user.id;
    } else {
      // User has task.all.edit - use provided userId or keep unchanged
      targetUserId = body.data.userId;
    }

    // Verify the target user exists if userId is being changed
    if (targetUserId) {
      const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!targetUser)
        throw createError({
          statusCode: 400,
          statusMessage: 'User not found',
        });
    }
  }

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

  const item = await prisma.task.update({
    where: { id },
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
