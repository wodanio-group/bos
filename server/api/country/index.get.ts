import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { countryToViewModel } from "~~/shared/utils/contact";

export default defineEventHandler(async (event) => {
  await authMiddleware(event);

  return (await prisma.country.findMany({
    orderBy: {
      isoCode: 'desc'
    }
  })).map(o => countryToViewModel(o));
});
