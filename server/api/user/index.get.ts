import { userToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['user.all.view'] 
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

  return (await prisma.user.findMany({
    take: query.data.take,
    skip: ((query.data.page - 1) * query.data.take),
    where: { AND: [

      ...(query.data.search ? [{ OR: [
        { email: { contains: query.data.search } },
        { displayName: { contains: query.data.search } },
      ] }] : []),

    ] },
    orderBy: {
      createdAt: 'desc'
    }
  })).map(o => userToViewModel(o));
});
