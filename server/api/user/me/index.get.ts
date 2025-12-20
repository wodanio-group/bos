import { userToViewModel } from "#imports";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get current user
 *     description: Returns information about the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserViewModel'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export default defineEventHandler(async (event) => {
  return userToViewModel(await authMiddleware(event));
});
