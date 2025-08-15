import { authMiddleware } from "#imports";
import prisma from "~~/lib/prisma";
import { countryToViewModel } from "~~/shared/utils/contact";

export default defineEventHandler(async (event) => {
  await authMiddleware(event);

  return (await prisma.country.findMany({
    orderBy: {
      isoCode: 'desc'
    }
  })).map(o => countryToViewModel(o));
});
