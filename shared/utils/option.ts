import type { OptionViewModel } from "../types/option";
import type { Option } from "~~/lib/prisma.server";
import { z } from "zod";

export const optionKeyValidator = z.enum(['CUSTOMER_ID_COUNTER', 'CUSTOMER_ID_SCHEMA']);

export const optionToViewModel = (item: Option): OptionViewModel => {
  return {
    key: item.key,
    value: item.value,
    updatedAt: (new Date(item.updatedAt)).toISOString(),
  };
}
