import type {
  Person,
  Company,
  ContactCommunicationWay,
  ContactAddress,
  CompanyPerson,
} from "~~/lib/prisma.server";

type PersonWithRelations = Person & {
  contactCommunicationWays: ContactCommunicationWay[];
  contactAddresses: ContactAddress[];
  companyPersons: (CompanyPerson & { company: Company })[];
};

type CompanyWithRelations = Company & {
  contactCommunicationWays: ContactCommunicationWay[];
  contactAddresses: ContactAddress[];
};

// RFC 6350 §3.2 — fold lines longer than 75 octets
const foldVCardLine = (line: string): string => {
  const bytes = Buffer.from(line, 'utf-8');
  if (bytes.length <= 75) return line;

  const parts: string[] = [];
  let offset = 0;
  let first = true;
  while (offset < bytes.length) {
    const limit = first ? 75 : 74; // continuation lines start with 1 space
    // Ensure we don't split a multi-byte UTF-8 sequence
    let end = offset + limit;
    if (end >= bytes.length) {
      end = bytes.length;
    } else {
      // Back up until we land on a valid UTF-8 start byte
      while (end > offset && (bytes[end]! & 0xc0) === 0x80) end--;
    }
    parts.push((first ? '' : ' ') + bytes.slice(offset, end).toString('utf-8'));
    offset = end;
    first = false;
  }
  return parts.join('\r\n');
};

const line = (key: string, value: string | null | undefined): string => {
  if (!value) return '';
  return foldVCardLine(`${key}:${value}`) + '\r\n';
};

const vcardEscape = (s: string | null | undefined): string => {
  if (!s) return '';
  return s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
};

const telType = (category: string): string => {
  switch (category) {
    case 'WORK': return 'work,voice';
    case 'MOBILE': return 'cell';
    case 'FAX': return 'fax';
    case 'PRIVAT': return 'home,voice';
    default: return 'voice';
  }
};

const emailType = (category: string): string => {
  return category === 'PRIVAT' ? 'home' : 'work';
};

const adrType = (category: string): string => {
  switch (category) {
    case 'PRIVAT': return 'home';
    default: return 'work';
  }
};

const buildCommunicationWayLines = (ways: ContactCommunicationWay[]): string => {
  let out = '';
  for (const w of ways) {
    if (!w.value) continue;
    if (w.type === 'PHONE') {
      out += foldVCardLine(`TEL;TYPE=${telType(w.category)}:${w.value}`) + '\r\n';
    } else if (w.type === 'EMAIL') {
      out += foldVCardLine(`EMAIL;TYPE=${emailType(w.category)}:${w.value}`) + '\r\n';
    }
    // WEB is not a standard vCard property, skip
  }
  return out;
};

const buildAddressLines = (addresses: ContactAddress[]): string => {
  let out = '';
  for (const a of addresses) {
    // ADR: pobox;ext;street;city;region;postalcode;country
    const street = [a.address, a.address2, a.address3, a.address4]
      .filter(Boolean)
      .map(vcardEscape)
      .join('\\n');
    const adr = [
      '',                                // PO box
      '',                                // extended address
      street,
      vcardEscape(a.city),
      '',                                // region
      vcardEscape(a.zipCode),
      vcardEscape(a.countryId),          // ISO country code
    ].join(';');
    out += foldVCardLine(`ADR;TYPE=${adrType(a.category)}:${adr}`) + '\r\n';
  }
  return out;
};

export const davEtag = (updatedAt: Date): string =>
  '"' + updatedAt.getTime().toString(36) + '"';

export const personToVCard = (person: PersonWithRelations): string => {
  const fn = [person.firstname, person.surename, person.familyname]
    .filter(Boolean)
    .join(' ') || person.id;

  const n = [
    vcardEscape(person.familyname),
    vcardEscape(person.firstname),
    vcardEscape(person.surename),
    '',
    '',
  ].join(';');

  const primaryCompany = person.companyPersons.find(cp => cp.main)?.company
    ?? person.companyPersons[0]?.company;

  let vcard = 'BEGIN:VCARD\r\n';
  vcard += 'VERSION:4.0\r\n';
  vcard += 'KIND:individual\r\n';
  vcard += line('UID', `urn:uuid:${person.id}`);
  vcard += line('FN', vcardEscape(fn));
  vcard += line('N', n);
  if (person.birthdayAt) {
    const bday = person.birthdayAt.toISOString().slice(0, 10).replace(/-/g, '');
    vcard += line('BDAY', bday);
  }
  if (primaryCompany?.name) {
    vcard += line('ORG', vcardEscape(primaryCompany.name));
  }
  vcard += buildCommunicationWayLines(person.contactCommunicationWays);
  vcard += buildAddressLines(person.contactAddresses);
  vcard += `REV:${person.updatedAt.toISOString().replace(/\.\d{3}Z$/, 'Z')}\r\n`;
  vcard += 'END:VCARD\r\n';
  return vcard;
};

export const companyToVCard = (company: CompanyWithRelations): string => {
  const fn = [company.name, company.name2].filter(Boolean).join(' ') || company.id;
  const org = [vcardEscape(company.name), vcardEscape(company.name2)]
    .filter(Boolean)
    .join(';');

  let vcard = 'BEGIN:VCARD\r\n';
  vcard += 'VERSION:4.0\r\n';
  vcard += 'KIND:org\r\n';
  vcard += line('UID', `urn:uuid:${company.id}`);
  vcard += line('FN', vcardEscape(fn));
  vcard += line('ORG', org);
  vcard += buildCommunicationWayLines(company.contactCommunicationWays);
  vcard += buildAddressLines(company.contactAddresses);
  vcard += `REV:${company.updatedAt.toISOString().replace(/\.\d{3}Z$/, 'Z')}\r\n`;
  vcard += 'END:VCARD\r\n';
  return vcard;
};
