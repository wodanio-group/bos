import { authMiddleware } from "#imports";
import prisma from "~~/lib/prisma";
import { getValidatedParamsId } from "~~/shared/utils/default";

export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['contact.all.delete'] 
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.company.findUnique({ where: { id } });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  await prisma.company.delete({ where: { id } });

  return { message: 'OK' };
});
