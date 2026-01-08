import { computed, useState } from "#imports";
import type { OptionViewModel, OptionKey } from "~~/shared/types/option";

export const useOption = (key: OptionKey) => {

  const itemState = useState<OptionViewModel | null>(`optionItem${key}`, () => null);
  const item = computed(() => itemState.value);

  const loadItem = async () => {
    try {
      itemState.value = (await $fetch<OptionViewModel>(`/api/option/${key}`, {
        method: 'GET'
      }));
    } catch (e) {
      itemState.value = null;
    }
  };

  const upsert = async (value: any): Promise<OptionViewModel> => {
    return (await $fetch<OptionViewModel>(`/api/option/${key}`, {
      method: 'PATCH',
      body: { value }
    }));
  };

  return {
    item,
    loadItem,
    upsert,
  };
};
