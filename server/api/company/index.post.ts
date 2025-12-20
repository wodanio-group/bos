import {
  companyToViewModel,
  contactNoteValidator,
  contactCommunicationWayValidator,
  contactAddressValidator,
} from "#imports";
import { authMiddleware } from "~~/server/utils/auth";
import { increaseCompanyCustomerId, getNextAvailableCompanyCustomerId } from "~~/server/utils/contact";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import _ from "lodash";
import { queue } from "../../utils/queue";
import { getImportListIds } from "../../utils/listmonk";

/**
 * @swagger
 * /api/company:
 *   post:
 *     summary: Create a new company
 *     description: Creates a new company with associated persons, communication ways, addresses, and notes. Automatically generates a customer ID if not provided. Requires contact.all.create permission.
 *     tags: [Companies]
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
 *                 description: External system identifier
 *               customerId:
 *                 type: string
 *                 nullable: true
 *                 description: Customer ID (auto-generated if not provided)
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
 *                 default: []
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
 *                 default: []
 *                 description: Contact communication methods
 *               addresses:
 *                 type: array
 *                 default: []
 *                 description: Company addresses
 *               notes:
 *                 type: array
 *                 default: []
 *                 description: Company notes
 *     responses:
 *       200:
 *         description: Company created successfully
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
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['contact.all.create'] 
  });

  const body = z.object({
    externalId: z.string().trim().optional().nullable(),
    customerId: z.string().trim().optional().nullable(),
    name: z.string().trim().optional().nullable(),
    name2: z.string().trim().optional().nullable(),
    taxId: z.string().trim().optional().nullable(),
    vatId: z.string().trim().optional().nullable(),
    persons: z.array(z.object({
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

  const item = await prisma.company.create({
    data: {
      externalId: body.data.externalId,
      name: body.data.name,
      name2: body.data.name2,
      taxId: body.data.taxId,
      vatId: body.data.vatId,
      customerId: body.data.customerId ?? (await getNextAvailableCompanyCustomerId()),
      companyPersons: {
        create: body.data.persons.map(o => ({
          personId: o.id,
          main: o.main,
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
  await increaseCompanyCustomerId();
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
