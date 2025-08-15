import type { OptionKey as OrmOptionKey } from "@prisma/client";

export type OptionKey = OrmOptionKey;

export type OptionValue = any;

export type OptionSet = {
  key: OptionKey;
  value: OptionValue;
};
