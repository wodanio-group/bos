import type { CountryViewModel, PersonViewModel, CompanyViewModel, ContactNoteViewModel, ContactCommunicationWayViewModel, ContactAddressViewModel, ContactGender, ContactNoteType } from "../types/contact";
import type { Country, Person, Company, ContactNote, ContactCommunicationWay, ContactAddress, CompanyPerson } from "@prisma/client";
import { getOptions, setOptions } from "./option";
import { z } from "zod";
import { DateTime } from "luxon";

export const contactGenderValidator = z.enum(['MALE', 'FEMALE', 'DIVERSE', 'NONE']).default('NONE');

export const contactCommunicationWayTypeValidator = z.enum(['PHONE', 'EMAIL', 'WEB']);

export const contactCommunicationWayCategoryValidator = z.enum(['INVOICING', 'WORK', 'FAX', 'MOBILE', 'AUTOBOX', 'NEWSLETTER', 'PRIVAT', 'NONE']);

export const contactAddressCategoryValidator = z.enum(['HEADQUARTER', 'INVOICE', 'WORK', 'DELIVERY', 'PICKUP', 'PRIVAT', 'NONE']);

export const contactNoteTypeValidator = z.enum(['NOTE', 'CALL', 'MEETING', 'OTHER']);

export const contactCommunicationWayValidator = z.object({
  type: contactCommunicationWayTypeValidator,
  category: contactCommunicationWayCategoryValidator,
  value: z.string().trim().optional().nullable(),
});

export const contactAddressValidator = z.object({
  category: contactAddressCategoryValidator,
  address: z.string().trim().optional().nullable(),
  address2: z.string().trim().optional().nullable(),
  address3: z.string().trim().optional().nullable(),
  address4: z.string().trim().optional().nullable(),
  zipCode: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  country: z.string().trim().min(2).max(2),
});

export const contactNoteValidator = z.object({
  type: contactNoteTypeValidator,
  timestamp: z.string().datetime().optional().nullable(),
  content: z.string().trim(),
});

export const ContactGenders: ContactGender[] = [
  'MALE',
  'FEMALE',
  'DIVERSE',
  'NONE',
];

export const ContactNoteTypes: ContactNoteType[] = [
  'NOTE',
  'CALL',
  'MEETING',
  'OTHER'
];

export const countryToViewModel = (item: Country): CountryViewModel => {
  return {
    isoCode: item.isoCode
  };
}

export const contactCommunicationWayToViewModel = (item: ContactCommunicationWay): ContactCommunicationWayViewModel => {
  return {
    createdAt: (new Date(item.createdAt)).toISOString(),
    updatedAt: (new Date(item.updatedAt)).toISOString(),
    type: item.type,
    category: item.category,
    value: item.value,
  };
}

export const compareContactCommunicationWay = (a: typeof contactCommunicationWayValidator._type | ContactCommunicationWay | ContactCommunicationWayViewModel, b: typeof contactCommunicationWayValidator._type | ContactCommunicationWay | ContactCommunicationWayViewModel) => 
  (a.type === b.type && a.category === b.category && a.value === b.value);

export const contactAddressViewModel = (item: ContactAddress): ContactAddressViewModel => {
  return {
    createdAt: (new Date(item.createdAt)).toISOString(),
    updatedAt: (new Date(item.updatedAt)).toISOString(),
    category: item.category,
    address: item.address,
    address2: item.address2,
    address3: item.address3,
    address4: item.address4,
    zipCode: item.zipCode,
    city: item.city,
    country: item.countryId,
  };
}

export const compareContactAddress = (a: typeof contactAddressValidator._type | ContactAddress | ContactAddressViewModel, b: typeof contactAddressValidator._type | ContactAddress | ContactAddressViewModel) => 
  (a.address === b.address && a.address2 === b.address2 && a.address3 === b.address3 && a.address4 === b.address4
    && a.zipCode === b.zipCode && a.city === b.city);

