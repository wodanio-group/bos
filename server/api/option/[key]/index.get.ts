import { optionToViewModel, optionKeyValidator } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { authMiddleware } from "~~/server/utils/auth";
import { getRouterParams } from "h3";
import { z } from "zod";

/**
 * @swagger
 * /api/option/{key}:
 *   get:
 *     summary: Get an option by key
 *     description: Returns information about a specific option by its key. Requires option.all.view permission.
 *     tags: [Options]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/OptionKey'
 *         description: Option key
 *     responses:
 *       200:
 *         description: Option information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OptionViewModel'
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
  await authMiddleware(event, {
    rights: ['option.all.view']
  });

  const params = z.object({
    key: optionKeyValidator
  }).safeParse(getRouterParams(event));

  if (!params.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: params.error.flatten().fieldErrors,
    });

  const findOption = await prisma.option.findUnique({
    where: { key: params.data.key }
  });

  if (!findOption)
    throw createError({
      statusCode: 404
    });

  return optionToViewModel(findOption);
});
