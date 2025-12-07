import { timeTrackingActivityToViewModel } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { authMiddleware } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event, {
    rights: ['timetracking.all.edit', 'timetracking.own.create'] 
  });
  return timeTrackingActivityToViewModel((await prisma.timeTrackingActivity.findFirst({
    where: {
      user: { id: user.id },
      to: null,
    },
    include: {
      user: true,
    },
  })) ?? (await prisma.timeTrackingActivity.create({
    data: {
      userId: user.id,
      from: new Date(),
    },
    include: {
      user: true,
    },
  })));
});
