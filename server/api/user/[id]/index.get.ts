import { getValidatedParamsId, userToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Returns information about a specific user by their ID. Requires user.all.view permission.
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
 *     responses:
 *       200:
 *         description: User information
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
    rights: ['user.all.view'] 
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findUser = await prisma.user.findUnique({ where: { id } });
  if (!findUser)
    throw createError({
      statusCode: 404
    });

  return userToViewModel(findUser);
});
