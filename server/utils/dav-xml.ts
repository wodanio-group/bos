export const xmlEscape = (s: string): string =>
  s.replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;')
   .replace(/'/g, '&apos;');

const XML_DECL = '<?xml version="1.0" encoding="UTF-8"?>\r\n';
const NS_DAV = 'xmlns:D="DAV:"';
const NS_CARD = 'xmlns:C="urn:ietf:params:xml:ns:carddav"';

// ─── Principal Discovery (/.well-known/carddav or PROPFIND /dav/) ────────────
// Returns current-user-principal pointing to the user's principal URL

export const buildPrincipalDiscoveryResponse = (
  requestHref: string,
  principalHref: string,
): string =>
  XML_DECL +
  `<D:multistatus ${NS_DAV} ${NS_CARD}>\r\n` +
  `  <D:response>\r\n` +
  `    <D:href>${xmlEscape(requestHref)}</D:href>\r\n` +
  `    <D:propstat>\r\n` +
  `      <D:prop>\r\n` +
  `        <D:current-user-principal>\r\n` +
  `          <D:href>${xmlEscape(principalHref)}</D:href>\r\n` +
  `        </D:current-user-principal>\r\n` +
  `      </D:prop>\r\n` +
  `      <D:status>HTTP/1.1 200 OK</D:status>\r\n` +
  `    </D:propstat>\r\n` +
  `  </D:response>\r\n` +
  `</D:multistatus>`;

// ─── Principal Resource (/dav/principals/{email}/) ───────────────────────────

export const buildPrincipalPropfindResponse = (
  principalHref: string,
  addressbookHomeHref: string,
  displayName: string | null,
): string =>
  XML_DECL +
  `<D:multistatus ${NS_DAV} ${NS_CARD}>\r\n` +
  `  <D:response>\r\n` +
  `    <D:href>${xmlEscape(principalHref)}</D:href>\r\n` +
  `    <D:propstat>\r\n` +
  `      <D:prop>\r\n` +
  `        <D:displayname>${xmlEscape(displayName ?? '')}</D:displayname>\r\n` +
  `        <D:resourcetype><D:principal/></D:resourcetype>\r\n` +
  `        <D:principal-URL><D:href>${xmlEscape(principalHref)}</D:href></D:principal-URL>\r\n` +
  `        <C:addressbook-home-set>\r\n` +
  `          <D:href>${xmlEscape(addressbookHomeHref)}</D:href>\r\n` +
  `        </C:addressbook-home-set>\r\n` +
  `        <D:current-user-principal>\r\n` +
  `          <D:href>${xmlEscape(principalHref)}</D:href>\r\n` +
  `        </D:current-user-principal>\r\n` +
  `      </D:prop>\r\n` +
  `      <D:status>HTTP/1.1 200 OK</D:status>\r\n` +
  `    </D:propstat>\r\n` +
  `  </D:response>\r\n` +
  `</D:multistatus>`;

// ─── Addressbook Home (PROPFIND /dav/addressbooks/{email}/) ─────────────────
// Returns the home collection listing the contacts addressbook as a child

export const buildAddressbookHomeResponse = (
  homeHref: string,
  addressbookHref: string,
): string =>
  XML_DECL +
  `<D:multistatus ${NS_DAV} ${NS_CARD}>\r\n` +
  `  <D:response>\r\n` +
  `    <D:href>${xmlEscape(homeHref)}</D:href>\r\n` +
  `    <D:propstat>\r\n` +
  `      <D:prop>\r\n` +
  `        <D:resourcetype><D:collection/></D:resourcetype>\r\n` +
  `        <D:displayname>Addressbooks</D:displayname>\r\n` +
  `      </D:prop>\r\n` +
  `      <D:status>HTTP/1.1 200 OK</D:status>\r\n` +
  `    </D:propstat>\r\n` +
  `  </D:response>\r\n` +
  `  <D:response>\r\n` +
  `    <D:href>${xmlEscape(addressbookHref)}</D:href>\r\n` +
  `    <D:propstat>\r\n` +
  `      <D:prop>\r\n` +
  `        <D:resourcetype><D:collection/><C:addressbook/></D:resourcetype>\r\n` +
  `        <D:displayname>Contacts</D:displayname>\r\n` +
  `      </D:prop>\r\n` +
  `      <D:status>HTTP/1.1 200 OK</D:status>\r\n` +
  `    </D:propstat>\r\n` +
  `  </D:response>\r\n` +
  `</D:multistatus>`;

// ─── Address Book Collection (PROPFIND /dav/addressbooks/{email}/contacts/) ──

export type ContactMeta = { href: string; etag: string; displayName: string };

export const buildAddressbookPropfindResponse = (
  collectionHref: string,
  contacts: ContactMeta[],
): string => {
  const collectionEntry =
    `  <D:response>\r\n` +
    `    <D:href>${xmlEscape(collectionHref)}</D:href>\r\n` +
    `    <D:propstat>\r\n` +
    `      <D:prop>\r\n` +
    `        <D:resourcetype><D:collection/><C:addressbook/></D:resourcetype>\r\n` +
    `        <D:displayname>Contacts</D:displayname>\r\n` +
    `        <C:supported-address-data>\r\n` +
    `          <C:address-data-type content-type="text/vcard" version="4.0"/>\r\n` +
    `        </C:supported-address-data>\r\n` +
    `      </D:prop>\r\n` +
    `      <D:status>HTTP/1.1 200 OK</D:status>\r\n` +
    `    </D:propstat>\r\n` +
    `  </D:response>\r\n`;

  const contactEntries = contacts.map(c =>
    `  <D:response>\r\n` +
    `    <D:href>${xmlEscape(c.href)}</D:href>\r\n` +
    `    <D:propstat>\r\n` +
    `      <D:prop>\r\n` +
    `        <D:getetag>${xmlEscape(c.etag)}</D:getetag>\r\n` +
    `        <D:getcontenttype>text/vcard; charset=utf-8</D:getcontenttype>\r\n` +
    `        <D:resourcetype/>\r\n` +
    `      </D:prop>\r\n` +
    `      <D:status>HTTP/1.1 200 OK</D:status>\r\n` +
    `    </D:propstat>\r\n` +
    `  </D:response>\r\n`
  ).join('');

  return XML_DECL +
    `<D:multistatus ${NS_DAV} ${NS_CARD}>\r\n` +
    collectionEntry +
    contactEntries +
    `</D:multistatus>`;
};

// ─── REPORT response (multiget / query) ──────────────────────────────────────

export type VCardEntry = { href: string; etag: string; vcardData: string };

export const buildReportResponse = (cards: VCardEntry[]): string => {
  const entries = cards.map(c =>
    `  <D:response>\r\n` +
    `    <D:href>${xmlEscape(c.href)}</D:href>\r\n` +
    `    <D:propstat>\r\n` +
    `      <D:prop>\r\n` +
    `        <D:getetag>${xmlEscape(c.etag)}</D:getetag>\r\n` +
    `        <C:address-data>${xmlEscape(c.vcardData)}</C:address-data>\r\n` +
    `      </D:prop>\r\n` +
    `      <D:status>HTTP/1.1 200 OK</D:status>\r\n` +
    `    </D:propstat>\r\n` +
    `  </D:response>\r\n`
  ).join('');

  return XML_DECL +
    `<D:multistatus ${NS_DAV} ${NS_CARD}>\r\n` +
    entries +
    `</D:multistatus>`;
};

// ─── Not Found entry (used in multiget for missing hrefs) ───────────────────

export const buildNotFoundEntry = (href: string): string =>
  `  <D:response>\r\n` +
  `    <D:href>${xmlEscape(href)}</D:href>\r\n` +
  `    <D:status>HTTP/1.1 404 Not Found</D:status>\r\n` +
  `  </D:response>\r\n`;
