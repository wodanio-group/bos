import type { OptionKey as OrmOptionKey } from "~~/lib/prisma.server";

export type OptionKey = OrmOptionKey;

export type OptionValue = any;

export type OptionSet = {
  key: OptionKey;
  value: OptionValue;
};
