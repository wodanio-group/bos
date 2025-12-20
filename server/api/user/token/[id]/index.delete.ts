import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";
import { getRightsByUserRole } from "#imports";

/**
 * @swagger
 * /api/user/token/{id}:
 *   delete:
 *     summary: Delete a user token
 *     description: Deletes a user token by its ID. Users with user.token.all.delete permission can delete any token, while users with user.token.own.delete can only delete their own tokens.
 *     tags: [User Tokens]
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
 *         description: Token ID
 *     responses:
 *       200:
 *         description: Token deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
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
  const user = await authMiddleware(event, {
    rights: ['user.token.all.delete', 'user.token.own.delete']
  });

  const params = z.object({
    id: z.string().uuid()
  }).safeParse(event.context.params);

  if (!params.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid token ID',
    });

  const existingToken = await prisma.userToken.findUnique({
    where: { id: params.data.id }
  });

  if (!existingToken)
    throw createError({
      statusCode: 404,
      statusMessage: 'User token not found',
    });

  // Check if user has permission to delete all tokens or only their own
  const hasAllDeletePermission = user && getRightsByUserRole(user.role).includes('user.token.all.delete');
  if (!hasAllDeletePermission && existingToken.userId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied',
    });
  }

  await prisma.userToken.delete({
    where: { id: params.data.id }
  });

  return { success: true };
});
