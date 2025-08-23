import { useRuntimeConfig } from "#imports";
import prisma from "~~/lib/prisma";
import { type Person, type Company, ContactCommunicationWayCategory } from "@prisma/client";
import type { ContactAddressCategory, ContactCommunicationWayType } from "~~/shared/types/contact";

export const useSevdesk = () => {
  const config = useRuntimeConfig();

  const available = () => (config.sevdesk.apiUrl.length > 0 && config.sevdesk.apiToken.length > 0);
  const availableOrFail = () => {
    if (!available())
      throw new Error('Sevdesk not inited');
  };

  const baseRequest = async <T>(opts: {
    path: string,
    method?: 'GET',
    query?: { [index: string]: string | null },
  }): Promise<T> => {
    availableOrFail();
    const res = (await $fetch<any>([config.sevdesk.apiUrl, opts.path].join('/'), {
      method: opts.method ?? 'GET',
      headers: {
        Authorization: config.sevdesk.apiToken
      },
      query: opts.query,
    }));
    return (!opts.method || opts.method === 'GET') ? res.objects : res;
  };

  const getAll = async <T>(path: string, query: { [index: string]: string | null } = {}): Promise<T[]> => {
    const items: T[] = [],
          limit = 1000;
    let offset = 0,
        lastItemCount = 0;
    do {
      try {
        const res = await baseRequest<T[]>({
          path, method: 'GET',
          query: { ...query, limit: String(limit), offset: String(offset) },
        });
        lastItemCount = res.length;
        items.push(...res);
        offset += limit;
      } catch (e) {
        lastItemCount = 0;
      }
    } while (lastItemCount > 0 && lastItemCount < limit);
    return items;
  };

  const sync = async (opts?: {}) => {
    if (!available())
      return;
    const svContacts = (await getAll<any>('Contact', { depth: '1' }));
    for (const svContact of svContacts) {
      const isOrg = (!svContact.surename && !svContact.familyname);

      let contact: Person | Company | null = isOrg ? (await prisma.company.findFirst({ where: {
        OR: [
          { customerId: svContact.customerNumber },
          { name: svContact.name }
        ]
      } })) : (await prisma.person.findFirst({ where: {
        AND: [
          { firstname: svContact.name },
          { OR: [
            { surename: svContact.surename },
            { familyname: svContact.familyname },
            { 
              surename: svContact.surename,
              familyname: svContact.familyname
            }
          ] }
        ]
      } }));
      const createNewContact = !contact;

      if (!contact)
        contact = isOrg ? (await prisma.company.create({ data: {
          name: svContact.name,
          name2: svContact.name2,
          customerId: svContact.customerNumber,
          vatId: svContact.vatNumber,
          taxId: svContact.taxtNumber,
          updatedAt: svContact.update,
        } })) : (await prisma.person.create({ data: {
          firstname: svContact.name,
          surename: svContact.surename,
          familyname: svContact.familyname,
          gender: (svContact.gender === 'm')
            ? 'MALE'
            : (svContact.gender === 'w')
              ? 'FEMALE' 
              : 'DIVERSE',
          birthdayAt: svContact.birthday,
          updatedAt: svContact.update,
        } }));
      else if (contact.updatedAt.getTime() < ((new Date(svContact.update))?.getTime() ?? 0)) 
        contact = isOrg ? (await prisma.company.update({ where: { id: contact.id }, data: {
          name: svContact.name,
          name2: svContact.name2,
          customerId: svContact.customerNumber,
          vatId: svContact.vatNumber,
          taxId: svContact.taxtNumber,
          updatedAt: svContact.update,
        } })) : (await prisma.person.update({ where: { id: contact.id },  data: {
          firstname: svContact.name,
          surename: svContact.surename,
          familyname: svContact.familyname,
          gender: (svContact.gender === 'm')
            ? 'MALE'
            : (svContact.gender === 'w')
              ? 'FEMALE' 
              : 'DIVERSE',
          birthdayAt: svContact.birthday,
          updatedAt: svContact.update,
        } }));

      if (createNewContact && isOrg)
        await increaseCompanyCustomerId();

      const svCommunicationWays = await getAll<any>('CommunicationWay', { 'contact[id]': svContact.id, 'contact[objectName]': 'Contact' });
      for (const svCommunicationWay of svCommunicationWays) {
        const type: ContactCommunicationWayType = (svCommunicationWay.type === 'WEB')
          ? 'WEB'
          : (svCommunicationWay.type === 'EMAIL')
            ? 'EMAIL'
            : (svCommunicationWay.type === 'PHONE')
              ? 'PHONE' : null;
        if (!type)
          continue;
        const category: ContactCommunicationWayCategory = (svCommunicationWay.key.id === '1')
          ? 'PRIVAT'
          : (svCommunicationWay.key.id === '2')
            ? 'WORK'
            : (svCommunicationWay.key.id === '3')
              ? 'FAX'
              : (svCommunicationWay.key.id === '4')
                ? 'MOBILE'
                : (svCommunicationWay.key.id === '5')
                  ? 'NONE'
                  : (svCommunicationWay.key.id === '6')
                    ? 'AUTOBOX'
                    : (svCommunicationWay.key.id === '7')
                      ? 'NEWSLETTER'
                      : (svCommunicationWay.key.id === '8')
                        ? 'INVOICING'
                        : 'NONE';
        const payload = {
          type, category,
          value: svCommunicationWay.value,
          personId: !isOrg ? contact.id : undefined,
          companyId: isOrg ? contact.id : undefined,
        };
        if ((await prisma.contactCommunicationWay.findMany({ where: payload })).length <= 0)
          await prisma.contactCommunicationWay.create({ data: payload });
      }

      const svContactAddresses = await getAll<any>('ContactAddress', { embed: 'country,category', 'contact[id]': svContact.id, 'contact[objectName]': 'Contact' });
      for (const svContactAddress of svContactAddresses) {
        console.log(svContactAddress)
        const category: ContactAddressCategory = (svContactAddress.category.id === '43')
          ? 'WORK'
          : 'NONE';
        if (category === 'NONE')
          continue;
        if ((await prisma.contactAddress.findMany({
          where: {
            category,
            address: svContactAddress.street,
            zipCode: svContactAddress.zip,
            city: svContactAddress.city,
            personId: !isOrg ? contact.id : undefined,
            companyId: isOrg ? contact.id : undefined,
          } 
        })).length <= 0)
          await prisma.contactAddress.create({
            data: {
              category,
              address: svContactAddress.street,
              zipCode: svContactAddress.zip,
              city: svContactAddress.city,
              countryId: String(svContactAddress.country.code).toUpperCase(),
              personId: !isOrg ? contact.id : undefined,
              companyId: isOrg ? contact.id : undefined,
            },
            include: {
              country: true
            }
          });
      }

    }
  };

  return {
    sync
  };
};
