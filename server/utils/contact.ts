import { DateTime } from "luxon";
import { getOptions, setOptions } from "./option";

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
