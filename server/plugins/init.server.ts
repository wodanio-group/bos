import { prisma } from "~~/lib/prisma.server";
import { CountryViewModel } from "~~/shared/types/contact";
import { OptionKey, OptionValue } from "~~/shared/types/option";

export default defineNitroPlugin(async (nitroApp) => {

  const options: { key: OptionKey, value: OptionValue }[] = [
    { key: 'CUSTOMER_ID_COUNTER', value: { counter: 100001 } },
    { key: 'CUSTOMER_ID_SCHEMA', value: { schema: 'C%YYYY%COUNTER' } },
    { key: 'QUOTE_ID_COUNTER', value: { counter: 10001 } },
    { key: 'QUOTE_ID_SCHEMA', value: { schema: 'Q%YYYY%MM%COUNTER' } },
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
