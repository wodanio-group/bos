import { taskToViewModel, taskTypeValidator } from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";

/**
 * @swagger
 * /api/task:
 *   post:
 *     summary: Create a new task
 *     description: Creates a new task. Requires task.all.create or task.own.create permission.
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
 *               - userId
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
 *                 description: ID of the user assigned to this task
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
  await authMiddleware(event, {
    rights: ['task.all.create', 'task.own.create']
  });

  const body = z.object({
    type: taskTypeValidator,
    name: z.string().trim().min(1),
    content: z.string().trim().optional().nullable(),
    startAt: z.string().trim().datetime().optional().nullable(),
    dueDateAt: z.string().trim().datetime().optional().nullable(),
    doneAt: z.string().trim().datetime().optional().nullable(),
    userId: z.string().uuid(),
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

  // Verify referenced entities exist
  const user = await prisma.user.findUnique({ where: { id: body.data.userId } });
  if (!user)
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
      userId: body.data.userId,
      companyId: body.data.companyId,
      personId: body.data.personId,
      leadId: body.data.leadId,
      opportunityId: body.data.opportunityId,
    },
  });

  return taskToViewModel(item);
});
