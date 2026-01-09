import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";
import type { StatsItem } from "~~/shared/types/stats";

/**
 * @swagger
 * /api/stats:
 *   post:
 *     summary: Get statistics
 *     description: Returns statistics for the requested keys. Requires contact.all.view permission.
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               keys:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/StatsKey'
 *                 description: Array of statistics keys to retrieve
 *             required:
 *               - keys
 *           example:
 *             keys: ["TOTAL_COMPANY_COUNT", "TOTAL_PERSON_COUNT"]
 *     responses:
 *       200:
 *         description: Array of statistics items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StatsItem'
 *             example:
 *               - key: "TOTAL_COMPANY_COUNT"
 *                 value: 42
 *               - key: "TOTAL_PERSON_COUNT"
 *                 value: 123
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event);

  const body = z.object({
    keys: z.array(z.enum(['TOTAL_COMPANY_COUNT', 'TOTAL_PERSON_COUNT'])),
  }).safeParse(await readBody(event));

  if (!body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body.error.flatten().fieldErrors,
    });

  const results: StatsItem[] = [];

  // Process each requested stat key
  for (const key of body.data.keys) {
    let value: number | null = null;
    switch (key) {
      case 'TOTAL_COMPANY_COUNT':
        value = hasRoleRights(user.role, ['contact.all.view'])
          ? (await prisma.company.count())
          : null;
        break;
      case 'TOTAL_PERSON_COUNT':
        value = hasRoleRights(user.role, ['contact.all.view'])
          ? (await prisma.person.count())
          : null;
        break;
    }
    results.push({ key, value });
  }

  return results;
});
