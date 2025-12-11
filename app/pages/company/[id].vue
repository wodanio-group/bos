<template>

  <Page
    v-if="item"
    :title="$t('company.item.title', { name: companyDisplayName(item) })"
    :subtitle="$t('company.item.subtitle')">
    <template #header>
      <atom-button
        type="button"
        icon="trash-2"
        :title="$t('general.delete')"
        :outline="true"
        @click="showDeletePopover = true"
        v-if="hasRightContactAllDelete">
      </atom-button>
    </template>

    <div class="col-span-8">
      <contact-note-section-box
        :disable-changes="hasRightContactAllEdit !== true"
        :notes="item.notes"
        @update="onUpdateNotes($event)">
      </contact-note-section-box>
    </div>

    <div class="col-span-4">
      <contact-info-section-box
        :disable-edit="hasRightContactAllEdit !== true"
        :contact="item"
        @edit="navigateTo(`/company/edit/${item.id}`)">
      </contact-info-section-box>
    </div>

    <SimpleAlertDialog
      :open="showDeletePopover === true"
      :title="$t('company.item.delete.title', { name: item ? companyDisplayName(item) : '?' })"
      :description="$t('company.item.delete.description')"
      :submitButtonTitle="$t('general.delete')"
      submitButtonIcon="trash-2"
      @submit="onDelete"
      @cancel="showDeletePopover = false"
      @update:open="showDeletePopover = $event"/>

  </Page>

</template>

<script setup lang="ts">

import type { CompanyViewModel, ContactNoteViewModel } from '~~/shared/types/contact';

definePageMeta({
  middleware: ['auth']
});

const auth = useAuth();
const user = await auth.getUser();
const toast = useToast();
const { item, upsert, loadItem, deleteById } = useCrud<CompanyViewModel>({
  apiPath: '/api/company'
});
await loadItem();

const hasRightContactAllEdit = computed(() => user && user.rights.includes('contact.all.edit')),
      hasRightContactAllDelete = computed(() => user && user.rights.includes('contact.all.delete'));

const onUpdateNotes = async (notes: Partial<ContactNoteViewModel>[]) => {
  try {
    if (!item.value)
      return;
    await upsert({
      ...item.value,
      notes: notes as any
    });
    await loadItem();
    toast.add({ type: 'success', title: $t('company.notes.toast.success') });
  } catch (e) {
    toast.add({ type: 'error', title: $t('company.notes.toast.error') });
  }
}

const showDeletePopover = ref(false);
const onDelete = async () => {
  try {
    if (!item.value)
      return;
    await deleteById(item.value.id);
    toast.add({ type: 'success', title: $t('company.item.delete.success') });
    navigateTo(`/company`);
  } catch (e) {
    toast.add({ type: 'error', title: $t('company.item.delete.error') });
  }
};

</script>

