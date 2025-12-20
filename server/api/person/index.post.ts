import {
  personToViewModel,
  contactGenderValidator,
  contactNoteValidator,
  contactCommunicationWayValidator,
  contactAddressValidator
} from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import _ from "lodash";
import { queue } from "../../utils/queue";
import { getImportListIds } from "../../utils/listmonk";

/**
 * @swagger
 * /api/person:
 *   post:
 *     summary: Create a new person
 *     description: Creates a new person with optional companies, communication ways, addresses, and notes. Requires contact.all.create permission. Email addresses are automatically subscribed to Listmonk.
 *     tags: [Persons]
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
 *               externalId:
 *                 type: string
 *                 nullable: true
 *                 description: External identifier for the person
 *               firstname:
 *                 type: string
 *                 nullable: true
 *                 description: First name of the person
 *               surename:
 *                 type: string
 *                 nullable: true
 *                 description: Sure name (middle name) of the person
 *               familyname:
 *                 type: string
 *                 nullable: true
 *                 description: Family name (last name) of the person
 *               gender:
 *                 type: string
 *                 nullable: true
 *                 description: Gender of the person
 *               birthdayAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Birthday of the person
 *               companies:
 *                 type: array
 *                 default: []
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Company ID
 *                     main:
 *                       type: boolean
 *                       default: false
 *                       description: Whether this is the main company association
 *                     role:
 *                       type: string
 *                       nullable: true
 *                       description: Role at the company
 *               communicationWays:
 *                 type: array
 *                 default: []
 *                 items:
 *                   type: object
 *                   description: Communication methods (email, phone, etc.)
 *               addresses:
 *                 type: array
 *                 default: []
 *                 items:
 *                   type: object
 *                   description: Physical addresses
 *               notes:
 *                 type: array
 *                 default: []
 *                 items:
 *                   type: object
 *                   description: Notes about the person
 *     responses:
 *       200:
 *         description: Successfully created person
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
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['contact.all.create'] 
  });

  const body = z.object({
    externalId: z.string().trim().optional().nullable(),
    firstname: z.string().trim().optional().nullable(),
    surename: z.string().trim().optional().nullable(),
    familyname: z.string().trim().optional().nullable(),
    gender: contactGenderValidator.optional().nullable(),
    birthdayAt: z.string().trim().datetime().optional().nullable(),
    companies: z.array(z.object({
      id: z.string().uuid(),
      main: z.boolean().default(false),
      role: z.string().optional().nullable(),
    })).default([]),
    communicationWays: z.array(contactCommunicationWayValidator).default([]),
    addresses: z.array(contactAddressValidator).default([]),
    notes: z.array(contactNoteValidator).default([]),
  }).safeParse(await readBody(event));

  if (!body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body.error.flatten().fieldErrors,
    });

  const countryIsoCodes = _.uniq(body.data.addresses.map(o => o.country).flat()),
        countryCount    = await prisma.country.count({ where: { isoCode: { in: countryIsoCodes } } });
  if (countryIsoCodes.length !== countryCount)
    throw createError({
      status: 400,
      statusMessage: 'No valid countries'
    });

  const item = await prisma.person.create({
    data: {
      externalId: body.data.externalId,
      firstname: body.data.firstname,
      surename: body.data.surename,
      familyname: body.data.familyname,
      gender: body.data.gender ?? undefined,
      birthdayAt: body.data.birthdayAt,
      companyPersons: {
        create: body.data.companies.map(o => ({
          companyId: o.id,
          main: (o.main === true),
          role: o.role,
        }))
      },
      contactCommunicationWays: {
        create: body.data.communicationWays.map(o => ({
          type: o.type,
          category: o.category,
          value: o.value,
        }))
      },
      contactAddresses: {
        create: body.data.addresses.map(o => ({
          category: o.category,
          address: o.address,
          address2: o.address2,
          address3: o.address3,
          address4: o.address4,
          zipCode: o.zipCode,
          city: o.city,
          country: {
            connect: {
              isoCode: o.country,
            }
          }
        }))
      },
      contactNotes: {
        create: body.data.notes.map(o => ({
          type: o.type,
          timestamp: o.timestamp,
          content: o.content
        }))
      },
    },
    include: {
      companyPersons: true,
      contactCommunicationWays: true,
      contactAddresses: true,
      contactNotes: true
    },
  });

  for (const email of item.contactCommunicationWays.filter(o => o.type === 'EMAIL' && o.value !== null && o.value.length > 0).map(o => o.value)) {
    await queue.add('listmonk.subscription.add', {
      email,
      name: personDisplayName(item),
      listIds: getImportListIds(),
    });
  }

  return personToViewModel(item);
});
