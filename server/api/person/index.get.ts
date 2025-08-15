import { authMiddleware, personToViewModel } from "#imports";
import prisma from "~~/lib/prisma";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['contact.all.view'] 
  });

  const query = z.object({
    take: z.number().default(100),
    page: z.number().default(1),
  }).safeParse(getQuery(event));

  if (!query.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: query.error.flatten().fieldErrors,
    });

  return (await prisma.person.findMany({
    take: query.data.take,
    skip: ((query.data.page - 1) * query.data.take),
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      companyPersons: true,
      contactCommunicationWays: true,
      contactAddresses: true,
      contactNotes: true
    },
  })).map(o => personToViewModel(o));
});
