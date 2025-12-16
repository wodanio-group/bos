import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";
import { getRightsByUserRole } from "#imports";

export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event, {
    rights: ['user.token.all.delete', 'user.token.own.delete']
  });

  const params = z.object({
    id: z.string().uuid()
  }).safeParse(event.context.params);

  if (!params.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid token ID',
    });

  const existingToken = await prisma.userToken.findUnique({
    where: { id: params.data.id }
  });

  if (!existingToken)
    throw createError({
      statusCode: 404,
      statusMessage: 'User token not found',
    });

  // Check if user has permission to delete all tokens or only their own
  const hasAllDeletePermission = user && getRightsByUserRole(user.role).includes('user.token.all.delete');
  if (!hasAllDeletePermission && existingToken.userId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied',
    });
  }

  await prisma.userToken.delete({
    where: { id: params.data.id }
  });

  return { success: true };
});
