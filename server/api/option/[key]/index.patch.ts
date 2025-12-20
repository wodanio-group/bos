import { optionToViewModel, optionKeyValidator } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { authMiddleware } from "~~/server/utils/auth";
import { getRouterParams } from "h3";
import { z } from "zod";

/**
 * @swagger
 * /api/option/{key}:
 *   patch:
 *     summary: Update an option
 *     description: Updates an option's value. Requires option.all.edit permission.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 $ref: '#/components/schemas/OptionValue'
 *     responses:
 *       200:
 *         description: Option updated successfully
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
    rights: ['option.all.edit']
  });

  const params = z.object({
    key: optionKeyValidator
  }).safeParse(getRouterParams(event));

  const body = z.object({
    value: z.any(),
  }).safeParse(await readBody(event));

  if (!params.success || !body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: {
        ...params?.error?.flatten()?.fieldErrors,
        ...body?.error?.flatten()?.fieldErrors,
      },
    });

  const findOption = await prisma.option.findUnique({
    where: { key: params.data.key }
  });

  if (!findOption)
    throw createError({
      statusCode: 404
    });

  return optionToViewModel(await prisma.option.update({
    where: { key: params.data.key },
    data: {
      value: body.data.value,
    }
  }));
});
