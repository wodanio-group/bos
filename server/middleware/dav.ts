import {
  defineEventHandler,
  readRawBody,
  setResponseHeader,
  setResponseStatus,
  getHeader,
} from "h3";
import { useRuntimeConfig } from "#imports";
import { prisma } from "~~/lib/prisma.server";
import { davAuthMiddleware } from "~~/server/utils/dav-auth";
import { personToVCard, companyToVCard, davEtag } from "~~/server/utils/vcard";
import {
  buildPrincipalDiscoveryResponse,
  buildPrincipalPropfindResponse,
  buildAddressbookHomeResponse,
  buildAddressbookPropfindResponse,
  buildReportResponse,
  buildNotFoundEntry,
  type ContactMeta,
  type VCardEntry,
} from "~~/server/utils/dav-xml";

const XML  = 'application/xml; charset=utf-8';
const CARD = 'text/vcard; charset=utf-8';

const parseHrefs = (body: string): string[] =>
  [...body.matchAll(/<[^:>\s]+:href[^>]*>([^<]+)<\/[^:>\s]+:href>/g)].map(m => m[1]!.trim());

const parseFilename = (f: string): { type: 'person' | 'company'; id: string } | null => {
  const m = f.match(/^(person|company)-([0-9a-f-]+)\.vcf$/i);
  return m ? { type: m[1] as 'person' | 'company', id: m[2]! } : null;
};

const allContactMeta = async (base: string): Promise<ContactMeta[]> => {
  const [persons, companies] = await Promise.all([
    prisma.person.findMany({ select: { id: true, updatedAt: true, firstname: true, surename: true, familyname: true } }),
    prisma.company.findMany({ select: { id: true, updatedAt: true, name: true } }),
  ]);
  return [
    ...persons.map(p => ({
      href: `${base}person-${p.id}.vcf`,
      etag: davEtag(p.updatedAt),
      displayName: [p.firstname, p.surename, p.familyname].filter(Boolean).join(' ') || p.id,
    })),
    ...companies.map(c => ({
      href: `${base}company-${c.id}.vcf`,
      etag: davEtag(c.updatedAt),
      displayName: c.name || c.id,
    })),
  ];
};

const getVCard = async (filename: string) => {
  const parsed = parseFilename(filename);
  if (!parsed) return null;
  if (parsed.type === 'person') {
    const p = await prisma.person.findUnique({
      where: { id: parsed.id },
      include: { contactCommunicationWays: true, contactAddresses: true, companyPersons: { include: { company: true } } },
    });
    return p ? { etag: davEtag(p.updatedAt), vcardData: personToVCard(p) } : null;
  }
  const c = await prisma.company.findUnique({
    where: { id: parsed.id },
    include: { contactCommunicationWays: true, contactAddresses: true },
  });
  return c ? { etag: davEtag(c.updatedAt), vcardData: companyToVCard(c) } : null;
};

