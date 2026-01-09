import { prisma } from "~~/lib/prisma.server";
import { CountryViewModel } from "~~/shared/types/contact";
import { OptionKey, OptionValue } from "~~/shared/types/option";

export default defineNitroPlugin(async (nitroApp) => {

  const options: { key: OptionKey, value: OptionValue }[] = [
    { key: 'CUSTOMER_ID_COUNTER', value: { counter: 100001 } },
    { key: 'CUSTOMER_ID_SCHEMA', value: { schema: 'C%YYYY%COUNTER' } },
    { key: 'QUOTE_ID_COUNTER', value: { counter: 10001 } },
    { key: 'QUOTE_ID_SCHEMA', value: { schema: 'Q%YYYY%MM%COUNTER' } },
    { key: 'QUOTE_DEFAULT_TITLE', value: { value: 'Quote {{quote.quoteId}}' } },
    { key: 'QUOTE_DEFAULT_INTRO_TEXT', value: { value: 'Dear Sir or Madam,\n\nWe would like to submit the following non-binding offer to you:' } },
    { key: 'QUOTE_DEFAULT_OUTRO_TEXT', value: { value: 'Best regards\n{{owner.displayName}}\n{{companyInfo.companyName}}' } },
    { key: 'SYSTEM_CURRENCY', value: { value: 'EUR' } },
    { key: 'SYSTEM_UNITS', value: {
      units: [ 'pcs', 'hour', 'monthly', 'annually' ],
      default: 'pcs'
    } },
    { key: 'SYSTEM_TAX_RATES', value: {
      rates: [ 0, 7, 19 ],
      default: 19
    } },
    { key: 'COMPANY_INFO', value: {
      companyName: 'Example Inc.',
      companyAddress: 'Sample Street 1',
      companyAddress2: null,
      companyZipCode: '12345',
      companyCity: 'Sample City',
      companyCountry: 'Germany',
      companyPhoneNumber: '+49 (0)1234 56789',
      companyFax: null,
      companyEmail: 'me@example.com',
      companyWebsite: 'www.example.com',
      registryCourt: null,
      registerNumber: null,
      vatId: null,
      management: null,
      bankName: 'Sample Bank',
      iban: 'DE00 0000 0000 0000 0000 00',
      bic: 'XXXXXXXXXXX',
    } },
  ];

  const countries: CountryViewModel[] = [
    { isoCode: 'DE' },
    { isoCode: 'CH' },
    { isoCode: 'AT' },
  ];

  for (const option of options) {
    await prisma.option.upsert({
      where: { key: option.key },
      update: {},
      create: {
        key: option.key,
        value: option.value
      }
    });
  }

  for (const country of countries) {
    await prisma.country.upsert({
      where: { isoCode: country.isoCode },
      update: country,
      create: country
    });
  }

});
