import { DateTime } from "luxon";
import { getOptions, setOptions } from "./option";
import type { Company, ContactAddress, Country, Quote, QuoteItem, User } from "~~/lib/prisma.server";
import { generatePdf, PdfTemplateKey } from "./pdf";
import { countryDisplayNameByCode } from "~~/shared/utils/contact";

export const getNextAvailableQuoteId = async (): Promise<string> => {
  const opts = await getOptions(['QUOTE_ID_COUNTER', 'QUOTE_ID_SCHEMA']),
        counter = opts.find(o => o.key === 'QUOTE_ID_COUNTER')!.value.counter,
        schema = opts.find(o => o.key === 'QUOTE_ID_SCHEMA')!.value.schema;
  return schema
    .replace('%YYYY', DateTime.now().toFormat('yyyy'))
    .replace('%YY', DateTime.now().toFormat('yy'))
    .replace('%MM', DateTime.now().toFormat('LL'))
    .replace('%COUNTER', counter);
}

export const increaseQuoteId = async (): Promise<void> => {
  const opts = await getOptions(['QUOTE_ID_COUNTER']),
        counter = Number(opts.find(o => o.key === 'QUOTE_ID_COUNTER')!.value.counter);
  await setOptions([{
    key: 'QUOTE_ID_COUNTER',
    value: { counter: (counter + 1) }
  }]);
}

export const generateQuotePdf = async (quote: Quote & {
  quoteItems: QuoteItem[], 
  company: Company & { 
    contactAddresses: ContactAddress[],
  },
  owner: User | null,
}): Promise<Uint8Array> => {
  const runtimeConfig = useRuntimeConfig();
  const opts = await getOptions(['COMPANY_INFO', 'SYSTEM_CURRENCY']);
  const companyInfo = {
    ...(opts.find(o => o.key === 'COMPANY_INFO')?.value ?? {}),
    companyLogo: filterString(runtimeConfig.public.logoUrl),
    companyCurrency: filterString(opts.find(o => o.key === 'SYSTEM_CURRENCY')?.value?.value),
  };

  return (await generatePdf(PdfTemplateKey.QUOTE, {
    companyInfo,
    sender: {
      addressLine: [
        companyInfo.companyName,
        companyInfo.companyAddress,
        `${companyInfo.companyZipCode} ${companyInfo.companyCity}`,
        companyInfo.companyCountry,
      ].map(o => filterString(o)).filter(o => o !== null).join(', '),
    },
    customer: {
      ...quote.company,
      displayName: companyDisplayName(quote.company),
      address: {
        ...quote.company.contactAddresses.at(0),
        countryDisplayName: quote.company.contactAddresses[0] ? countryDisplayNameByCode(quote.company.contactAddresses[0].countryId) : null,
      },
    },
    owner: {
      ...quote.owner,
      displayName: quote.owner ? userDisplayName(quote.owner) : null,
    },
    quote,
  }));
}