export default defineEventHandler(async (event) => {
  const path = event.path;

  // Only handle /dav and /.well-known/carddav
  // Strip query string for path matching
  const cleanPath = path.split('?')[0]!;
  const isDav       = cleanPath === '/dav' || cleanPath === '/dav/' || cleanPath.startsWith('/dav/');
  const isWellKnown = cleanPath === '/.well-known/carddav';
  if (!isDav && !isWellKnown) return;

  console.log(`[DAV] ${event.method} ${cleanPath}`, {
    auth: !!getHeader(event, 'Authorization'),
    depth: getHeader(event, 'Depth'),
    ct: getHeader(event, 'Content-Type'),
  });

  const method  = event.method.toUpperCase();
  const baseUrl = (useRuntimeConfig().public.siteUrl as string) ?? '';

  // Helper: send error without throwing (avoids Nuxt's SSR error handler)
  const err = (status: number, msg: string, headers?: Record<string, string>) => {
    if (headers) Object.entries(headers).forEach(([k, v]) => setResponseHeader(event, k, v));
    setResponseStatus(event, status, msg);
    return msg;
  };

  // OPTIONS — no auth needed
  if (method === 'OPTIONS') {
    setResponseHeader(event, 'Allow', 'OPTIONS, PROPFIND, REPORT, GET');
    setResponseHeader(event, 'DAV', '1, 3, addressbook');
    setResponseStatus(event, 200);
    return null;
  }

  // Reject write methods without going through Nuxt's error handler
  if (!['PROPFIND', 'REPORT', 'GET'].includes(method)) {
    return err(405, 'Method Not Allowed', { Allow: 'OPTIONS, PROPFIND, REPORT, GET' });
  }

  // Auth — catch error and return 401 directly
  let user: Awaited<ReturnType<typeof davAuthMiddleware>>;
  try {
    user = await davAuthMiddleware(event);
  } catch (e: any) {
    console.log('[DAV] auth failed:', e?.message ?? e);
    setResponseHeader(event, 'WWW-Authenticate', 'Basic realm="CardDAV"');
    return err(401, 'Unauthorized');
  }

  const enc              = encodeURIComponent(user.email);
  const principalHref    = `${baseUrl}/dav/principals/${enc}/`;
  const addressbookHomeHref = `${baseUrl}/dav/addressbooks/${enc}/`;
  const addressbookHref  = `${baseUrl}/dav/addressbooks/${enc}/contacts/`;

  // ── /.well-known/carddav ───────────────────────────────────────────────────
  if (isWellKnown) {
    setResponseHeader(event, 'Content-Type', XML);
    setResponseHeader(event, 'DAV', '1, 3, addressbook');
    setResponseStatus(event, 207);
    return buildPrincipalDiscoveryResponse(`${baseUrl}/.well-known/carddav`, principalHref);
  }

  // ── /dav/** ────────────────────────────────────────────────────────────────
  const rawPath  = cleanPath.replace(/^\/dav\/?/, '');  // use cleanPath (no query string)
  const segments = rawPath.split('/').filter(Boolean);
  // []                                              → /dav/
  // ['principals', enc-email]                       → principal
  // ['addressbooks', enc-email, 'contacts']         → addressbook
  // ['addressbooks', enc-email, 'contacts', file]   → single vCard

  const [section, encodedEmail, collection, filename] = segments;

  // /dav/ — principal discovery (PROPFIND or GET)
  if (segments.length === 0) {
    setResponseHeader(event, 'Content-Type', XML);
    setResponseHeader(event, 'DAV', '1, 3, addressbook');
    setResponseStatus(event, 207);
    return buildPrincipalDiscoveryResponse(`${baseUrl}/dav/`, principalHref);
  }

  // Check email matches authenticated user (for principals + addressbooks)
  const emailInUrl = decodeURIComponent(encodedEmail ?? '');
  if (emailInUrl !== user.email) return err(403, 'Forbidden');

  // /dav/principals/{email}/ — PROPFIND or GET both return principal info
  if (section === 'principals') {
    setResponseHeader(event, 'Content-Type', XML);
    setResponseHeader(event, 'DAV', '1, 3, addressbook');
    setResponseStatus(event, 207);
    return buildPrincipalPropfindResponse(principalHref, addressbookHomeHref, user.displayName);
  }

  if (section !== 'addressbooks') return err(404, 'Not Found');

  // /dav/addressbooks/{email}/ — home listing (Apple discovers addressbooks here)
  if (!collection) {
    setResponseHeader(event, 'Content-Type', XML);
    setResponseHeader(event, 'DAV', '1, 3, addressbook');
    setResponseStatus(event, 207);
    return buildAddressbookHomeResponse(addressbookHomeHref, addressbookHref);
  }

  if (collection !== 'contacts')  return err(404, 'Not Found');

  // /dav/addressbooks/{email}/contacts/{filename}.vcf — GET
  if (filename) {
    if (method !== 'GET') return err(405, 'Method Not Allowed', { Allow: 'GET' });
    const result = await getVCard(filename);
    if (!result) return err(404, 'Not Found');
    setResponseHeader(event, 'Content-Type', CARD);
    setResponseHeader(event, 'ETag', result.etag);
    return result.vcardData;
  }

  // /dav/addressbooks/{email}/contacts/ — PROPFIND or GET
  if (method === 'PROPFIND' || method === 'GET') {
    const depth    = getHeader(event, 'Depth') ?? '1';
    const contacts = depth !== '0' ? await allContactMeta(addressbookHref) : [];
    console.log(`[DAV] PROPFIND addressbook depth=${depth} found=${contacts.length} contacts`);
    setResponseHeader(event, 'Content-Type', XML);
    setResponseHeader(event, 'DAV', '1, 3, addressbook');
    setResponseStatus(event, 207);
    return buildAddressbookPropfindResponse(addressbookHref, contacts);
  }

  // /dav/addressbooks/{email}/contacts/ — REPORT
  if (method === 'REPORT') {
    console.log('[DAV] REPORT: reading body via stream...');
    let body = '';
    try {
      // readRawBody can hang in some Nuxt dev server setups — read directly from Node stream
      const req = event.node.req;
      body = await new Promise<string>((resolve) => {
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        req.on('error', () => resolve(''));
        setTimeout(() => resolve(Buffer.concat(chunks).toString('utf-8')), 3000);
      });
    } catch {
      body = '';
    }
    const isMultiget = body.includes('addressbook-multiget');
    console.log(`[DAV] REPORT type=${isMultiget ? 'multiget' : 'query'} bodyLen=${body.length}`);

    if (isMultiget) {
      const hrefs = parseHrefs(body).map(h =>
        h.startsWith('http') ? h : `${baseUrl}${h.startsWith('/') ? '' : '/'}${h}`
      );
      console.log(`[DAV] multiget hrefs=${hrefs.length}`, hrefs.slice(0, 3));
      const XML_DECL = '<?xml version="1.0" encoding="UTF-8"?>\r\n';
      const entries: string[] = [];
      for (const href of hrefs) {
        const fname = href.split('/').pop() ?? '';
        const result = await getVCard(fname);
        if (!result) {
          entries.push(buildNotFoundEntry(href));
        } else {
          entries.push(
            buildReportResponse([{ href, etag: result.etag, vcardData: result.vcardData }])
              .replace(/^<\?xml[^>]+\?>\r?\n?<D:multistatus[^>]+>\r?\n?/, '')
              .replace(/<\/D:multistatus>\s*$/, '')
          );
        }
      }
      setResponseHeader(event, 'Content-Type', XML);
      setResponseStatus(event, 207);
      return XML_DECL +
        `<D:multistatus xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:carddav">\r\n` +
        entries.join('') +
        `</D:multistatus>`;
    }

    // addressbook-query — return all contacts
    const [persons, companies] = await Promise.all([
      prisma.person.findMany({
        include: { contactCommunicationWays: true, contactAddresses: true, companyPersons: { include: { company: true } } },
      }),
      prisma.company.findMany({
        include: { contactCommunicationWays: true, contactAddresses: true },
      }),
    ]);
    const cards: VCardEntry[] = [
      ...persons.map(p => ({ href: `${addressbookHref}person-${p.id}.vcf`, etag: davEtag(p.updatedAt), vcardData: personToVCard(p) })),
      ...companies.map(c => ({ href: `${addressbookHref}company-${c.id}.vcf`, etag: davEtag(c.updatedAt), vcardData: companyToVCard(c) })),
    ];
    console.log(`[DAV] query response: ${persons.length} persons, ${companies.length} companies`);
    if (cards[0]) console.log('[DAV] first vcard sample:\n', cards[0].vcardData.slice(0, 300));
    setResponseHeader(event, 'Content-Type', XML);
    setResponseStatus(event, 207);
    return buildReportResponse(cards);
  }

  return err(405, 'Method Not Allowed');
});
