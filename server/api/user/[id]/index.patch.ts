import { userToViewModel, userRoleValidator, getValidatedParamsId } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/user/{id}:
 *   patch:
 *     summary: Update a user
 *     description: Updates a user's information including email, display name, and role. Requires user.all.create permission.
 *     tags: [Users]
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
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               displayName:
 *                 type: string
 *                 nullable: true
 *                 description: User's display name
 *               role:
 *                 type: string
 *                 description: User's role
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserViewModel'
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
  await authMiddleware(event, {
    rights: ['user.all.create'] 
  });

  const id = getValidatedParamsId(event);
  const body = z.object({
    email: z.string().trim().email(),
    displayName: z.string().trim().optional().nullable(),
    role: userRoleValidator,
  }).safeParse(await readBody(event));

  if (!id || !body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body?.error?.flatten()?.fieldErrors,
    });

  const findUser = await prisma.user.findUnique({ where: { id } });
  if (!findUser)
    throw createError({
      statusCode: 404
    });

  return userToViewModel(await prisma.user.update({
    where: { id },
    data: {
      email: body.data.email,
      displayName: body.data.displayName,
      role: body.data.role,
    }
  }));
});
