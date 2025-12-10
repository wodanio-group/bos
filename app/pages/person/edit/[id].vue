<template>

  <Page 
    v-if="item"
    :title="$t('person.edit.title', { name: item ? personDisplayName(item) : '?' })"
    :subtitle="$t('person.edit.subtitle')">
    <template #header>
      <atom-button
        type="button"
        icon="circle-x"
        :title="$t('general.cancel')"
        :outline="true"
        @click="navigateBack()">
      </atom-button>
      <atom-button
        type="button"
        icon="save"
        :title="$t('company.edit.save')"
        @click="onSave()">
      </atom-button>
    </template>

    <contact-edit
      :contact="item"
      @change="changedItem = $event">
    </contact-edit>

  </Page>

</template>

<script setup lang="ts">
import type { ContactViewModel, PersonViewModel } from '~~/shared/types/contact';


definePageMeta({
  middleware: ['auth']
});

const toast = useToast();
const { item, upsert, loadItem } = useCrud<PersonViewModel>({
  apiPath: '/api/person'
});
await loadItem();

const navigateBack = (id?: string) => navigateTo(`/person/${id ?? item.value?.id}`);

const changedItem = ref<ContactViewModel | null>(null);
const onSave = async () => {
  try {
    if (!item.value || !changedItem)
      return;
    const res = await upsert(changedItem.value as PersonViewModel);
    if (!res)
      throw new Error();
    toast.add({ type: 'success', title: $t('person.edit.toast.success') });
    navigateBack();
  } catch (e) {
    toast.add({ type: 'error', title: $t('person.edit.toast.error') });
  }
};

</script>
