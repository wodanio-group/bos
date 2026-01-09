import { optionToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/option:
 *   get:
 *     summary: List all options
 *     description: Returns a list of all application configuration options. Requires option.all.view permission.
 *     tags: [Options]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of options
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OptionViewModel'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event);
  const hasAllViewRight = hasRoleRights(user.role, ['option.all.view']);

  return (await prisma.option.findMany({
    where: {
      ...(hasAllViewRight ? {} : { public: true }),
    },
    orderBy: {
      key: 'asc'
    }
  })).map(o => optionToViewModel(o));
});
