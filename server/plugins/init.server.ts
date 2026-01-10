import { prisma } from "~~/lib/prisma.server";
import { CountryViewModel } from "~~/shared/types/contact";
import { OptionKey, OptionValue } from "~~/shared/types/option";

export default defineNitroPlugin(async (nitroApp) => {

  const options: { key: OptionKey, value: OptionValue, public?: boolean }[] = [
    { key: 'CUSTOMER_ID_COUNTER', value: { counter: 100001 } },
    { key: 'CUSTOMER_ID_SCHEMA', value: { schema: 'C%YYYY%COUNTER' } },
    { key: 'QUOTE_ID_COUNTER', value: { counter: 10001 } },
    { key: 'QUOTE_ID_SCHEMA', value: { schema: 'Q%YYYY%MM%COUNTER' } },
    { key: 'QUOTE_DEFAULT_INTRO_TEXT', value: { value: 'Sehr geehrte Damen und Herren,\n\nwir möchten Ihnen das folgende freibleibende Angebot unterbreiten:' }, public: true },
    { key: 'QUOTE_DEFAULT_OUTRO_TEXT', value: { value: 'Beste Grüße\n{{owner.displayName}}\n{{companyInfo.companyName}}' }, public: true },
    { key: 'SYSTEM_CURRENCY', value: { value: 'EUR' }, public: true },
    { key: 'SYSTEM_UNITS', value: {
      units: [ 'Stk.', 'Std.', 'monatlich', 'jährlich' ],
      default: 'Stk.'
    }, public: true },
    { key: 'SYSTEM_TAX_RATES', value: {
      rates: [ 0, 0.07, 0.19 ],
      default: 0.19
    }, public: true },
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
    }, public: true },
  ];

  const countries: CountryViewModel[] = [
    { isoCode: 'DE' },
    { isoCode: 'CH' },
    { isoCode: 'AT' },
  ];

  for (const option of options) {
    await prisma.option.upsert({
      where: { key: option.key },
      update: {
        public: option.public === true,
      },
      create: {
        key: option.key,
        value: option.value,
        public: option.public === true,
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
