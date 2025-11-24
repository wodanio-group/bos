<template>

  <Page 
    v-if="item"
    :title="$t('person.edit.title', { name: item ? personDisplayName(item) : '?' })"
    :subtitle="$t('person.edit.subtitle')">
    <template #header>
      <atom-button
        type="button"
        icon="lucide:save"
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

const changedItem = ref<ContactViewModel | null>(null);
const onSave = async () => {
  try {
    if (!item.value || !changedItem)
      return;
    await upsert(changedItem.value as PersonViewModel);
    toast.add({ type: 'success', title: $t('person.edit.toast.success') });
    navigateTo(`/person/${item.value.id}`);
  } catch (e) {
    toast.add({ type: 'error', title: $t('person.edit.toast.error') });
  }
};

</script>
