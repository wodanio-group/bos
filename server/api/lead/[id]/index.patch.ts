import { leadToViewModel } from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";

/**
 * @swagger
 * /api/lead/{id}:
 *   patch:
 *     summary: Update a lead
 *     description: Updates an existing lead. Requires lead.all.edit permission.
 *     tags: [Leads]
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
 *         description: The lead ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 nullable: true
 *               familyname:
 *                 type: string
 *                 nullable: true
 *               companyName:
 *                 type: string
 *                 nullable: true
 *               jobTitle:
 *                 type: string
 *                 nullable: true
 *               email:
 *                 type: string
 *                 format: email
 *                 nullable: true
 *               phoneNumber:
 *                 type: string
 *                 nullable: true
 *               mobileNumber:
 *                 type: string
 *                 nullable: true
 *               note:
 *                 type: string
 *                 nullable: true
 *               internalNote:
 *                 type: string
 *                 nullable: true
 *               ownerId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               leadStatusId:
 *                 type: string
 *                 format: uuid
 *               companyId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               personId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               campaignId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Successfully updated lead
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeadViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Lead not found
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['lead.all.edit']
  });

  const id = getValidatedParamsId(event);
  const body = z.object({
    firstname: z.string().trim().optional().nullable(),
    familyname: z.string().trim().optional().nullable(),
    companyName: z.string().trim().optional().nullable(),
    jobTitle: z.string().trim().optional().nullable(),
    email: z.string().email().trim().optional().nullable(),
    phoneNumber: z.string().trim().optional().nullable(),
    mobileNumber: z.string().trim().optional().nullable(),
    note: z.string().trim().optional().nullable(),
    internalNote: z.string().trim().optional().nullable(),
    ownerId: z.string().uuid().optional().nullable(),
    leadStatusId: z.string().uuid().optional(),
    companyId: z.string().uuid().optional().nullable(),
    personId: z.string().uuid().optional().nullable(),
    campaignId: z.string().uuid().optional().nullable(),
  }).safeParse(await readBody(event));

  if (!id || !body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body?.error?.flatten()?.fieldErrors,
    });

  const findItem = await prisma.lead.findUnique({ where: { id } });
  if (!findItem)
    throw createError({ statusCode: 404 });

  // Verify referenced entities exist if they are being updated
  if (body.data.ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: body.data.ownerId } });
    if (!owner)
      throw createError({
        statusCode: 400,
        statusMessage: 'Owner user not found',
      });
  }

  if (body.data.leadStatusId) {
    const leadStatus = await prisma.leadStatus.findUnique({ where: { id: body.data.leadStatusId } });
    if (!leadStatus)
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead status not found',
      });
  }

  if (body.data.companyId) {
    const company = await prisma.company.findUnique({ where: { id: body.data.companyId } });
    if (!company)
      throw createError({
        statusCode: 400,
        statusMessage: 'Company not found',
      });
  }

  if (body.data.personId) {
    const person = await prisma.person.findUnique({ where: { id: body.data.personId } });
    if (!person)
      throw createError({
        statusCode: 400,
        statusMessage: 'Person not found',
      });
  }

  if (body.data.campaignId) {
    const campaign = await prisma.campaign.findUnique({ where: { id: body.data.campaignId } });
    if (!campaign)
      throw createError({
        statusCode: 400,
        statusMessage: 'Campaign not found',
      });
  }

  const item = await prisma.lead.update({
    where: { id },
    data: {
      firstname: body.data.firstname,
      familyname: body.data.familyname,
      companyName: body.data.companyName,
      jobTitle: body.data.jobTitle,
      email: body.data.email,
      phoneNumber: body.data.phoneNumber,
      mobileNumber: body.data.mobileNumber,
      note: body.data.note,
      internalNote: body.data.internalNote,
      ownerId: body.data.ownerId,
      leadStatusId: body.data.leadStatusId,
      companyId: body.data.companyId,
      personId: body.data.personId,
      campaignId: body.data.campaignId,
    },
  });

  return leadToViewModel(item);
});
