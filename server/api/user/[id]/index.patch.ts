import { userToViewModel, userRoleValidator, getValidatedParamsId } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";
import { authMiddleware } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['user.all.create'] 
  });

  const id = getValidatedParamsId(event);
  const body = z.object({
    email: z.string().trim().email(),
    displayName: z.string().trim().optional().nullable(),
    role: userRoleValidator,
  }).safeParse(await readBody(event));

  if (!id || !body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body?.error?.flatten()?.fieldErrors,
    });

  const findUser = await prisma.user.findUnique({ where: { id } });
  if (!findUser)
    throw createError({
      statusCode: 404
    });

  return userToViewModel(await prisma.user.update({
    where: { id },
    data: {
      email: body.data.email,
      displayName: body.data.displayName,
      role: body.data.role,
    }
  }));
});
