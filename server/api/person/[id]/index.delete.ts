import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";

/**
 * @swagger
 * /api/person/{id}:
 *   delete:
 *     summary: Delete a person
 *     description: Deletes a person and all associated data (companies, communication ways, addresses, notes). Requires contact.all.delete permission.
 *     tags: [Persons]
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
 *         description: The person ID
 *     responses:
 *       200:
 *         description: Person successfully deleted
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
 *         description: Person not found
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['contact.all.delete'] 
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.person.findUnique({ where: { id } });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  await prisma.person.delete({ where: { id } });

  return { message: 'OK' };
});
