import { authMiddleware, userToViewModel } from "#imports";
import prisma from "~~/lib/prisma";
import { z } from "zod";
import { userRoleValidator } from "~~/shared/utils/user";

export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['user.all.create'] 
  });

  const body = z.object({
    email: z.string().trim().email(),
    displayName: z.string().trim().optional().nullable(),
    role: userRoleValidator,
  }).safeParse(await readBody(event));

  if (!body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body.error.flatten().fieldErrors,
    });

  const user = await prisma.user.create({
    data: {
      email: body.data.email,
      displayName: body.data.displayName,
      role: body.data.role,
    }
  });

  return userToViewModel(user);
});
