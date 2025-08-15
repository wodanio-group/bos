import type { OptionKey, OptionSet } from "../types/option";
import prisma from "~~/lib/prisma";

export const getOptions = async (keys: OptionKey[]): Promise<OptionSet[]> => (await prisma.option.findMany({
  where: { key: { in: keys } }
})).map(o => ({ key: o.key, value: o.value }));

export const setOptions = async (sets: OptionSet[]): Promise<void> => {
  for (const set of sets) {
    await prisma.option.upsert({
      where: { 
        key: set.key 
      },
      create: {
        key: set.key,
        value: set.value
      },
      update: {
        key: set.key,
        value: set.value
      },
    });
  }
};
