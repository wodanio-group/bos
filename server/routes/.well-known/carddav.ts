import { defineEventHandler, sendRedirect, setResponseHeader, setResponseStatus } from "h3";
import { useRuntimeConfig } from "#imports";
import { davAuthMiddleware } from "~~/server/utils/dav-auth";
import { buildPrincipalDiscoveryResponse } from "~~/server/utils/dav-xml";

export default defineEventHandler(async (event) => {
  const method = event.method.toUpperCase();

  // OPTIONS — no auth needed, advertise DAV capability
  if (method === 'OPTIONS') {
    setResponseHeader(event, 'Allow', 'OPTIONS, PROPFIND');
    setResponseHeader(event, 'DAV', '1, 3, addressbook');
    setResponseStatus(event, 200);
    return null;
  }

  const user = await davAuthMiddleware(event);
  const baseUrl = (useRuntimeConfig().public.siteUrl as string) ?? '';
  const principalHref = `${baseUrl}/dav/principals/${encodeURIComponent(user.email)}/`;

  // PROPFIND: return current-user-principal directly (avoids redirect auth-loss issues)
  if (method === 'PROPFIND') {
    setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
    setResponseHeader(event, 'DAV', '1, 3, addressbook');
    setResponseStatus(event, 207);
    return buildPrincipalDiscoveryResponse(`${baseUrl}/.well-known/carddav`, principalHref);
  }

  // Other methods: redirect to principal (RFC 6764 §6)
  return sendRedirect(event, principalHref, 301);
});
