import {
  companyToViewModel,
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
 * /api/company/{id}:
 *   patch:
 *     summary: Update a company
 *     description: Updates an existing company's information including associated persons, communication ways, addresses, and notes. Only provided fields will be updated. Requires contact.all.create permission.
 *     tags: [Companies]
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
 *         description: Company ID
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
 *                 description: External system identifier
 *               name:
 *                 type: string
 *                 nullable: true
 *                 description: Primary company name
 *               name2:
 *                 type: string
 *                 nullable: true
 *                 description: Secondary company name
 *               taxId:
 *                 type: string
 *                 nullable: true
 *                 description: Tax identification number
 *               vatId:
 *                 type: string
 *                 nullable: true
 *                 description: VAT identification number
 *               persons:
 *                 type: array
 *                 nullable: true
 *                 items:
 *                   type: object
 *                   required: [id]
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Person ID
 *                     main:
 *                       type: boolean
 *                       default: false
 *                       description: Whether this is the main contact person
 *                     role:
 *                       type: string
 *                       nullable: true
 *                       description: Person's role in the company
 *               communicationWays:
 *                 type: array
 *                 nullable: true
 *                 description: Contact communication methods (replaces existing)
 *               addresses:
 *                 type: array
 *                 nullable: true
 *                 description: Company addresses (replaces existing)
 *               notes:
 *                 type: array
 *                 nullable: true
 *                 description: Company notes (replaces existing)
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyViewModel'
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
    rights: ['contact.all.create'] 
  });

  const id = getValidatedParamsId(event);
  const body = z.object({
    externalId: z.string().trim().optional().nullable(),
    name: z.string().trim().optional().nullable(),
    name2: z.string().trim().optional().nullable(),
    taxId: z.string().trim().optional().nullable(),
    vatId: z.string().trim().optional().nullable(),
    persons: z.array(z.object({
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

  const findItem = await prisma.company.findUnique({
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

  const item = await prisma.company.update({
    where: { id },
    data: {
      externalId: body.data.externalId,
      name: body.data.name,
      name2: body.data.name2,
      taxId: body.data.taxId,
      vatId: body.data.vatId,
      companyPersons: !body.data.persons ? {} : {
        create: body.data.persons
          .filter(o => !findItem.companyPersons.find(oo => o.id === oo.personId))
          .map(o => ({
            personId: o.id,
            main: o.main,
            role: o.role,
          })),
        deleteMany: findItem.companyPersons
          .filter(o => !body.data.persons?.find(oo => o.personId === oo.id))
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
  await queue.add('pes.customer.upsert', { companyId: item.id });
  
  for (const email of item.contactCommunicationWays.filter(o => o.type === 'EMAIL' && o.value !== null && o.value.length > 0).map(o => o.value)) {
    await queue.add('listmonk.subscription.add', {
      email,
      name: companyDisplayName(item),
      listIds: getImportListIds(),
    });
  }

  return companyToViewModel(item);
});
