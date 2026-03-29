import bcrypt from "bcryptjs";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";

/**
 * @swagger
 * /api/user/me/dav-password:
 *   put:
 *     summary: Set or update CardDAV password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password set successfully
 */
export default defineEventHandler(async (event) => {
  const authUser = await authMiddleware(event);

  const body = await readBody(event);
  const parsed = z.object({
    password: z.string().min(8),
  }).safeParse(body);

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' });
  }

  const davPasswordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({ where: { id: authUser.id }, data: { davPasswordHash } });

  return { isSet: true };
});
