import { authMiddleware, companyToViewModel } from "#imports";
import prisma from "~~/lib/prisma";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['contact.all.view'] 
  });

  const query = z.object({
    take: z.coerce.number().default(100),
    page: z.coerce.number().default(1),
    search: z.string().optional().nullable(),
  }).safeParse(getQuery(event));

  if (!query.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: query.error.flatten().fieldErrors,
    });

  return (await prisma.company.findMany({
    take: query.data.take,
    skip: ((query.data.page - 1) * query.data.take),
    where: { AND: [

      ...(query.data.search ? [{ OR: [
        { externalId: { contains: query.data.search } },
        { name: { contains: query.data.search } },
        { name2: { contains: query.data.search } },
        { customerId: { contains: query.data.search } },
        { vatId: { contains: query.data.search } },
        { taxId: { contains: query.data.search } },
        { contactCommunicationWays: { some: { value: { contains: query.data.search } } } },
        { contactAddresses: { some: { address: { contains: query.data.search } } } },
        { contactAddresses: { some: { address2: { contains: query.data.search } } } },
        { contactAddresses: { some: { address3: { contains: query.data.search } } } },
        { contactAddresses: { some: { address4: { contains: query.data.search } } } },
        { contactAddresses: { some: { zipCode: { contains: query.data.search } } } },
        { contactAddresses: { some: { city: { contains: query.data.search } } } },
      ] }] : []),

    ] },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      companyPersons: true,
      contactCommunicationWays: true,
      contactAddresses: true,
      contactNotes: true
    },
  })).map(o => companyToViewModel(o));
});
