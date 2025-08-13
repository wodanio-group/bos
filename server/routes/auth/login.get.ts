import * as client from "openid-client";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(),
        query = z.object({
          r: z.string().optional().nullable()
        }).safeParse(getQuery(event));

  if (!query.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: query.error.flatten().fieldErrors,
    });

  const config = await client.discovery(
    new URL(runtimeConfig.openId.issuer),
    runtimeConfig.openId.clientId,
    runtimeConfig.openId.clientSecret
  );

  const codeVerifier = client.randomPKCECodeVerifier(),
        codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);

  event.node.res.setHeader('Set-Cookie', [
    `pkce_verifier=${codeVerifier}; HttpOnly; Path=/; SameSite=Lax`,
    ...(query.data.r ? [`redirect_path=${query.data.r}; HttpOnly; Path=/; SameSite=Lax`] : []),
  ]);

  const redirectTo = client.buildAuthorizationUrl(config, {
    redirect_uri: runtimeConfig.siteUrl + '/auth/callback',
    scope: 'openid profile email',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  return sendRedirect(event, redirectTo.href);
})
