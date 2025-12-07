<template>

  <Page 
    v-if="item"
    :title="$t('company.edit.title', { name: companyDisplayName(item) })"
    :subtitle="$t('company.edit.subtitle')">
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
import type { CompanyViewModel, ContactViewModel } from '~~/shared/types/contact';

definePageMeta({
  middleware: ['auth']
});

const toast = useToast();
const { item, upsert, loadItem } = useCrud<CompanyViewModel>({
  apiPath: '/api/company'
});
await loadItem();

const navigateBack = (id?: string) => navigateTo(`/company/${id ?? item.value?.id}`);

const changedItem = ref<ContactViewModel | null>(null);
const onSave = async () => {
  try {
    if (!item.value || !changedItem)
      return;
    await upsert(changedItem.value as CompanyViewModel);
    toast.add({ type: 'success', title: $t('company.edit.toast.success') });
    navigateBack();
  } catch (e) {
    toast.add({ type: 'error', title: $t('company.edit.toast.error') });
  }
};

</script>
