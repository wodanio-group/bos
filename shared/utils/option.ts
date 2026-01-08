import type { OptionViewModel } from "../types/option";
import type { Option } from "~~/lib/prisma.server";
import { z } from "zod";

export const optionKeyValidator = z.enum([
  'CUSTOMER_ID_COUNTER', 'CUSTOMER_ID_SCHEMA', 
  'QUOTE_ID_COUNTER', 'QUOTE_ID_SCHEMA', 'QUOTE_DEFAULT_TITLE', 'QUOTE_DEFAULT_INTRO_TEXT', 'QUOTE_DEFAULT_OUTRO_TEXT',
  'SYSTEM_CURRENCY', 'SYSTEM_UNITS', 'SYSTEM_TAX_RATES',
]);

export const optionToViewModel = (item: Option): OptionViewModel => {
  return {
    key: item.key,
    value: item.value,
    updatedAt: (new Date(item.updatedAt)).toISOString(),
  };
}
