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

  const countryIsoCodes = body.data.addresses.map(o => o.country).flat(),
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

  return personToViewModel(item);
});
