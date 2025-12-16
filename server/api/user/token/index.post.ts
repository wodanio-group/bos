import { userTokenToViewModel, getRightsByUserRole } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const user = await authMiddleware(event, {
    rights: ['user.token.all.create', 'user.token.own.create']
  });

  const body = await readBody(event);
  const validation = z.object({
    name: z.string().nullable().optional(),
    userId: z.uuid().nullable().optional(),
  }).safeParse(body);

  if (!validation.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: validation.error.flatten().fieldErrors,
    });

  // Check if user has permission to create tokens for all users or only themselves
  const hasAllCreatePermission = user && getRightsByUserRole(user.role).includes('user.token.all.create');
  const targetUserId = validation.data.userId || user.id;

  if (!hasAllCreatePermission && targetUserId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied: Cannot create tokens for other users',
    });
  }

  // Verify target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId }
  });

  if (!targetUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Target user not found',
    });
  }

  const userToken = await prisma.userToken.create({
    data: {
      name: validation.data.name || null,
      userId: targetUserId,
    }
  });

  const token = jwt.sign({
    id: userToken.id,
  }, runtimeConfig.secret);

  return userTokenToViewModel(userToken, token);
});
