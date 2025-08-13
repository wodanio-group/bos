import prisma from "~~/lib/prisma";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { createError, getHeader, type H3Event } from "h3";
import type { User } from "@prisma/client";
import { useRuntimeConfig } from "#imports";
import type { UserRoleRight } from "../types/user";
import { hasRoleRights } from "./user";

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
