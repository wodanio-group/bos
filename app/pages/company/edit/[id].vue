<template>

  <Page 
    v-if="item"
    :title="$t('company.edit.title', { name: companyDisplayName(item) })"
    :subtitle="$t('company.edit.subtitle')">
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
import type { CompanyViewModel, ContactViewModel } from '~~/shared/types/contact';

definePageMeta({
  middleware: ['auth']
});

const toast = useToast();
const { item, upsert, loadItem } = useCrud<CompanyViewModel>({
  apiPath: '/api/company'
});
await loadItem();

const changedItem = ref<ContactViewModel | null>(null);
const onSave = async () => {
  try {
    if (!item.value || !changedItem)
      return;
    await upsert(changedItem.value as CompanyViewModel);
    toast.add({ type: 'success', title: $t('company.edit.toast.success') });
    navigateTo(`/company/${item.value.id}`);
  } catch (e) {
    toast.add({ type: 'error', title: $t('company.edit.toast.error') });
  }
};

</script>
