import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";

/**
 * @swagger
 * /api/user/me/dav-password:
 *   get:
 *     summary: Check if CardDAV password is set
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Whether a DAV password is currently set
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSet:
 *                   type: boolean
 */
export default defineEventHandler(async (event) => {
  const authUser = await authMiddleware(event);
  const user = await prisma.user.findUnique({ where: { id: authUser.id }, select: { davPasswordHash: true } });
  return { isSet: !!user?.davPasswordHash };
});
