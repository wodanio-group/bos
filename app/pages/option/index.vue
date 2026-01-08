<template>

  <Page :title="$t('option.title')">

    <DataSectionBox
      class="col-span-12"
      :items="items"
      itemClickActionKey="openEdit"
      :hideAddButton="true"
      :fields="[
        { title: $t('general.id'), fieldName: 'key' },
        { title: $t('general.value'), fieldName: 'value', transform: (v: any) => JSON.stringify(v) },
        { title: $t('general.updatedAt'), fieldName: 'updatedAt', transform: (v: string | null) => (v ? DateTime.fromISO(v).toFormat($t('format.datetime')) : null) },
      ]"
      :actions="[
        { title: $t('general.edit'), icon: 'edit', key: 'openEdit' },
      ]"
      :hidePagination="true"
      @action="actionHandler">
    </DataSectionBox>

    <Dialog
      :open="selectedEditItem !== undefined"
      @update:open="actionHandler($event ? '' : 'closeEdit')">
      <template #headerLeft>
        <p class="text-lg text-secondary-600">{{ $t('option.editTitle', { key: selectedEditItem?.key ?? '?' }) }}</p>
      </template>
      <form
        class="flex flex-col gap-2"
        @submit.prevent="actionHandler('edit')">

        <div class="flex flex-col gap-1">
          <label class="text-sm text-secondary-600">{{ $t('general.id') }}</label>
          <p class="text-base text-primary-950 font-medium">{{ selectedEditItem?.key }}</p>
        </div>

        <atom-textarea
          :required="true"
          :title="$t('general.value')"
          :rows="10"
          v-model="editFormValue"
          :placeholder="$t('option.valuePlaceholder')"/>

        <p class="text-xs text-secondary-500">{{ $t('option.valueHint') }}</p>

        <div class="flex justify-end mt-2">
          <atom-button
            type="submit"
            icon="save"
            :title="$t('general.save')">
          </atom-button>
        </div>
      </form>
    </Dialog>

  </Page>

</template>

<script setup lang="ts">

import type { OptionViewModel } from '~~/shared/types/option';
import { DateTime } from 'luxon';

definePageMeta({
  middleware: ['auth']
});

const toast = useToast();

const items = ref<OptionViewModel[]>([]);

const loadItems = async () => {
  try {
    items.value = await $fetch<OptionViewModel[]>('/api/option', {
      method: 'GET',
    });
  } catch (e) {
    console.error('Failed to load options', e);
  }
};

const updateOption = async (key: string, value: any): Promise<boolean> => {
  try {
    await $fetch(`/api/option/${key}`, {
      method: 'PATCH',
      body: { value }
    });
    return true;
  } catch (e) {
    console.error('Failed to update option', e);
    return false;
  }
};

await loadItems();

const selectedEditItem = useState<OptionViewModel | null | undefined>('optionSelectedEditItem', () => undefined);
const editFormValue = useState<string>('optionEditFormValue', () => '');

const actionHandler = async (key: string, item?: OptionViewModel | null) => { switch (key) {
  case 'edit':
    try {
      const parsedValue = JSON.parse(editFormValue.value);

      if (!selectedEditItem.value?.key)
        return toast.add({ type: 'error', title: $t('option.error.upsert') });

      const success = await updateOption(selectedEditItem.value.key, parsedValue);

      if (!success)
        return toast.add({ type: 'error', title: $t('option.error.upsert') });

      await loadItems();
      selectedEditItem.value = undefined;
      editFormValue.value = '';
      toast.add({ type: 'success', title: $t('option.success.upsert') });
    } catch (e) {
      toast.add({ type: 'error', title: $t('option.error.invalidJson') });
    }
    break;
  case 'openEdit':
    selectedEditItem.value = item ?? null;
    editFormValue.value = item ? JSON.stringify(item.value, null, 2) : '';
    break;
  case 'closeEdit':
    selectedEditItem.value = undefined;
    editFormValue.value = '';
    break;
} }

</script>
