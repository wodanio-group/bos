import { campaignToViewModel } from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";

/**
 * @swagger
 * /api/campaign:
 *   post:
 *     summary: Create a new campaign
 *     description: Creates a new campaign. Requires campaign.all.create permission.
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alias
 *               - name
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
 *                 default: false
 *                 description: Whether public users can create leads for this campaign
 *     responses:
 *       200:
 *         description: Successfully created campaign
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
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['campaign.all.create']
  });

  const body = z.object({
    alias: z.string().trim().min(1),
    name: z.string().trim().min(1),
    shortDescription: z.string().trim().optional().nullable(),
    allowPublicCreation: z.boolean().default(false),
  }).safeParse(await readBody(event));

  if (!body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body.error.flatten().fieldErrors,
    });

  // Check if alias is unique
  const existingCampaign = await prisma.campaign.findUnique({
    where: { alias: body.data.alias }
  });

  if (existingCampaign)
    throw createError({
      statusCode: 400,
      statusMessage: 'Campaign alias already exists',
    });

  const item = await prisma.campaign.create({
    data: {
      alias: body.data.alias,
      name: body.data.name,
      shortDescription: body.data.shortDescription,
      allowPublicCreation: body.data.allowPublicCreation,
    },
  });

  return campaignToViewModel(item);
});
