import { Job } from "bullmq";
import { filterString } from '#imports';
import { prisma } from "~~/lib/prisma.server";
import { pesBaseRequest } from "../utils/pes";
import { contactGetPrimaryAddress, contactGetPrimaryCommunicationWay } from "~~/shared/utils/contact";
import { queue } from "../utils/queue";

export const customerSync = async (job: Job) => {
  // INFO: this will only upsert companies, it will not delete deleted companies
  const companies = await prisma.company.findMany({ select: { id: true } });
  for (const company of companies) {
    await queue.add('pes.customer.upsert', { companyId: company.id });
  }
};

export const customerUpsert = async (job: Job<{ companyId: string }>) => {
  const companyId = filterString(job.data.companyId);
  if (!companyId)
    throw new Error(`[JOB:pes-customer-upsert] No companyId provided`);
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      companyPersons: {
        include: {
          person: true,
        },
        where: {
          invoiceRecipient: { equals: true },
        },
      },
      contactAddresses: true,
      contactCommunicationWays: true,
    },
  });
  if (!company)
    throw new Error(`[JOB:pes-customer-upsert] Company with ID ${companyId} not found`);
  const invoiceRecipient = company.companyPersons.at(0)?.person ?? null;
  const companyVm = companyToViewModel(company);
  const customer = (await pesBaseRequest('/customer', 'GET', { query: { externalId: company.customerId } }))
    .items.at(0) ?? null;
  const email = companyVm.communicationWays.find(o => o.type === 'EMAIL' && o.category === 'INVOICING')
    ?? companyVm.communicationWays.find(o => o.type === 'EMAIL' && o.category === 'WORK')
    ?? companyVm.communicationWays.find(o => o.type === 'EMAIL')
    ?? null;
  const address = companyVm.addresses.find(o => o.category === 'INVOICE')
    ?? companyVm.addresses.find(o => o.category === 'HEADQUARTER')
    ?? companyVm.addresses.find(o => o.category === 'WORK')
    ?? companyVm.addresses.at(0)
    ?? null;
  await pesBaseRequest(`/customer/${customer?.id ?? ''}`, (customer !== null) ? 'PATCH' : 'POST', { body: {
    ...(customer ?? {}),
    externalId: company.customerId,
    vatId: filterString(company.vatId),
    taxId: filterString(company.taxId),
    companyName: company.name,
    firstname: invoiceRecipient?.firstname ?? null,
    surname: invoiceRecipient?.familyname ?? invoiceRecipient?.surename ?? null,
    email: filterString(email?.value),
    address: filterString(address?.address),
    address2: filterString(address?.address2),
    zipCode: filterString(address?.zipCode),
    city: filterString(address?.city),
    // TODO: state: address?.state ?? null,
    country: filterString(address?.country),
  } });
};

export const customerDelete = async (job: Job<{ companyId: string }>) => {
  const companyId = filterString(job.data.companyId);
  if (!companyId)
    throw new Error(`[JOB:pes-customer-delete] No companyId provided`);
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company)
    throw new Error(`[JOB:pes-customer-delete] Company with ID ${companyId} not found`);
  const customer = (await pesBaseRequest('/customer', 'GET', { query: { externalId: company.customerId } }))
    .items.at(0) ?? null;
  if (!customer)
    throw new Error(`[JOB:pes-customer-delete] PES customer with customerId ${company.customerId} not found`);
  await pesBaseRequest(`/customer/${customer.id}`, 'DELETE');
};
