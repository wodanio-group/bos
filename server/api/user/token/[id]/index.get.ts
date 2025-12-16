import { userTokenToViewModel, getRightsByUserRole } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event, {
    rights: ['user.token.all.view', 'user.token.own.view']
  });

  const params = z.object({
    id: z.string().uuid()
  }).safeParse(event.context.params);

  if (!params.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid token ID',
    });

  const userToken = await prisma.userToken.findUnique({
    where: { id: params.data.id }
  });

  if (!userToken)
    throw createError({
      statusCode: 404,
      statusMessage: 'User token not found',
    });

  // Check if user has permission to view all tokens or only their own
  const hasAllViewPermission = user && getRightsByUserRole(user.role).includes('user.token.all.view');
  if (!hasAllViewPermission && userToken.userId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied',
    });
  }

  return userTokenToViewModel(userToken);
});
