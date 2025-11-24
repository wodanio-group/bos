<template>

  <Page
    v-if="item"
    :title="$t('company.item.title', { name: companyDisplayName(item) })"
    :subtitle="$t('company.item.subtitle')">

    <div class="col-span-8">
      <contact-note-section-box
        :notes="item.notes"
        @update="onUpdateNotes($event)">
      </contact-note-section-box>
    </div>

    <div class="col-span-4">
      <contact-info-section-box
        :contact="item"
        @edit="navigateTo(`/company/edit/${item.id}`)">
      </contact-info-section-box>
    </div>

  </Page>

</template>

<script setup lang="ts">

import type { CompanyViewModel, ContactNoteViewModel } from '~~/shared/types/contact';

definePageMeta({
  middleware: ['auth']
});

const toast = useToast();
const { item, upsert, loadItem } = useCrud<CompanyViewModel>({
  apiPath: '/api/company'
});
await loadItem();

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

</script>

