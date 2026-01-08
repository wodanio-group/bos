import { DateTime } from "luxon";
import { getOptions, setOptions } from "./option";

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
