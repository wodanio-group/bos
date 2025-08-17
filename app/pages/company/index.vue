<template>

  <Page :title="$t('company.title')">

    <DataSectionBox
      class="col-span-12"
      :items="items"
      addActionKey="openAdd"
      itemClickActionKey="view"
      :fields="[
        { title: $t('general.name'), fieldName: 'name', transform: (v, o) => companyDisplayName(o) },
      ]"
      :actions="[
        { title: $t('general.view'), icon: 'lucide:external-link', key: 'view' },
        { title: $t('general.delete'), icon: 'lucide:trash-2', key: 'requestDelete' },
      ]"
      :paginationState="pagination"
      :paginationIsFirst="paginationIsFirst"
      :paginationIsLast="paginationIsLast"
      @update:paginationState="paginationSet"
      @updateSearch="searchSet"
      @action="actionHandler">
    </DataSectionBox>

  </Page>

</template>

<script setup lang="ts">

import type { CompanyViewModel } from '~~/shared/types/contact';
import { companyDisplayName } from '#imports';

definePageMeta({
  middleware: ['auth']
});

const { 
  items, 
  loadItems,
  pagination,
  paginationIsFirst,
  paginationIsLast,
  paginationSet,
  searchSet,
} = useCrud<CompanyViewModel>({
  apiPath: '/api/company'
});
await loadItems();

const actionHandler = async (key: string, item?: CompanyViewModel | null) => { switch (key) {
  case 'openAdd':
    break;
  case 'view':
    if (!item) return;
    navigateTo(`/company/${item.id}`);
    break;
  case 'requestDelete':
    break;
} };

</script>

