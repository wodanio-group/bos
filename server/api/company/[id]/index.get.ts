import { authMiddleware, companyToViewModel } from "#imports";
import prisma from "~~/lib/prisma";
import { getValidatedParamsId } from "~~/shared/utils/default";

export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['contact.all.view'] 
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const findItem = await prisma.company.findUnique({
    where: { id },
    include: {
      companyPersons: true,
      contactCommunicationWays: true,
      contactAddresses: true,
      contactNotes: true
    },
  });
  if (!findItem)
    throw createError({
      statusCode: 404
    });

  return companyToViewModel(findItem);
});
