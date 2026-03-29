import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";

/**
 * @swagger
 * /api/user/me/dav-password:
 *   delete:
 *     summary: Remove CardDAV password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Password removed successfully
 */
export default defineEventHandler(async (event) => {
  const authUser = await authMiddleware(event);
  await prisma.user.update({ where: { id: authUser.id }, data: { davPasswordHash: null } });
  return { isSet: false };
});
