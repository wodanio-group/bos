import { 
  authMiddleware, 
  companyToViewModel,
  contactNoteValidator, 
  contactCommunicationWayValidator, 
  contactAddressValidator,
  compareContactCommunicationWay,
  compareContactAddress,
  compareContactNote,
} from "#imports";
import prisma from "~~/lib/prisma";
import { z } from "zod";

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

  const countryIsoCodes = body.data.addresses?.map(o => o.country)?.flat() ?? [],
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

  return companyToViewModel(item);
});
