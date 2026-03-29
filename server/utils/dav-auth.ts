import bcrypt from "bcryptjs";
import { createError, getHeader, setResponseHeader, type H3Event } from "h3";
import type { User } from "~~/lib/prisma.server";
import { prisma } from "~~/lib/prisma.server";

export const davAuthMiddleware = async (event: H3Event): Promise<User> => {
  const authHeader = getHeader(event, 'Authorization');
  const headerAuthHash = authHeader?.startsWith('Basic ') ? authHeader.slice(6) : null;
  const headerAuthArr = headerAuthHash
    ? Buffer.from(headerAuthHash, 'base64').toString('utf-8').split(':')
    : null;

  const email = headerAuthArr?.at(0) ?? null;
  const password = headerAuthArr?.slice(1).join(':') ?? null; // allow colons in password

  if (!email || !password) {
    setResponseHeader(event, 'WWW-Authenticate', 'Basic realm="CardDAV"');
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.davPasswordHash) {
    setResponseHeader(event, 'WWW-Authenticate', 'Basic realm="CardDAV"');
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const valid = await bcrypt.compare(password, user.davPasswordHash);
  if (!valid) {
    setResponseHeader(event, 'WWW-Authenticate', 'Basic realm="CardDAV"');
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  return user;
};
