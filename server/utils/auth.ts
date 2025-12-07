import { z } from "zod";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { createError, getHeader, type H3Event } from "h3";
import type { User } from "~~/lib/prisma.server";
import { useRuntimeConfig } from "#imports";
import type { UserRoleRight } from "~~/shared/types/user";
import { hasRoleRights } from "~~/shared/utils/user";
import { filterString } from "~~/shared/utils/default";
import { prisma } from "~~/lib/prisma.server";

export const getUserFromRequest = async (event: H3Event): Promise<User | null> => {
  try {
    const runtimeConfig = useRuntimeConfig(),
          authHeader = getHeader(event, 'Authorization'),
          headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null,
          cookie = z.object({
            token: z.string()
          }).safeParse(parse(event.node.req.headers.cookie ?? ''));

    if (!cookie.success && !headerToken)
      return null;

    const token = z.object({
        id: z.string()
      }).safeParse(jwt.verify(cookie.data?.token ?? headerToken ?? '', runtimeConfig.secret));

    if (!token.success)
      return null;

    const user = (await prisma.user.findUnique({
      where: { 
        id: token.data.id
      }
    }));

    return user;
  } catch (e) {
    return null;
  }
}

export const authMiddleware = async (event: H3Event, opts?: { rights?: UserRoleRight[] }): Promise<User> => {
  const user = await getUserFromRequest(event);
  if (!user || (opts?.rights && !hasRoleRights(user.role, opts.rights)))
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  return user;
};

export const authMiddlewarePascomConnector = async (event: H3Event): Promise<void> => {
  const runtimeConfig = useRuntimeConfig(),
        authHeader = getHeader(event, 'Authorization'),
        headerAuthHash = authHeader?.startsWith('Basic ') ? authHeader.slice(6) : null,
        headerAuthArr = headerAuthHash ? Buffer.from(headerAuthHash, 'base64').toString('ascii').split(':') : null;
  const requiredUsername  = filterString(runtimeConfig.pascom.connector.username),
        requiredPassword  = filterString(runtimeConfig.pascom.connector.password),
        username          = filterString(headerAuthArr?.at(0)),
        password          = filterString(headerAuthArr?.at(1));
  if (requiredUsername === null || requiredPassword === null || requiredUsername !== username || requiredPassword !== password) 
    throw createError({
      statusCode: 401,
    });
};
