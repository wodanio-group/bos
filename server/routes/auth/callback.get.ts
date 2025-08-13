import * as client from "openid-client";
import prisma from "~~/lib/prisma";
import { parse } from "cookie";
import { z } from "zod";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(),
        cookie = z.object({
          pkce_verifier: z.string(),
          redirect_path: z.string().optional().nullable(),
        }).safeParse(parse(event.node.req.headers.cookie ?? ''));

  if (!cookie.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: cookie.error.flatten().fieldErrors,
    });

  const config = await client.discovery(
    new URL(runtimeConfig.openId.issuer),
    runtimeConfig.openId.clientId,
    runtimeConfig.openId.clientSecret,
  );

  const tokens = await client.authorizationCodeGrant(config, new URL(getRequestURL(event)), {
    pkceCodeVerifier: cookie.data.pkce_verifier
  });

  const tokenClaims = tokens.claims(),
        userinfo = await client.fetchUserInfo(config, tokens.access_token!, tokenClaims?.sub ?? '');

  const expiresIn = 60 * 60 * 24 * 7;

  const userCount = await prisma.user.count({});
  const user = await prisma.user.upsert({
    where: {
      externalId: userinfo.sub,
    },
    create: {
      externalId: userinfo.sub,
      displayName: userinfo.name,
      role: (userCount <= 0) ? 'ADMIN' : undefined
    },
    update: {
      externalId: userinfo.sub,
      displayName: userinfo.name,
    },
  });
  const token = jwt.sign({
    id: user.id,
  }, runtimeConfig.secret, { expiresIn });

  event.node.res.setHeader('Set-Cookie', [
    `token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${expiresIn}`,
    'pkce_verifier=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    'redirect_path=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
  ]);

  return sendRedirect(event, cookie.data.redirect_path ?? '/');
});