export const contactNoteViewModel = (item: ContactNote): ContactNoteViewModel => {
  return {
    createdAt: (new Date(item.createdAt)).toISOString(),
    updatedAt: (new Date(item.updatedAt)).toISOString(),
    type: item.type,
    timestamp: item.timestamp ? (new Date(item.timestamp)).toISOString() : null,
    content: item.content,
  };
}

export const compareContactNote = (a: typeof contactNoteValidator._type | ContactNote | ContactNoteViewModel, b: typeof contactNoteValidator._type | ContactNote | ContactNoteViewModel) => 
  (a.content === b.content);

export const personToViewModel = (item: Person): PersonViewModel => {
  return {
    id: item.id,
    createdAt: (new Date(item.createdAt)).toISOString(),
    updatedAt: (new Date(item.updatedAt)).toISOString(),
    externalId: item.externalId,
    firstname: item.firstname,
    surename: item.surename,
    familyname: item.familyname,
    gender: item.gender,
    birthdayAt: item.birthdayAt ? (new Date(item.birthdayAt)).toISOString() : null,
    companies: (((item as any)?.companyPersons ?? []) as CompanyPerson[]).map(o => ({
      id: o.companyId,
      main: o.main,
      role: o.role,
    })),
    communicationWays: ((item as any)?.contactCommunicationWays ?? []).map((o: any) => contactCommunicationWayToViewModel(o)),
    addresses: ((item as any)?.contactAddresses ?? []).map((o: any) => contactAddressViewModel(o)),
    notes: ((item as any)?.contactNotes ?? []).map((o: any) => contactNoteViewModel(o)),
  };
}

export const personDisplayName = (item: Person | PersonViewModel, opts?: {}): string => {
  return [
    item.firstname,
    item.surename,
    item.familyname,
  ].filter(o => o).join(' ');
}

export const companyToViewModel = (item: Company): CompanyViewModel => {
  return {
    id: item.id,
    createdAt: (new Date(item.createdAt)).toISOString(),
    updatedAt: (new Date(item.updatedAt)).toISOString(),
    externalId: item.externalId,
    name: item.name,
    name2: item.name2,
    customerId: item.customerId,
    taxId: item.taxId,
    vatId: item.vatId,
    persons: (((item as any)?.companyPersons ?? []) as CompanyPerson[]).map(o => ({
      id: o.personId,
      role: o.role,
    })),
    communicationWays: ((item as any)?.contactCommunicationWays ?? []).map((o: any) => contactCommunicationWayToViewModel(o)),
    addresses: ((item as any)?.contactAddresses ?? []).map((o: any) => contactAddressViewModel(o)),
    notes: ((item as any)?.contactNotes ?? []).map((o: any) => contactNoteViewModel(o)),
  };
}

export const companyDisplayName = (item: Company | CompanyViewModel, opts?: { withCustomerId?: boolean }): string => {
  return [
    item.name,
    item.name2,
    ...((opts?.withCustomerId === true && item.customerId) ? [ `(${item.customerId})` ] : []),
  ].filter(o => o).join(' ');
}

export const getNextAvailableCompanyCustomerId = async (): Promise<string> => {
  const opts = await getOptions(['CUSTOMER_ID_COUNTER', 'CUSTOMER_ID_SCHEMA']),
        counter = opts.find(o => o.key === 'CUSTOMER_ID_COUNTER')!.value.counter,
        schema = opts.find(o => o.key === 'CUSTOMER_ID_SCHEMA')!.value.schema;
  return schema
    .replace('%YYYY', DateTime.now().toFormat('yyyy'))
    .replace('%YY', DateTime.now().toFormat('yy'))
    .replace('%COUNTER', counter);
}

export const increaseCompanyCustomerId = async (): Promise<void> => {
  const opts = await getOptions(['CUSTOMER_ID_COUNTER']),
        counter = Number(opts.find(o => o.key === 'CUSTOMER_ID_COUNTER')!.value.counter);
  await setOptions([{
    key: 'CUSTOMER_ID_COUNTER',
    value: { counter: (counter + 1) }
  }]);
}
