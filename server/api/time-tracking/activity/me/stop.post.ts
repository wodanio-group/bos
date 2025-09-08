import { authMiddleware, timeTrackingActivityToViewModel } from "#imports";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event, {
    rights: ['timetracking.all.edit', 'timetracking.own.create'] 
  });
  const item = (await prisma.timeTrackingActivity.findFirst({
    where: {
      user: { id: user.id },
      to: null,
    },
    include: {
      user: true,
    },
  }));
  if (!item)
    throw createError({ statusCode: 400, statusMessage: 'No running time tracking' });
  return timeTrackingActivityToViewModel((await prisma.timeTrackingActivity.update({
    where: {
      id: item.id,
    },
    data: {
      to: new Date()
    },
  })));
});
