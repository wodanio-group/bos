import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";

/**
 * @swagger
 * /api/campaign/{id}:
 *   delete:
 *     summary: Delete a campaign
 *     description: Deletes a campaign. Requires campaign.all.delete permission.
 *     tags: [Campaigns]
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
 *         description: The campaign ID
 *     responses:
 *       200:
 *         description: Campaign successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OK
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Campaign not found
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['campaign.all.delete']
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.campaign.findUnique({ where: { id } });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  await prisma.campaign.delete({ where: { id } });

  return { message: 'OK' };
});
