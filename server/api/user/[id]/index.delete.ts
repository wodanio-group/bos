import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "#imports";

export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['user.all.delete'] 
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findUser = await prisma.user.findUnique({ where: { id } });
  if (!findUser)
    throw createError({
      statusCode: 404
    });

  await prisma.user.delete({ where: { id } })

  return { message: 'OK' };
});
