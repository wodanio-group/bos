import { personToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";
import { authMiddleware } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/person/{id}:
 *   get:
 *     summary: Get a person by ID
 *     description: Returns a single person with their associated companies, communication ways, addresses, and notes. Requires contact.all.view permission.
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
 *         description: Person details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonViewModel'
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
    rights: ['contact.all.view'] 
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.person.findUnique({
    where: { id },
    include: {
      companyPersons: true,
      contactCommunicationWays: true,
      contactAddresses: true,
      contactNotes: true
    },
  });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  return personToViewModel(findItem);
});
