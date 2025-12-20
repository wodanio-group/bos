import {
  personToViewModel,
  contactGenderValidator,
  contactNoteValidator,
  contactCommunicationWayValidator,
  contactAddressValidator,
  compareContactCommunicationWay,
  compareContactAddress,
  compareContactNote,
} from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import _ from "lodash";
import { queue } from "../../../utils/queue";
import { getImportListIds } from "../../../utils/listmonk";

/**
 * @swagger
 * /api/person/{id}:
 *   patch:
 *     summary: Update a person
 *     description: Updates an existing person with optional companies, communication ways, addresses, and notes. The endpoint intelligently merges changes by comparing existing and new data. Requires contact.all.create permission. Email addresses are automatically subscribed to Listmonk.
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
 *                 nullable: true
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
 *                 nullable: true
 *                 items:
 *                   type: object
 *                   description: Communication methods (email, phone, etc.)
 *               addresses:
 *                 type: array
 *                 nullable: true
 *                 items:
 *                   type: object
 *                   description: Physical addresses
 *               notes:
 *                 type: array
 *                 nullable: true
 *                 items:
 *                   type: object
 *                   description: Notes about the person
 *     responses:
 *       200:
 *         description: Successfully updated person
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
    rights: ['contact.all.create'] 
  });

  const id = getValidatedParamsId(event);
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
    })).optional().nullable(),
    communicationWays: z.array(contactCommunicationWayValidator).optional().nullable(),
    addresses: z.array(contactAddressValidator).optional().nullable(),
    notes: z.array(contactNoteValidator).optional().nullable(),
  }).safeParse(await readBody(event));

  if (!id || !body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body?.error?.flatten()?.fieldErrors,
    });

  const findItem = await prisma.person.findUnique({
    where: { id },
    include: {
      companyPersons: true,
      contactCommunicationWays: true,
      contactAddresses: true,
      contactNotes: true,
    },
  });
  if (!findItem)
    throw createError({ statusCode: 404 });

  const countryIsoCodes = _.uniq(body.data.addresses?.map(o => o.country)?.flat() ?? []),
        countryCount    = await prisma.country.count({ where: { isoCode: { in: countryIsoCodes } } });
  if (countryIsoCodes.length !== countryCount)
    throw createError({
      status: 400,
      statusMessage: 'No valid countries'
    });

  const item = await prisma.person.update({
    where: { id },
    data: {
      externalId: body.data.externalId,
      firstname: body.data.firstname,
      surename: body.data.surename,
      familyname: body.data.familyname,
      gender: body.data.gender ?? undefined,
      birthdayAt: body.data.birthdayAt,
      companyPersons: !body.data.companies ? {} : {
        create: body.data.companies
          .filter(o => !findItem.companyPersons.find(oo => o.id === oo.companyId))
          .map(o => ({
            companyId: o.id,
            main: (o.main === true),
            role: o.role,
          })),
        deleteMany: findItem.companyPersons
          .filter(o => !body.data.companies?.find(oo => o.companyId === oo.id))
      },
      contactCommunicationWays: !body.data.communicationWays ? {} : {
        create: body.data.communicationWays
          .filter(o => !findItem.contactCommunicationWays.find(oo => compareContactCommunicationWay(o, oo)))
          .map(o => ({
            type: o.type,
            category: o.category,
            value: o.value,
          })),
        deleteMany: findItem.contactCommunicationWays
          .filter(o => !body.data.communicationWays?.find(oo => compareContactCommunicationWay(o, oo)))
          .map(o => ({
            id: o.id
          }))
      },
      contactAddresses: !body.data.addresses ? {} : {
        create: body.data.addresses
          .filter(o => !findItem.contactAddresses.find(oo => compareContactAddress(o, oo)))
          .map(o => ({
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
          })),
        deleteMany: findItem.contactAddresses
          .filter(o => !body.data.addresses?.find(oo => compareContactAddress(o, oo)))
          .map(o => ({
            id: o.id
          }))
      },
      contactNotes: !body.data.notes ? {} : {
        create: body.data.notes
          .filter(o => !findItem.contactNotes.find(oo => compareContactNote(o, oo)))
          .map(o => ({
            type: o.type,
            timestamp: o.timestamp,
            content: o.content
          })),
        deleteMany: findItem.contactNotes
          .filter(o => !body.data.notes?.find(oo => compareContactNote(o, oo)))
          .map(o => ({
            id: o.id
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
