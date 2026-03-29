import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";

const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default defineEventHandler(async (event) => {
  const authUser = await authMiddleware(event);
  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!user) throw createError({ statusCode: 404 });

  const config   = useRuntimeConfig();
  const siteUrl  = (config.public.siteUrl as string) ?? '';
  const siteTitle = (config.public.siteTitle as string) || 'Contacts';
  const parsed   = new URL(siteUrl);
  const hostname = parsed.hostname;
  const useSSL   = parsed.protocol === 'https:';
  const port     = parsed.port ? parseInt(parsed.port) : (useSSL ? 443 : 80);

  // Auto-generate password if none set
  let plainPassword: string;
  if (user.davPasswordHash) {
    // We can't recover the plain password — generate a new one and replace
    plainPassword = randomBytes(16).toString('base64url');
    const davPasswordHash = await bcrypt.hash(plainPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { davPasswordHash } });
  } else {
    plainPassword = randomBytes(16).toString('base64url');
    const davPasswordHash = await bcrypt.hash(plainPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { davPasswordHash } });
  }

  const enc          = encodeURIComponent(user.email);
  const principalUrl = `/dav/addressbooks/${enc}/contacts/`;

  // Deterministic UUIDs based on user id (stable across downloads)
  const profileUUID = `${user.id.slice(0, 8)}-dav0-4000-8000-${user.id.slice(-12)}`;
  const accountUUID = `${user.id.slice(0, 8)}-dav1-4000-8000-${user.id.slice(-12)}`;

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>CardDAVAccountDescription</key>
      <string>${xmlEscape(siteTitle)}</string>
      <key>CardDAVHostName</key>
      <string>${xmlEscape(hostname)}</string>
      <key>CardDAVUsername</key>
      <string>${xmlEscape(user.email)}</string>
      <key>CardDAVPassword</key>
      <string>${xmlEscape(plainPassword)}</string>
      <key>CardDAVPort</key>
      <integer>${port}</integer>
      <key>CardDAVPrincipalURL</key>
      <string>${xmlEscape(principalUrl)}</string>
      <key>CardDAVUseSSL</key>
      <${useSSL ? 'true' : 'false'}/>
      <key>PayloadDescription</key>
      <string>CardDAV Account</string>
      <key>PayloadDisplayName</key>
      <string>${xmlEscape(siteTitle)}</string>
      <key>PayloadIdentifier</key>
      <string>com.wodanio.carddav.account.${xmlEscape(user.id)}</string>
      <key>PayloadType</key>
      <string>com.apple.carddav.account</string>
      <key>PayloadUUID</key>
      <string>${accountUUID}</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
    </dict>
  </array>
  <key>PayloadDescription</key>
  <string>Configures CardDAV access to ${xmlEscape(siteTitle)} contacts</string>
  <key>PayloadDisplayName</key>
  <string>${xmlEscape(siteTitle)}</string>
  <key>PayloadIdentifier</key>
  <string>com.wodanio.carddav.${xmlEscape(user.id)}</string>
  <key>PayloadOrganization</key>
  <string>${xmlEscape(siteTitle)}</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>${profileUUID}</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>`;

  setResponseHeader(event, 'Content-Type', 'application/x-apple-aspen-config');
  setResponseHeader(event, 'Content-Disposition', 'attachment; filename="wodanio-contacts.mobileconfig"');
  return plist;
});
