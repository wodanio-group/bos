import { hasRoleRights, timeTrackingActivityToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event, {
    rights: ['timetracking.all.view', 'timetracking.own.view'] 
  });
  const allAllowed = hasRoleRights(user.role, ['timetracking.all.view']);

  const query = z.object({
    take: z.coerce.number().default(100),
    page: z.coerce.number().default(1),
    search: z.string().optional().nullable(),
    isRunning: z.coerce.boolean().default(false),
    isNotRunning: z.coerce.boolean().default(false),
    userId: z.string().uuid().optional().nullable(),
    companyId: z.string().uuid().optional().nullable(),
  }).safeParse(getQuery(event));

  if (!query.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: query.error.flatten().fieldErrors,
    });

  return (await prisma.timeTrackingActivity.findMany({
    take: query.data.take,
    skip: ((query.data.page - 1) * query.data.take),
    where: { AND: [

      ...(allAllowed ? [] : [{
        user: { id: user.id }
      }]),

      ...(query.data.userId ? [{
        user: { id: query.data.userId }
      }] : []),
      ...(query.data.companyId ? [{
        company: { id: query.data.companyId }
      }] : []),

      ...((query.data.isRunning === true) ? [{
        to: null
      }] : []),
      ...((query.data.isNotRunning === true) ? [{
        to: { not: null }
      }] : []),

      ...(query.data.search ? [{ OR: [
        { description: { contains: query.data.search } },
      ] }] : []),

    ] },
    orderBy: {
      from: 'desc'
    },
    include: {
      user: true,
      company: true,
    },
  })).map(o => timeTrackingActivityToViewModel(o));
});
