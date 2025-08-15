import { authMiddleware, userToViewModel } from "#imports";
import prisma from "~~/lib/prisma";
import { getValidatedParamsId } from "~~/shared/utils/default";

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
