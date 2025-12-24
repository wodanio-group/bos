import { campaignToViewModel } from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";

/**
 * @swagger
 * /api/campaign/{id}:
 *   patch:
 *     summary: Update a campaign
 *     description: Updates an existing campaign. Requires campaign.all.edit permission.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alias:
 *                 type: string
 *                 description: Unique alias/slug for the campaign
 *               name:
 *                 type: string
 *                 description: Campaign name
 *               shortDescription:
 *                 type: string
 *                 nullable: true
 *                 description: Brief description of the campaign
 *               allowPublicCreation:
 *                 type: boolean
 *                 description: Whether public users can create leads for this campaign
 *     responses:
 *       200:
 *         description: Successfully updated campaign
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CampaignViewModel'
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
    rights: ['campaign.all.edit']
  });

  const id = getValidatedParamsId(event);
  const body = z.object({
    alias: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    shortDescription: z.string().trim().optional().nullable(),
    allowPublicCreation: z.boolean().optional(),
  }).safeParse(await readBody(event));

  if (!id || !body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body?.error?.flatten()?.fieldErrors,
    });

  const findItem = await prisma.campaign.findUnique({ where: { id } });
  if (!findItem)
    throw createError({ statusCode: 404 });

  // Check if new alias is unique (if alias is being changed)
  if (body.data.alias && body.data.alias !== findItem.alias) {
    const existingCampaign = await prisma.campaign.findUnique({
      where: { alias: body.data.alias }
    });

    if (existingCampaign)
      throw createError({
        statusCode: 400,
        statusMessage: 'Campaign alias already exists',
      });
  }

  const item = await prisma.campaign.update({
    where: { id },
    data: {
      alias: body.data.alias,
      name: body.data.name,
      shortDescription: body.data.shortDescription,
      allowPublicCreation: body.data.allowPublicCreation,
    },
  });

  return campaignToViewModel(item);
});
