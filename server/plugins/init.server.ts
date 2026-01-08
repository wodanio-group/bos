import { prisma } from "~~/lib/prisma.server";
import { CountryViewModel } from "~~/shared/types/contact";
import { OptionKey, OptionValue } from "~~/shared/types/option";

export default defineNitroPlugin(async (nitroApp) => {

  const options: { key: OptionKey, value: OptionValue }[] = [
    { key: 'CUSTOMER_ID_COUNTER', value: { counter: 100001 } },
    { key: 'CUSTOMER_ID_SCHEMA', value: { schema: 'C%YYYY%COUNTER' } },
    { key: 'QUOTE_ID_COUNTER', value: { counter: 10001 } },
    { key: 'QUOTE_ID_SCHEMA', value: { schema: 'Q%YYYY%MM%COUNTER' } },
    { key: 'QUOTE_DEFAULT_TITLE', value: { value: 'Quote <%= quote.quoteId %>' } },
    { key: 'QUOTE_DEFAULT_INTRO_TEXT', value: { value: 'Dear Sir or Madam,<br><br>We would like to submit the following non-binding offer to you:' } },
    { key: 'QUOTE_DEFAULT_OUTRO_TEXT', value: { value: 'Best regards' } },
    { key: 'SYSTEM_CURRENCY', value: { value: 'EUR' } },
    { key: 'SYSTEM_UNITS', value: {
      units: [ 'pcs', 'hour', 'monthly', 'annually' ],
      default: 'pcs'
    } },
    { key: 'SYSTEM_TAX_RATES', value: {
      rates: [ 0, 7, 19 ],
      default: 19
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
