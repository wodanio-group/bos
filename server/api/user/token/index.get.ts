import { userTokenToViewModel, getRightsByUserRole } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event, {
    rights: ['user.token.all.view', 'user.token.own.view']
  });

  const query = z.object({
    take: z.coerce.number().default(100),
    page: z.coerce.number().default(1),
    search: z.string().optional().nullable(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    userId: z.string().optional().nullable(),
  }).safeParse(getQuery(event));

  if (!query.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: query.error.flatten().fieldErrors,
    });

  // Check if user has permission to view all tokens or only their own
  const hasAllViewPermission = user && getRightsByUserRole(user.role).includes('user.token.all.view');
  const userIdFilter = hasAllViewPermission
    ? (query.data.userId ? query.data.userId : undefined)
    : user.id;

  return (await prisma.userToken.findMany({
    take: query.data.take,
    skip: ((query.data.page - 1) * query.data.take),
    where: { AND: [

      // Filter by userId if specified or if user only has own.view permission
      ...(userIdFilter ? [{ userId: userIdFilter }] : []),

      // Search filter
      ...(query.data.search ? [{ OR: [
        { name: { contains: query.data.search } },
        { id: { contains: query.data.search } },
      ] }] : []),

    ] },
    orderBy: {
      [query.data.sortBy]: query.data.sortOrder
    }
  })).map(o => userTokenToViewModel(o));
});
